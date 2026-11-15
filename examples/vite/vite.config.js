import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cdnCgiImage from 'cdn-cgi-image-dev/vite';

export default defineConfig({
  plugins: [svelte(), cdnCgiImage()],
});
