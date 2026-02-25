/* global document, window */

function loadMermaid() {
  if (window.mermaidLoaded) {
    return Promise.resolve(window.mermaid);
  }

  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = function () {
      if (!window.mermaid) {
        reject(new Error('Mermaid did not load correctly'));
        return;
      }
      window.mermaid.initialize({ startOnLoad: false });
      window.mermaidLoaded = true;
      resolve(window.mermaid);
    };
    script.onerror = function () {
      reject(new Error('Failed to load mermaid.js'));
    };
    document.head.appendChild(script);
  });
}

function getMermaidCode(block) {
  var codeElement = block.querySelector('pre, code');
  if (!codeElement) {
    return '';
  }
  return codeElement.textContent.trim();
}

function createDownloadButton(svgText) {
  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Download SVG';

  button.addEventListener('click', function () {
    var blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  return button;
}

export default async function decorate(block) {
  var code = getMermaidCode(block);
  if (!code) {
    return;
  }

  try {
    var mermaid = await loadMermaid();
    var id = 'mermaid-diagram-' + Date.now();

    mermaid.render(id, code, function (svgCode) {
      // Clear block and insert rendered SVG + button
      while (block.firstChild) {
        block.removeChild(block.firstChild);
      }

      var container = document.createElement('div');
      container.className = 'mermaid-diagram';

      // Insert SVG markup
      container.innerHTML = svgCode;

      var button = createDownloadButton(svgCode);

      block.appendChild(container);
      block.appendChild(button);
    });
  } catch (e) {
    // If mermaid fails, leave the original text so at least the code is visible
    // You can optionally render an error message here.
  }
}
