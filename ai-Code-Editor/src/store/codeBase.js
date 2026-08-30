import { create } from "zustand";
import { persist } from "zustand/middleware";
import { projectRuntime } from "../services/webcontainer/projectRuntime";

export const codeBase = create(
  persist(
    (set, get) => {
      return {
        promt: "",
        project: {},
        openTab: [],
        activeProject: null,
        activeFile: null,

        // Runtime state slice
        runtime: {
          status: "idle", // 'idle' | 'mounting' | 'installing' | 'starting' | 'running' | 'error' | 'stopped'
          project: null,
          previewUrl: null,
          error: null,
          runtimeType: null,
          isStatic: false,
          staticHtml: null,
          terminalLogs: [],
        },

        // Runtime control actions
        startRuntime: () => {
          const { activeProject, project } = get();
          if (activeProject && project[activeProject]) {
            projectRuntime.startProject(activeProject, project[activeProject]);
          }
        },

        stopRuntime: () => {
          projectRuntime.stopProject();
        },

        restartRuntime: () => {
          const { activeProject, project } = get();
          if (activeProject && project[activeProject]) {
            projectRuntime.startProject(activeProject, project[activeProject]);
          }
        },

        clearTerminalLogs: () => {
          set((state) => ({
            runtime: {
              ...state.runtime,
              terminalLogs: [],
            },
          }));
        },

        appendTerminalLog: (logEntry) => {
          set((state) => ({
            runtime: {
              ...state.runtime,
              terminalLogs: [...state.runtime.terminalLogs.slice(-1000), logEntry],
            },
          }));
        },

        addProject: (projectName) => {
          set((state) => ({
            project: {
              ...state.project,
              [projectName]: {
                files: {},
                folders: {},
                message: [],
              },
            },
            activeProject: projectName,
          }));

          const updatedProject = get().project[projectName];
          projectRuntime.startProject(projectName, updatedProject);
        },

        deleteProject: (fileName) => {
          const { activeProject } = get();
          if (activeProject === fileName) {
            projectRuntime.stopProject();
          }

          set((state) => {
            const newProject = { ...state.project };
            delete newProject[fileName];
            return {
              project: newProject,
              activeProject: state.activeProject === fileName ? null : state.activeProject,
            };
          });
        },

        renameProject: (oldName, newName) => {
          const { activeProject } = get();
          const isCurrentActive = activeProject === oldName;

          set((state) => {
            const projects = {
              ...state.project,
              [newName]: { ...state.project[oldName] },
            };
            delete projects[oldName];
            return {
              project: projects,
              activeProject: isCurrentActive ? newName : state.activeProject,
            };
          });

          if (isCurrentActive) {
            const updatedProject = get().project[newName];
            projectRuntime.startProject(newName, updatedProject);
          }
        },

        createFile: (projectName, fileName) => {
          set((state) => {
            const currentProject = state.project[projectName];
            if (!currentProject) return {};

            // Ensure parent folders exist in the folders map
            const parts = fileName.split("/");
            const newFolders = { ...currentProject.folders };
            let currentPath = "";
            for (let i = 0; i < parts.length - 1; i++) {
              currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
              newFolders[currentPath] = true;
            }

            const newFiles = {
              ...currentProject.files,
              [fileName]: {
                content: "",
              },
            };

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...currentProject,
                  files: newFiles,
                  folders: newFolders,
                },
              },
              openTab: state.openTab.includes(fileName) ? state.openTab : [...state.openTab, fileName],
              activeFile: fileName,
            };
          });

          // Sync empty file creation to runtime
          const allFiles = get().project[projectName]?.files || {};
          projectRuntime.syncFile(projectName, fileName, "", allFiles);
        },

        createFolder: (projectName, folderPath) =>
          set((state) => {
            const currentProject = state.project[projectName];
            if (!currentProject) return {};

            // Ensure intermediate directories are added
            const parts = folderPath.split("/");
            const newFolders = { ...currentProject.folders };
            let currentPath = "";
            for (let i = 0; i < parts.length; i++) {
              currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
              newFolders[currentPath] = true;
            }

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...currentProject,
                  folders: newFolders,
                },
              },
            };
          }),

        deleteFile: (projectName, fileName) => {
          set((state) => {
            const currentProject = state.project[projectName];
            if (!currentProject) return {};

            const newFiles = { ...currentProject.files };
            delete newFiles[fileName];
            const newOpenTab = state.openTab.filter((tab) => tab !== fileName);

            let activeFile = state.activeFile;
            if (activeFile === fileName) {
              const index = state.openTab.indexOf(fileName);
              if (newOpenTab.length === 0) {
                activeFile = null;
              } else if (index >= newOpenTab.length) {
                activeFile = newOpenTab[newOpenTab.length - 1];
              } else {
                activeFile = newOpenTab[index];
              }
            }

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...currentProject,
                  files: newFiles,
                },
              },
              openTab: newOpenTab,
              activeFile,
            };
          });
        },

        deleteFolder: (projectName, folderPath) =>
          set((state) => {
            const currentProject = state.project[projectName];
            if (!currentProject) return {};

            const newFiles = { ...currentProject.files };
            const newFolders = { ...currentProject.folders };

            // Delete folder itself and nested folders
            delete newFolders[folderPath];
            Object.keys(newFolders).forEach((path) => {
              if (path === folderPath || path.startsWith(`${folderPath}/`)) {
                delete newFolders[path];
              }
            });

            // Delete nested files
            Object.keys(newFiles).forEach((path) => {
              if (path === folderPath || path.startsWith(`${folderPath}/`)) {
                delete newFiles[path];
              }
            });

            const newOpenTab = state.openTab.filter(
              (path) => path !== folderPath && !path.startsWith(`${folderPath}/`)
            );

            let activeFile = state.activeFile;
            if (activeFile && (activeFile === folderPath || activeFile.startsWith(`${folderPath}/`))) {
              activeFile = newOpenTab.length > 0 ? newOpenTab[newOpenTab.length - 1] : null;
            }

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...currentProject,
                  files: newFiles,
                  folders: newFolders,
                },
              },
              openTab: newOpenTab,
              activeFile,
            };
          }),

        updateCode: (projectName, fileName, code) => {
          set((state) => {
            const currentProject = state.project[projectName];
            if (!currentProject) return {};

            const newFiles = {
              ...currentProject.files,
              [fileName]: {
                ...currentProject.files[fileName],
                content: code,
              },
            };

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...currentProject,
                  files: newFiles,
                },
              },
            };
          });

          // Synchronize file update with WebContainer or static preview
          const allFiles = get().project[projectName]?.files || {};
          projectRuntime.syncFile(projectName, fileName, code, allFiles);
        },

        updateMessage: (projectName, messages) =>
          set((state) => {
            if (!projectName || !state.project?.[projectName]) {
              return state;
            }
            const currentMessages = Array.isArray(state.project[projectName].message)
              ? state.project[projectName].message
              : [];

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...state.project[projectName],
                  message: [
                    ...currentMessages,
                    messages,
                  ],
                },
              },
            };
          }),

        appendMessageChunk: (projectName, chunk) =>
          set((state) => {
            if (!projectName || !state.project?.[projectName]) {
              return state;
            }
            const messages = Array.isArray(state.project[projectName].message)
              ? state.project[projectName].message
              : [];

            if (messages.length === 0) {
              return {
                project: {
                  ...state.project,
                  [projectName]: {
                    ...state.project[projectName],
                    message: [{ role: "ai", content: chunk }],
                  },
                },
              };
            }

            const lastMessage = messages[messages.length - 1];

            const updateMessage = [
              ...messages.slice(0, -1),
              {
                ...lastMessage,
                content: (lastMessage?.content || "") + chunk,
              },
            ];

            return {
              project: {
                ...state.project,
                [projectName]: {
                  ...state.project[projectName],
                  message: updateMessage,
                },
              },
            };
          }),

        openFiles: (filename) =>
          set((state) => ({
            activeFile: filename,
            openTab: state.openTab.includes(filename) ? state.openTab : [...state.openTab, filename],
          })),

        closeFiles: (filename) =>
          set((state) => {
            const index = state.openTab.indexOf(filename);
            const newTab = state.openTab.filter((tab) => tab !== filename);
            let activeFile = state.activeFile;

            if (state.activeFile === filename) {
              if (newTab.length === 0) {
                activeFile = null;
              } else if (index >= newTab.length) {
                activeFile = newTab[newTab.length - 1];
              } else {
                activeFile = newTab[index];
              }
            }

            return {
              openTab: newTab,
              activeFile,
            };
          }),

        colseFiles: (filename) => set(() => get().closeFiles(filename)),

        closeOtherTabs: (filename) =>
          set((state) => ({
            openTab: state.openTab.includes(filename) ? [filename] : [],
            activeFile: filename,
          })),

        closeAllTabs: () =>
          set(() => ({
            openTab: [],
            activeFile: null,
          })),

        setActiveProject: (projectName) => {
          const prevActive = get().activeProject;
          if (prevActive === projectName && projectName !== null) return;

          set(() => ({
            activeProject: projectName,
          }));

          if (projectName) {
            const selectedProj = get().project[projectName];
            if (selectedProj) {
              projectRuntime.startProject(projectName, selectedProj);
            }
          } else {
            projectRuntime.stopProject();
          }
        },

        setActiveFile: (fileName) =>
          set(() => ({
            activeFile: fileName,
          })),
      };
    },
    {
      name: "codeBase",
      getStorage: () => localStorage,
      partialize: (state) => ({
        promt: state.promt,
        project: state.project,
        openTab: state.openTab,
        activeProject: state.activeProject,
        activeFile: state.activeFile,
      }),
    }
  )
);

// Connect ProjectRuntime state subscriber to Zustand safely after store is created
projectRuntime.subscribe((runtimeState) => {
  codeBase.setState((state) => ({
    runtime: {
      ...(state?.runtime || {}),
      status: runtimeState.status,
      project: runtimeState.activeProjectId,
      previewUrl: runtimeState.previewUrl,
      error: runtimeState.error,
      runtimeType: runtimeState.runtimeType,
      isStatic: runtimeState.isStatic,
      staticHtml: runtimeState.staticHtml,
    },
  }));
});

// Connect ProjectRuntime log subscriber to Zustand safely after store is created
projectRuntime.subscribeLogs((logEntries) => {
  codeBase.setState((state) => {
    const currentLogs = state?.runtime?.terminalLogs || [];
    const entries = Array.isArray(logEntries) ? logEntries : [logEntries];
    return {
      runtime: {
        ...(state?.runtime || {}),
        terminalLogs: [...currentLogs, ...entries].slice(-500),
      },
    };
  });
});

