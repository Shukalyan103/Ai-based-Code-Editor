/**
 * Project runtime detection and configuration.
 * WebContainer is strictly used ONLY for React projects (JSX, TSX, or React package.json dependencies).
 * All other projects (Static HTML/CSS/JS, Algorithm Sandboxes, generic JS) use the lightweight static preview engine.
 */

/**
 * Checks whether a project is a React-based project.
 * @param {Object} files - Project files map
 * @returns {boolean}
 */
export function isReactProject(files = {}) {
  const fileKeys = Object.keys(files);

  // 1. Check for JSX / TSX files
  const hasJsxOrTsx = fileKeys.some((f) =>
    f.endsWith('.jsx') ||
    f.endsWith('.tsx') ||
    f.includes('App.jsx') ||
    f.includes('App.tsx') ||
    f.includes('main.jsx') ||
    f.includes('main.tsx')
  );
  if (hasJsxOrTsx) return true;

  // 2. Check package.json for React dependencies
  const packageJsonEntry = files['package.json'] || files['/package.json'];
  if (packageJsonEntry && packageJsonEntry.content) {
    try {
      const pkg = JSON.parse(packageJsonEntry.content);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
      if (
        allDeps['react'] ||
        allDeps['react-dom'] ||
        allDeps['react-scripts'] ||
        allDeps['@vitejs/plugin-react']
      ) {
        return true;
      }
    } catch (e) {
      // Ignore JSON parse error
    }
  }

  // 3. Check for React imports in js files
  for (const key of fileKeys) {
    if (key.endsWith('.js') || key.endsWith('.ts')) {
      const content = files[key]?.content || '';
      if (
        content.includes("from 'react'") ||
        content.includes('from "react"') ||
        content.includes("require('react')") ||
        content.includes('import React')
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detect runtime configuration for a set of project files.
 * @param {Object} files - Map of file paths to { content: string }
 * @returns {Object} Runtime descriptor
 */
export function detectProjectRuntime(files = {}) {
  // ONLY React projects use WebContainer
  if (isReactProject(files)) {
    return {
      type: 'react',
      label: 'React Workspace (WebContainer)',
      needsNode: true,
      useWebContainer: true,
      installCommand: ['npm', 'install'],
      startCommand: ['npm', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', '3100'],
    };
  }

  // ALL other projects run via lightweight static preview (NO WebContainer)
  return {
    type: 'static',
    label: 'Static Preview',
    needsNode: false,
    useWebContainer: false,
    installCommand: null,
    startCommand: null,
  };
}

/**
 * Ensure project files contain the required scaffolding (package.json, index.html, vite.config.js)
 * when running a React project that might have been created without them.
 */
export function synthesizeProjectFiles(files = {}) {
  const synthesized = { ...files };
  const fileKeys = Object.keys(files);

  if (isReactProject(files)) {
    if (!synthesized['package.json'] && !synthesized['/package.json']) {
      synthesized['package.json'] = {
        content: JSON.stringify(
          {
            name: 'react-app',
            private: true,
            version: '0.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview',
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1',
            },
            devDependencies: {
              '@vitejs/plugin-react': '^4.3.4',
              vite: '^5.4.11',
            },
          },
          null,
          2
        ),
      };
    }

    if (!synthesized['index.html'] && !synthesized['/index.html']) {
      const entryJsx = fileKeys.find((f) => f.includes('main.') || f.includes('index.')) || 'src/main.jsx';
      synthesized['index.html'] = {
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Workspace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entryJsx.replace(/^\/+/, '')}"></script>
  </body>
</html>`,
      };
    }

    if (!synthesized['vite.config.js'] && !synthesized['/vite.config.js']) {
      synthesized['vite.config.js'] = {
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3100,
  },
});`,
      };
    }
  }

  return synthesized;
}

/**
 * Generate static HTML bundle with inlined/referenced CSS and JS for instant static preview.
 * Also includes an integrated console output runner for standalone JavaScript files (e.g. Algo Sandbox).
 */
export function buildStaticHtmlPreview(files = {}) {
  let html = files['index.html']?.content || files['/index.html']?.content || '';

  // If no index.html is found, check if there's any other HTML file
  if (!html) {
    const firstHtmlKey = Object.keys(files).find((k) => k.endsWith('.html'));
    if (firstHtmlKey) {
      html = files[firstHtmlKey]?.content || '';
    }
  }

  // Case 1: Standalone JavaScript project (e.g. index.js / algorithm challenge) without HTML
  if (!html) {
    const jsKey = Object.keys(files).find(
      (k) => (k.endsWith('.js') || k.endsWith('.ts')) && !k.endsWith('.config.js')
    );

    if (jsKey && files[jsKey]?.content) {
      const jsContent = files[jsKey].content;
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JS Sandbox Console</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #0d0d10;
      color: #e4e4e7;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #27272a;
      padding-bottom: 10px;
      margin-bottom: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .title {
      font-weight: 700;
      font-size: 13px;
      color: #a1a1aa;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
    }
    .log-entry {
      padding: 4px 8px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .log-entry:hover { background: #18181c; }
    .log-info { color: #f4f4f5; }
    .log-warn { color: #fcd34d; background: rgba(245, 158, 11, 0.1); }
    .log-error { color: #f87171; background: rgba(239, 68, 68, 0.1); font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">
      <span>JS Console Output</span>
      <span class="badge">${jsKey}</span>
    </div>
  </div>
  <div id="console-output"></div>

  <script>
    (function() {
      const output = document.getElementById('console-output');

      function appendLog(text, type) {
        const div = document.createElement('div');
        div.className = 'log-entry log-' + type;
        div.textContent = text;
        output.appendChild(div);
      }

      function formatArg(arg) {
        if (typeof arg === 'object' && arg !== null) {
          try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); }
        }
        return String(arg);
      }

      console.log = function(...args) {
        appendLog(args.map(formatArg).join(' '), 'info');
      };
      console.warn = function(...args) {
        appendLog(args.map(formatArg).join(' '), 'warn');
      };
      console.error = function(...args) {
        appendLog(args.map(formatArg).join(' '), 'error');
      };

      try {
        ${jsContent}
      } catch (err) {
        appendLog('Uncaught ' + err.name + ': ' + err.message, 'error');
      }
    })();
  </script>
</body>
</html>`;
    }

    // Default fallback placeholder
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #121214; color: #f4f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #18181c; border: 1px solid rgba(255,255,255,0.08); padding: 2rem 3rem; border-radius: 1rem; }
    h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
    p { margin: 0; color: #8c8c9e; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Preview Ready</h2>
    <p>Create an <code>index.html</code> or script file to see the preview.</p>
  </div>
</body>
</html>`;
  }

  // Case 2: HTML Project (inlines CSS and JS)
  const cssKeys = Object.keys(files).filter((k) => k.endsWith('.css'));
  let inlinedStyles = '';
  for (const cssKey of cssKeys) {
    const cssContent = files[cssKey]?.content || '';
    if (cssContent) {
      inlinedStyles += `\n<style data-source="${cssKey}">\n${cssContent}\n</style>\n`;
    }
  }

  const jsKeys = Object.keys(files).filter(
    (k) => (k.endsWith('.js') || k.endsWith('.ts')) && !k.includes('node_modules') && !k.endsWith('.config.js')
  );
  let inlinedScripts = '';
  for (const jsKey of jsKeys) {
    const jsContent = files[jsKey]?.content || '';
    if (jsContent) {
      const baseName = jsKey.split('/').pop();
      if (!html.includes(baseName)) {
        inlinedScripts += `\n<script data-source="${jsKey}">\n${jsContent}\n</script>\n`;
      }
    }
  }

  // Replace external relative CSS links with inline content if available
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel\s*=\s*["']stylesheet["']/i.test(tag)) return tag;
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      const cleanHref = hrefMatch[1].replace(/^\.\//, '').replace(/^\//, '');
      const matchedKey = Object.keys(files).find(
        (k) => k.replace(/^\/+/, '') === cleanHref || k.endsWith(cleanHref)
      );
      if (matchedKey && files[matchedKey]?.content) {
        return `<style data-source="${cleanHref}">\n${files[matchedKey].content}\n</style>`;
      }
    }
    return tag;
  });

  // Replace external relative script tags with inline scripts if available
  html = html.replace(/<script\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi, (tag, src) => {
    const cleanSrc = src.replace(/^\.\//, '').replace(/^\//, '');
    const matchedKey = Object.keys(files).find(
      (k) => k.replace(/^\/+/, '') === cleanSrc || k.endsWith(cleanSrc)
    );
    if (matchedKey && files[matchedKey]?.content) {
      return `<script data-source="${cleanSrc}">\n${files[matchedKey].content}\n</script>`;
    }
    return tag;
  });

  if (inlinedStyles && !html.includes(inlinedStyles)) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${inlinedStyles}</head>`);
    } else {
      html = `${inlinedStyles}${html}`;
    }
  }

  if (inlinedScripts && !html.includes(inlinedScripts)) {
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${inlinedScripts}</body>`);
    } else {
      html = `${html}${inlinedScripts}`;
    }
  }

  return html;
}
