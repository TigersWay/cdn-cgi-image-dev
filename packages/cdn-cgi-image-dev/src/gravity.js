// @ts-check

/**
 * Cloudflare `gravity` (alias `g`), only used with fit=cover and fit=crop.
 *  - 'auto'  saliency detection (Cloudflare) -> approximated with sharp's attention strategy
 *  - 'face'  face detection (Cloudflare, RetinaFace) -> impossible to imitate, falls back to 'auto'
 *  - {x, y}  focal point, 0..1 from the top-left (sides and "XxY" are normalized to this)
 * @typedef {'auto'|'face'|{ x: number, y: number }} Gravity
 */

/** Sides are just focal points: "left" crops nothing from the left edge, centered vertically. */
const SIDES = {
  left: { x: 0, y: 0.5 },
  right: { x: 1, y: 0.5 },
  top: { x: 0.5, y: 0 },
  bottom: { x: 0.5, y: 1 },
  center: { x: 0.5, y: 0.5 }
};

const COORDS = /^(\d*\.?\d+)x(\d*\.?\d+)$/;

/** @param {number} n */
const clamp01 = (n) => Math.min(1, Math.max(0, n));

/**
 * Parse a gravity value: "auto", "face", "left|right|top|bottom|center" or "0.5x0.33".
 * @param {string} value
 * @returns {Gravity | undefined} undefined = invalid, ignored like any other bad value
 */
export function parseGravity(value) {
  if (value === 'auto' || value === 'face') return value;
  if (Object.hasOwn(SIDES, value)) return { .../** @type {any} */ (SIDES)[value] };
  const m = COORDS.exec(value);
  if (m) return { x: clamp01(Number(m[1])), y: clamp01(Number(m[2])) };
  return undefined;
}

/**
 * Cover a `width` x `height` box, keeping the focal point as close to the
 * center of the box as the image edges allow (what Cloudflare describes as
 * "preserve as much as possible around a point").
 *
 * Returns the size to resize the whole image to, then the box to extract from it.
 * `enlarge: false` (fit=crop) never scales the image up.
 *
 * @param {Object} p
 * @param {number} p.srcW  Source width (after EXIF rotation)
 * @param {number} p.srcH  Source height (after EXIF rotation)
 * @param {number} p.width
 * @param {number} p.height
 * @param {{ x: number, y: number }} p.focus
 * @param {boolean} p.enlarge
 */
export function focalCrop({ srcW, srcH, width, height, focus, enlarge }) {
  let scale = Math.max(width / srcW, height / srcH);
  if (!enlarge) scale = Math.min(scale, 1);

  const resizeW = Math.max(1, Math.round(srcW * scale));
  const resizeH = Math.max(1, Math.round(srcH * scale));
  const boxW = Math.min(width, resizeW);
  const boxH = Math.min(height, resizeH);

  const left = Math.min(resizeW - boxW, Math.max(0, Math.round(focus.x * resizeW - boxW / 2)));
  const top = Math.min(resizeH - boxH, Math.max(0, Math.round(focus.y * resizeH - boxH / 2)));

  return {
    resize: { width: resizeW, height: resizeH },
    extract: { left, top, width: boxW, height: boxH }
  };
}
