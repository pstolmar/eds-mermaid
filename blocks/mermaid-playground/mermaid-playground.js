// blocks/mermaid-playground/mermaid-playground.js

async function loadMermaid() {
  if (window.mermaid) {
    return window.mermaid;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Mermaid from CDN'));
    document.head.appendChild(script);
  });

  window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
  return window.mermaid;
}

function createUi(block) {
  const container = document.createElement('div');
  container.className = 'mermaid-playground';

  const editor = document.createElement('div');
  editor.className = 'mermaid-playground-editor';

  const label = document.createElement('label');
  label.setAttribute('for', 'mermaid-playground-source');
  label.textContent = 'Mermaid definition';

  const textarea = document.createElement('textarea');
  textarea.id = 'mermaid-playground-source';
  textarea.value = [
    'graph TD',
    '  A[Start] --> B{Mermaid OK?}',
    '  B -->|Yes| C[Render SVG]',
    '  B -->|No| D[Debug]',
    '  D --> B',
  ].join('\n');

  editor.appendChild(label);
  editor.appendChild(textarea);

  const controls = document.createElement('div');
  controls.className = 'mermaid-playground-controls';

  const renderButton = document.createElement('button');
  renderButton.type = 'button';
  renderButton.textContent = 'Render diagram';

  const downloadButton = document.createElement('button');
  downloadButton.type = 'button';
  downloadButton.textContent = 'Download SVG';

  controls.appendChild(renderButton);
  controls.appendChild(downloadButton);

  const outputWrapper = document.createElement('div');
  outputWrapper.className = 'mermaid-playground-output-wrapper';

  const output = document.createElement('div');
  output.className = 'mermaid-playground-output';
  output.textContent = 'Diagram will appear here…';

  outputWrapper.appendChild(output);

  container.appendChild(editor);
  container.appendChild(controls);
  container.appendChild(outputWrapper);

  block.innerHTML = '';
  block.appendChild(container);

  return {
    textarea, output, renderButton, downloadButton,
  };
}

async function renderDiagram(textarea, output) {
  const code = textarea.value.trim();
  if (!code) {
    output.textContent = 'No Mermaid definition provided.';
    return;
  }

  output.textContent = 'Rendering diagram…';

  try {
    const mermaid = await loadMermaid();
    const id = `mermaid-playground-${Date.now()}`;
    const result = await mermaid.render(id, code);
    output.innerHTML = result.svg;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    output.textContent = `Error rendering Mermaid diagram: ${e.message}`;
  }
}

function downloadSvg(output) {
  const svgEl = output.querySelector('svg');
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
}

export default async function decorate(block) {
  const {
    textarea, output, renderButton, downloadButton,
  } = createUi(block);

  renderButton.addEventListener('click', () => {
    renderDiagram(textarea, output);
  });

  downloadButton.addEventListener('click', () => {
    downloadSvg(output);
  });

  // Initial render
  renderDiagram(textarea, output);
}
