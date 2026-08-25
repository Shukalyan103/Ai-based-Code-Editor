import { getWebContainer, isCrossOriginIsolated } from './webcontainerManager';
import { projectToWebContainerFiles, syncFileToWebContainer, cleanWebContainerFileSystem } from './fileSystem';
import { detectProjectRuntime, buildStaticHtmlPreview, synthesizeProjectFiles } from './runtimeConfig';

/**
 * Hash utility for checking package.json modifications.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

class ProjectRuntimeManager {
  constructor() {
    this.activeProjectId = null;
    this.runtimeGeneration = 0;
    this.status = 'idle'; // 'idle' | 'mounting' | 'installing' | 'starting' | 'running' | 'error' | 'stopped'
    this.previewUrl = null;
    this.error = null;
    this.runtimeType = null;
    this.isStatic = false;
    this.staticHtml = null;

    this.installProcess = null;
    this.devProcess = null;
    this.serverReadyListener = null;

    // Cache to avoid reinstalling dependencies if package.json hasn't changed
    this.installedDependencies = new Map(); // projectId -> packageJsonHash

    // Subscribed state listeners
    this.listeners = new Set();
    this.logListeners = new Set();

    // Debounce timer for file sync
    this.fileSyncTimers = new Map();

    // Log batching to prevent main-thread freezing and memory spikes during rapid npm install
    this.pendingLogs = [];
    this.flushLogsTimer = null;
  }

  /**
   * Subscribe to runtime state changes.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to terminal logs.
   */
  subscribeLogs(listener) {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  /**
   * Broadcast state changes to all subscribers.
   */
  notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('[ProjectRuntime] Listener error:', err);
      }
    }
  }

  /**
   * Send a log chunk to subscribers with batching to avoid thousands of React renders per second.
   */
  log(text, stream = 'stdout') {
    this.pendingLogs.push({ text, stream, timestamp: Date.now() });

    if (!this.flushLogsTimer) {
      this.flushLogsTimer = setTimeout(() => {
        this.flushLogsTimer = null;
        if (this.pendingLogs.length === 0) return;
        const batch = this.pendingLogs;
        this.pendingLogs = [];
        for (const listener of this.logListeners) {
          try {
            listener(batch);
          } catch (err) {
            console.error('[ProjectRuntime] Log listener error:', err);
          }
        }
      }, 80);
    }
  }

  /**
   * Get snapshot of current runtime state.
   */
  getState() {
    return {
      activeProjectId: this.activeProjectId,
      status: this.status,
      previewUrl: this.previewUrl,
      error: this.error,
      runtimeType: this.runtimeType,
      isStatic: this.isStatic,
      staticHtml: this.staticHtml,
      generation: this.runtimeGeneration,
    };
  }

  /**
   * Safely terminate active install or dev processes.
   */
  async killProcesses() {
    if (this.devProcess) {
      try {
        this.devProcess.kill();
      } catch (e) {
        console.warn('[ProjectRuntime] Error killing devProcess:', e);
      }
      this.devProcess = null;
    }

    if (this.installProcess) {
      try {
        this.installProcess.kill();
      } catch (e) {
        console.warn('[ProjectRuntime] Error killing installProcess:', e);
      }
      this.installProcess = null;
    }
  }

  /**
   * Stop the currently running project.
   */
  async stopProject() {
    this.runtimeGeneration++;
    await this.killProcesses();
    this.status = 'stopped';
    this.previewUrl = null;
    this.staticHtml = null;
    this.notify();
    this.log('\n[Process stopped by user]\n', 'system');
  }

  /**
   * Start runtime execution for a specific project.
   * Handles project switching, singleton WebContainer mounting, dependency installation, and server startup.
   */
  async startProject(projectId, projectData) {
    if (!projectId || !projectData) {
      this.status = 'idle';
      this.activeProjectId = null;
      this.previewUrl = null;
      this.error = null;
      await this.killProcesses();
      this.notify();
      return;
    }

    // Increment generation token to invalidate any in-flight actions from previous runs
    this.runtimeGeneration++;
    const generation = this.runtimeGeneration;

    this.activeProjectId = projectId;
    this.error = null;
    this.previewUrl = null;
    this.staticHtml = null;

    // 1. Stop previous processes
    await this.killProcesses();

    const rawFiles = projectData.files || {};
    const files = synthesizeProjectFiles(rawFiles);
    const enhancedProjectData = { ...projectData, files };
    const runtimeConfig = detectProjectRuntime(files);
    this.runtimeType = runtimeConfig.type;
    this.isStatic = !runtimeConfig.needsNode;

    this.log(`\n=========================================\nStarting project: ${projectId} (${runtimeConfig.label})\n=========================================\n`, 'system');

    // 2. Handle Static HTML Project (No WebContainer needed)
    if (!runtimeConfig.needsNode) {
      this.status = 'running';
      this.staticHtml = buildStaticHtmlPreview(files);
      this.previewUrl = null; // Static preview uses staticHtml/srcdoc
      this.notify();
      this.log('Static preview generated successfully.\n', 'system');
      return;
    }

    // 3. Check Cross-Origin Isolation before attempting WebContainer boot
    if (!isCrossOriginIsolated()) {
      const errMsg =
        'Cross-Origin Isolation is required to run WebContainer. ' +
        'Please check that your Vite server has COOP and COEP headers enabled, or open the editor directly at its dev URL.';
      this.status = 'error';
      this.error = errMsg;
      this.notify();
      this.log(`\n[ERROR] ${errMsg}\n`, 'stderr');
      return;
    }

    try {
      // 4. Get Singleton WebContainer
      this.status = 'mounting';
      this.notify();
      this.log('Initializing WebContainer runtime...\n', 'system');

      const webcontainer = await getWebContainer();

      if (generation !== this.runtimeGeneration) {
        return; // Stale run cancelled by newer project selection
      }

      // 5. Convert & Mount Files
      this.log('Mounting project files into WebContainer...\n', 'system');
      const wcFiles = projectToWebContainerFiles(enhancedProjectData);

      // Clean old root directory to avoid leftover files from prior projects (preserving node_modules)
      await cleanWebContainerFileSystem(webcontainer, true);

      if (generation !== this.runtimeGeneration) return;

      await webcontainer.mount(wcFiles);

      if (generation !== this.runtimeGeneration) return;

      // 6. Check Dependencies (npm install)
      const packageJsonContent = files['package.json']?.content || files['/package.json']?.content;
      if (runtimeConfig.installCommand && packageJsonContent) {
        const pkgHash = simpleHash(packageJsonContent);
        const lastInstalledHash = this.installedDependencies.get(projectId);

        if (lastInstalledHash !== pkgHash) {
          this.status = 'installing';
          this.notify();
          this.log(`\n> ${runtimeConfig.installCommand.join(' ')}\n`, 'system');

          const installCmd = runtimeConfig.installCommand[0];
          const installArgs = runtimeConfig.installCommand.slice(1);

          this.installProcess = await webcontainer.spawn(installCmd, installArgs);

          this.installProcess.output.pipeTo(
            new WritableStream({
              write: (chunk) => {
                if (generation === this.runtimeGeneration) {
                  this.log(chunk, 'stdout');
                }
              },
            })
          );

          const exitCode = await this.installProcess.exit;
          this.installProcess = null;

          if (generation !== this.runtimeGeneration) return;

          if (exitCode !== 0) {
            throw new Error(`Dependency installation failed with exit code ${exitCode}`);
          }

          this.installedDependencies.set(projectId, pkgHash);
          this.log('\nDependencies installed successfully.\n', 'system');
        } else {
          this.log('Dependencies already installed and up to date. Skipping npm install.\n', 'system');
        }
      }

      if (generation !== this.runtimeGeneration) return;

      // 7. Start Dev Server / Run Command
      if (runtimeConfig.startCommand) {
        this.status = 'starting';
        this.notify();

        // Listen for server-ready event
        if (this.serverReadyListener) {
          // Clean up old listener if needed
        }

        const onServerReady = (port, url) => {
          if (generation === this.runtimeGeneration) {
            // Guard: Never load the host editor app inside the preview iframe (prevents infinite recursive OOM crash)
            if (typeof window !== 'undefined') {
              try {
                const urlObj = new URL(url);
                if (urlObj.origin === window.location.origin) {
                  this.log(`\n[Server Ready] Port ${port} is ready. WebContainer URL: ${url}\n`, 'system');
                  return;
                }
              } catch (e) {}
            }

            this.previewUrl = url;
            this.status = 'running';
            this.notify();
            this.log(`\n[Server Ready] Development server listening on ${url} (port ${port})\n`, 'system');
          }
        };

        webcontainer.on('server-ready', onServerReady);

        this.log(`\n> ${runtimeConfig.startCommand.join(' ')}\n`, 'system');
        const startCmd = runtimeConfig.startCommand[0];
        const startArgs = runtimeConfig.startCommand.slice(1);

        this.devProcess = await webcontainer.spawn(startCmd, startArgs);

        this.devProcess.output.pipeTo(
          new WritableStream({
            write: (chunk) => {
              if (generation === this.runtimeGeneration) {
                this.log(chunk, 'stdout');
              }
            },
          })
        );

        this.devProcess.exit.then((code) => {
          if (generation === this.runtimeGeneration) {
            this.log(`\n[Process exited with code ${code}]\n`, 'system');
            if (this.status === 'running' || this.status === 'starting') {
              this.status = code === 0 ? 'stopped' : 'error';
              if (code !== 0) {
                this.error = `Process exited with code ${code}`;
              }
              this.notify();
            }
          }
        });
      } else {
        this.status = 'running';
        this.notify();
      }
    } catch (err) {
      if (generation === this.runtimeGeneration) {
        console.error('[ProjectRuntime] Runtime error:', err);
        this.status = 'error';
        this.error = err.message || 'An unexpected error occurred in WebContainer runtime';
        this.notify();
        this.log(`\n[ERROR] ${this.error}\n`, 'stderr');
      }
    }
  }

  /**
   * Synchronize an edited file to WebContainer or update static preview.
   * Debounces disk writes to prevent excessive file system operations during fast typing.
   */
  syncFile(projectId, filePath, content, allFiles) {
    if (projectId !== this.activeProjectId) return;

    // Handle Static Preview
    if (this.isStatic) {
      if (this.fileSyncTimers.has(filePath)) {
        clearTimeout(this.fileSyncTimers.get(filePath));
      }

      const timer = setTimeout(() => {
        if (this.activeProjectId === projectId && this.isStatic) {
          const updatedFiles = { ...allFiles, [filePath]: { content } };
          this.staticHtml = buildStaticHtmlPreview(updatedFiles);
          this.notify();
        }
      }, 200);

      this.fileSyncTimers.set(filePath, timer);
      return;
    }

    // Handle WebContainer File Sync
    if (this.fileSyncTimers.has(filePath)) {
      clearTimeout(this.fileSyncTimers.get(filePath));
    }

    const timer = setTimeout(async () => {
      if (this.activeProjectId !== projectId) return;

      try {
        const webcontainer = await getWebContainer();
        await syncFileToWebContainer(webcontainer, filePath, content);
      } catch (err) {
        console.warn(`[ProjectRuntime] File sync failed for ${filePath}:`, err);
      }
    }, 150);

    this.fileSyncTimers.set(filePath, timer);
  }
}

// Export singleton instance
export const projectRuntime = new ProjectRuntimeManager();
