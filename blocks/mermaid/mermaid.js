async function loadMermaid() {
  if (window.mermaid) {
    return window.mermaid;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Mermaid'));
    document.head.appendChild(script);
  });

  window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
  return window.mermaid;
}

function createDownloadButton(container, outputEl) {
  const controls = document.createElement('div');
  controls.className = 'mermaid-controls';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Download SVG';

  button.addEventListener('click', () => {
    const svgEl = outputEl.querySelector('svg');
    if (!svgEl) {
      return;
    }

    const serialized = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  controls.appendChild(button);
  container.appendChild(controls);
}

export default async function decorate(block) {
  const code = block.textContent.trim();
  block.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'mermaid-container';

  const outputEl = document.createElement('div');
  outputEl.className = 'mermaid-output';
  outputEl.textContent = 'Rendering diagram…';

  container.appendChild(outputEl);
  block.appendChild(container);

  try {
    const mermaid = await loadMermaid();
    const { svg } = await mermaid.render(`mermaid-block-${Date.now()}`, code);
    outputEl.innerHTML = svg;
  } catch (e) {
    outputEl.textContent = `Error rendering Mermaid diagram: ${e.message}`;
    // eslint-disable-next-line no-console
    console.error(e);
    return;
  }

  createDownloadButton(container, outputEl);
}
