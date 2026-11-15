<script>
  const photos = [
    // cSpell:disable
    { file: 'lauren-kay-unsplash.jpg', alt: 'lauren-kay' },
    { file: 'blue-eyes.jpg', alt: 'blue-eyes' },
    { file: 'sub/démonstration.png', alt: 'démonstration' },
    // cSpell:enable
  ];

  // Real width of what the server sent back (proves the resize happened).
  let sizes = $state({});
</script>

<main>
  <h1>cdn-cgi-image-dev · Vite demo</h1>
  <p>
    Same URLs in dev and on Cloudflare: <code>/cdn-cgi/image/width=640,format=auto/images/&lt;path&gt;</code>
  </p>

  <div class="grid">
    {#each photos as { file, alt }}
      <figure>
        <img
          src="/cdn-cgi/image/width=640,format=auto/images/{file}"
          {alt}
          loading="lazy"
          onload={(e) => (sizes[file] = e.currentTarget.naturalWidth)}
        />
        <figcaption>{file}: {sizes[file] ?? '…'}px wide</figcaption>
      </figure>
    {/each}
  </div>
</main>

<style>
  main { font-family: system-ui, sans-serif; max-width: 72rem; margin: 2rem auto; padding: 0 1rem; }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); align-items: center; margin-top: 2rem; }
  figure { margin: 0; }
  img { width: 100%; border-radius: 0.5rem; object-fit: cover; display: block; }
  figcaption { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }
</style>
