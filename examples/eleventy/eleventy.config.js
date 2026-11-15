import cdnCgiImage from 'cdn-cgi-image-dev/eleventy';

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/images');

  // Originals live in src/images, so /cdn-cgi/image/.../images/x.jpg -> src/images/x.jpg
  eleventyConfig.addPlugin(cdnCgiImage, { roots: ['src'] });

  return {
    dir: {
      input: 'src'
    }
  };
}
