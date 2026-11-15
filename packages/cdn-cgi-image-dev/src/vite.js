// @ts-check
import { createImageHandler } from './core.js';

/**
 * @param {{ roots?: string[], maxDimension?: number }} [opts]
 *   `roots` defaults to Vite's publicDir (dev) / build.outDir (preview).
 * @returns {import('vite').Plugin}
 */
export default function cdnCgiImage(opts = {}) {
  return {
    name: 'cdn-cgi-image-dev',
    apply: 'serve', // never part of the production build

    configureServer(server) {
      const warn = (/** @type {string} */ msg) => server.config.logger.warn(msg);
      const roots = opts.roots ?? [server.config.publicDir];
      server.middlewares.use(createImageHandler({ ...opts, roots, warn }));
    },

    configurePreviewServer(server) {
      const warn = (/** @type {string} */ msg) => server.config.logger.warn(msg);
      const roots = opts.roots ?? [server.config.build.outDir];
      server.middlewares.use(createImageHandler({ ...opts, roots, warn }));
    }
  };
}
