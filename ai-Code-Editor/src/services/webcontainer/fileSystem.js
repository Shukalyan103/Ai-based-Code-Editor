/**
 * File system utilities for WebContainer.
 * Handles conversion between Zustand flat/nested path structures and WebContainer directory tree format,
 * as well as runtime file synchronization.
 */

/**
 * Converts a Zustand project object into the WebContainer FileSystemTree format.
 *
 * Example input:
 * {
 *   files: {
 *     "package.json": { content: "..." },
 *     "src/App.jsx": { content: "..." },
 *     "public/index.html": { content: "..." }
 *   },
 *   folders: {
 *     "src": true,
 *     "src/components": true
 *   }
 * }
 *
 * Example output:
 * {
 *   "package.json": { file: { contents: "..." } },
 *   "src": {
 *     directory: {
 *       "App.jsx": { file: { contents: "..." } }
 *     }
 *   },
 *   "public": {
 *     directory: {
 *       "index.html": { file: { contents: "..." } }
 *     }
 *   }
 * }
 */
export function projectToWebContainerFiles(projectData) {
  if (!projectData) return {};

  const files = projectData.files || {};
  const folders = projectData.folders || {};
  const root = {};

  // Helper to ensure a directory path exists in the tree
  const ensureDirectoryPath = (dirPath) => {
    if (!dirPath) return root;
    const parts = dirPath.split('/').filter(Boolean);
    let current = root;

    for (const part of parts) {
      if (!current[part]) {
        current[part] = { directory: {} };
      } else if (!current[part].directory) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }
    return current;
  };

  // 1. Process explicit folders
  for (const folderPath of Object.keys(folders)) {
    if (folderPath && typeof folderPath === 'string') {
      ensureDirectoryPath(folderPath.replace(/^\/+|\/+$/g, ''));
    }
  }

  // 2. Process all files
  for (const [filePath, fileObj] of Object.entries(files)) {
    if (!filePath || !fileObj) continue;

    const normalizedPath = filePath.replace(/^\/+/, '');
    const parts = normalizedPath.split('/').filter(Boolean);

    if (parts.length === 0) continue;

    const fileName = parts[parts.length - 1];
    const dirParts = parts.slice(0, -1);

    let currentDir = root;
    for (const part of dirParts) {
      if (!currentDir[part]) {
        currentDir[part] = { directory: {} };
      } else if (!currentDir[part].directory) {
        currentDir[part] = { directory: {} };
      }
      currentDir = currentDir[part].directory;
    }

    const content = typeof fileObj.content === 'string' ? fileObj.content : '';
    currentDir[fileName] = {
      file: {
        contents: content,
      },
    };
  }

  return root;
}

/**
 * Synchronize a single file write to the WebContainer filesystem.
 * Creates intermediate directories if they do not exist yet.
 */
export async function syncFileToWebContainer(webcontainer, filePath, content) {
  if (!webcontainer || !filePath) return;

  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const parts = normalizedPath.split('/').filter(Boolean);

  if (parts.length > 1) {
    const dirPath = `/${parts.slice(0, -1).join('/')}`;
    try {
      await webcontainer.fs.mkdir(dirPath, { recursive: true });
    } catch {
      // Ignore if directory already exists
    }
  }

  await webcontainer.fs.writeFile(normalizedPath, typeof content === 'string' ? content : '');
}

/**
 * Remove a file or directory from the WebContainer filesystem.
 */
export async function removeFileFromWebContainer(webcontainer, filePath) {
  if (!webcontainer || !filePath) return;

  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  try {
    await webcontainer.fs.rm(normalizedPath, { recursive: true, force: true });
  } catch (err) {
    console.warn(`[WebContainer FS] Failed to remove ${normalizedPath}:`, err);
  }
}

/**
 * Clean up existing files in WebContainer root except for node_modules when desirable.
 */
export async function cleanWebContainerFileSystem(webcontainer, preserveNodeModules = true) {
  if (!webcontainer) return;

  try {
    const entries = await webcontainer.fs.readdir('/', { withFileTypes: true });
    for (const entry of entries) {
      if (preserveNodeModules && entry.name === 'node_modules') {
        continue;
      }
      try {
        await webcontainer.fs.rm(`/${entry.name}`, { recursive: true, force: true });
      } catch (e) {
        console.warn(`[WebContainer FS] Error cleaning /${entry.name}:`, e);
      }
    }
  } catch (err) {
    console.warn('[WebContainer FS] Error reading root during clean:', err);
  }
}
