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
