<script>
  const photos = [
    // cSpell:disable
    { file: 'lauren-kay-unsplash.jpg', alt: 'lauren-kay', code: 'width=640,format=auto' },
    { file: 'blue-eyes.jpg', alt: 'blue-eyes', code: 'width=400,height=400,fit=cover,gravity=face' },
    { file: 'sub/démonstration.png', alt: 'démonstration', code: 'width=640,format=auto' },
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
    {#each photos as { file, alt, code }}
      <figure>
        <code>{code}</code>
        <img
          src="/cdn-cgi/image/{code}/images/{file}"
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
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); align-items: center; margin-top: 2rem; }
  figure { margin: 0; }
  img { width: 100%; border-radius: 0.5rem; object-fit: cover; display: block; }
  figcaption { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }
</style>
