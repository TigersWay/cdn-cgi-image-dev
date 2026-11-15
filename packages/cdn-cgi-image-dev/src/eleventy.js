// @ts-check
import { createImageHandler } from './core.js';

/**
 * Eleventy plugin: eleventyConfig.addPlugin(cdnCgiImage, { roots: ['src'] })
 * Only active with --serve; never runs during a build.
 * Note: if you also call setServerOptions({ middleware }) yourself,
 * check that both middlewares end up registered.
 * @param {import("@11ty/eleventy/UserConfig").default} eleventyConfig
 * @param {{ roots?: string[], maxDimension?: number }} [opts]
 */
export default function cdnCgiImage(eleventyConfig, opts = {}) {
  const roots = opts.roots ?? ['src'];
  eleventyConfig.setServerOptions({
    middleware: [createImageHandler({ ...opts, roots })]
  });
}
