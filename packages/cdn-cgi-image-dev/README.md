# cdn-cgi-image-dev

Emulates Cloudflare Image Transformations (`/cdn-cgi/image/<options>/<path>`)
in local dev servers, so the same URLs work in dev and in production.

## Installation

```bash
npm/pnpm/bun install cdn-cgi-image-dev
```

## Usage

### Vite

```js
import cdnCgiImage from 'cdn-cgi-image-dev/vite';
export default { plugins: [cdnCgiImage()] };
```

### Eleventy

```js
import cdnCgiImage from 'cdn-cgi-image-dev/eleventy';
export default (eleventyConfig) => {
  eleventyConfig.addPlugin(cdnCgiImage, { roots: ['src'] });
};
```

### Other servers (BrowserSync, Express...)

```js
import { createImageHandler } from 'cdn-cgi-image-dev';
app.use(createImageHandler({ roots: ['public'] }));
```

## Cloudflare & Features

- Supported transformations: `width`, `height`, `dpr`, `quality`, `format` (incl. `auto`), `fit`.
- Other options are ignored with a one-time warning.

## CHANGELOG

- **v0.2.0** 2026-11-18
  - Add `gravity` with auto, face (fallback to auto) and focal point

- **v0.1.0** 2026-11-16
  - Add short Cloudflare options for transformation (w/width, etc)
  - Add Cloudflare `_headers` for each demos
  - Correction `package.json` for publication

- **v0.0.1** 2026-11-15 _Initial upload_
