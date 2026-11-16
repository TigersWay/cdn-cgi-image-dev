// @ts-check
import path from 'node:path';
import { stat, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { parseOptions, pickFormat, FIT } from './options.js';

const ROUTE = /^\/cdn-cgi\/image\/([^/]+)\/([^?#]+)/;

/**
 * Framework-agnostic (req, res, next) middleware. Works with Vite,
 * Eleventy's dev server, BrowserSync, Express/Connect...
 *
 * @param {Object} config
 * @param {string[]} config.roots      Folders searched in order for the original images.
 * @param {number} [config.maxDimension]
 * @param {(msg: string) => void} [config.warn]
 */
export function createImageHandler({ roots, maxDimension = 4096, warn = console.warn }) {
  const resolvedRoots = roots.map((r) => path.resolve(r));
  /** @type {Map<string, {data: Buffer, type: string}>} */
  const cache = new Map(); // TODO: persistent cache in node_modules/.cache
  const warned = new Set();

  /** @param {string} rel */
  async function locate(rel) {
    for (const root of resolvedRoots) {
      const file = path.resolve(root, rel);
      if (!file.startsWith(root + path.sep)) continue; // path traversal
      try {
        const s = await stat(file);
        if (s.isFile()) return { file, mtimeMs: s.mtimeMs };
      } catch {}
    }
    return null;
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   * @param {() => void} next
   */
  return async function cdnCgiImage(req, res, next) {
    const m = req.url && ROUTE.exec(req.url);
    if (!m) return next();

    try {
      const rel = decodeURIComponent(m[2]);
      if (/^https?:\/\//.test(rel)) return next(); // TODO: remote sources

      const found = await locate(rel);
      if (!found) return next();

      const { options, ignored } = parseOptions(m[1], { maxDimension });
      for (const key of ignored) {
        if (!warned.has(key)) {
          warned.add(key);
          warn(`[cdn-cgi-image] option "${key}" is not emulated in dev (ignored)`);
        }
      }

      const format = pickFormat(options.format, req.headers.accept);
      // Key on the normalized options (not the raw URL), so w=640 and width=640
      // share one entry. `options` is built in a fixed key order, so stringify is stable.
      const key = `${found.file}|${found.mtimeMs}|${format}|${JSON.stringify(options)}`;

      let hit = cache.get(key);
      if (!hit) {
        let img = sharp(await readFile(found.file)).rotate();
        if (options.width || options.height) {
          img = img.resize({
            width: options.width,
            height: options.height,
            fit: /** @type {any} */ (FIT[options.fit ?? 'scale-down']),
            withoutEnlargement: true
          });
        }
        const quality = options.quality ?? 85;
        if (format === 'avif')
          img = img.avif({ quality, effort: 2 }); // low effort = fast in dev
        else if (format === 'webp') img = img.webp({ quality });
        else if (format === 'jpeg') img = img.jpeg({ quality });
        else if (format === 'png') img = img.png();

        const { data, info } = await img.toBuffer({ resolveWithObject: true });
        // sharp reports AVIF as 'heif', so prefer the format we asked for
        hit = { data, type: `image/${format ?? info.format}` };
        cache.set(key, hit);
      }

      res.setHeader('Content-Type', hit.type);
      res.setHeader('Vary', 'Accept');
      res.end(hit.data);
    } catch (err) {
      warn(`[cdn-cgi-image] ${req.url}: ${/** @type {Error} */ (err).message}`);
      next();
    }
  };
}
