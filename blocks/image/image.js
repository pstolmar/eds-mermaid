// blocks/image/image.js

export default function decorate(block) {
  // Collect all text lines inside the block
  const lines = block.textContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    return;
  }

  // We use the LAST non-empty line as the source/alt info
  const last = lines[lines.length - 1];

  let alt = '';
  let src = last;

  // Optional "alt | src" format
  if (last.includes('|')) {
    const parts = last.split('|');
    alt = (parts[0] || '').trim();
    src = (parts[1] || '').trim();
  }

  if (!src) {
    return;
  }

  // Normalize src: if it doesn't start with http, ensure leading "/"
  if (!src.startsWith('http')) {
    if (!src.startsWith('/')) {
      src = `/${src}`;
    }
  }

  const img = document.createElement('img');
  img.src = src;
  if (alt) {
    img.alt = alt;
  }

  // Clear block and rebuild
  block.innerHTML = '';
  block.classList.add('image-block');
  block.appendChild(img);
}
