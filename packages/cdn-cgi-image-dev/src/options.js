// @ts-check

/**
 * @typedef {Object} ImageOptions
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [dpr]
 * @property {number} [quality]
 * @property {'auto'|'avif'|'webp'|'jpeg'|'png'} [format]
 * @property {string} [fit]
 */

/**
 * Cloudflare `fit` values mapped to sharp's.
 * @type {{ [key in NonNullable<ImageOptions['fit']>]: 'cover'|'contain'|'inside' }}
 * @see https://sharp.pixelplumbing.com/api-resize#fit
 * @see https://developers.cloudflare.com/images/cloudflare-images/image-optimization/resize-images/#fit
 */
export const FIT = {
  'scale-down': 'inside',
  contain: 'inside',
  cover: 'cover',
  crop: 'cover',
  pad: 'contain'
};

const FORMATS = new Set(['auto', 'avif', 'webp', 'jpeg', 'png']);
const SUPPORTED = new Set(['width', 'height', 'dpr', 'quality', 'format', 'fit']);

/**
 * Cloudflare short forms, resolved to the full option name.
 * `dpr`&`fit` are always written in full.
 * @type {Record<string, string>}
 */
const ALIASES = { w: 'width', h: 'height', q: 'quality', f: 'format' };

/**
 * Clamps a value/number between minimum and maximum values.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * Parse "width=640,format=auto" into validated options.
 * Unknown keys are reported in `ignored` so the caller can warn once.
 * @param {string} str
 * @param {{ maxDimension?: number }} [limits]
 * @returns {{ options: ImageOptions, ignored: string[] }}
 */
export function parseOptions(str, { maxDimension = 4096 } = {}) {
  /** @type {Record<string, string>} */
  const raw = {};
  /** @type {string[]} */
  const ignored = [];
  for (const pair of str.split(',')) {
    const i = pair.indexOf('=');
    if (i <= 0) continue;
    const key = pair.slice(0, i);
    const name = Object.hasOwn(ALIASES, key) ? ALIASES[key] : key; // w -> width, etc.
    if (SUPPORTED.has(name))
      raw[name] = pair.slice(i + 1); // if both forms are given, the last one wins
    else ignored.push(key);
  }

  /** @type {ImageOptions} */
  const options = {};
  const dpr = clamp(Number(raw.dpr) || 1, 1, 3);
  if (raw.width) options.width = clamp(Math.round(Number(raw.width) * dpr) || 1, 1, maxDimension);
  if (raw.height) options.height = clamp(Math.round(Number(raw.height) * dpr) || 1, 1, maxDimension);
  if (raw.quality) options.quality = clamp(Number(raw.quality) || 85, 1, 100);
  if (raw.format && FORMATS.has(raw.format)) options.format = /** @type {any} */ (raw.format);
  if (raw.fit && raw.fit in FIT) options.fit = raw.fit;

  return { options, ignored };
}

/**
 * `format=auto` negotiates through the Accept header, like Cloudflare does.
 * @param {string|undefined} requested
 * @param {string} [accept]
 * @returns {'avif'|'webp'|'jpeg'|'png'|null} null = keep the source format
 */
export function pickFormat(requested, accept = '') {
  if (requested && requested !== 'auto') return /** @type {any} */ (requested);
  if (accept.includes('image/avif')) return 'avif';
  if (accept.includes('image/webp')) return 'webp';
  return null;
}
