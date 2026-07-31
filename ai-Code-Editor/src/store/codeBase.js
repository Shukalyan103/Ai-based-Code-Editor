import { create } from "zustand";
import { persist } from "zustand/middleware";

export const codeBase = create(
    persist((set) => ({

        promt: "",
        project: {},

        openTab: [],

        activeProject: null,
        activeFile: null,

        addProject: (projectName) =>
            set((state) => ({
                project: {
                    ...state.project,
                    [projectName]: {
                        files: {},
                        folders: {},
                        message: [],
                    }
                },
                activeProject: projectName
            })),

        deleteProject: (fileName) =>
            set((state) => {
                const newProject = { ...state.project }
                delete newProject[fileName];
                return {
                    project: newProject,
                    activeProject: state.activeProject === fileName ? null : state.activeProject
                }
            }),

        renameProject: (olName, newName) => {
            set((state) => {
                const projects = {
                    ...state.project,
                    [newName]: { ...state.project[olName] },
                }
                delete projects[olName];
                return {
                    project: projects,
                    activeProject: newName
                }
            })
        },

        createFile: (projectName, fileName) =>
            set((state) => {
                const project = state.project[projectName];
                if (!project) return {};

                // Ensure parent folders exist in the folders map
                const parts = fileName.split('/');
                const newFolders = { ...project.folders };
                let currentPath = '';
                for (let i = 0; i < parts.length - 1; i++) {
                    currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
                    newFolders[currentPath] = true;
                }

                return {
                    project: {
                        ...state.project,
                        [projectName]: {
                            ...project,
                            files: {
                                ...project.files,
                                [fileName]: {
                                    content: ""
                                }
                            },
                            folders: newFolders
                        }
                    },
                    openTab: state.openTab.includes(fileName) ? state.openTab : [...state.openTab, fileName],
                    activeFile: fileName
                };
            }),

        createFolder: (projectName, folderPath) =>
            set((state) => {
                const project = state.project[projectName];
                if (!project) return {};

                // Ensure intermediate directories are added
                const parts = folderPath.split('/');
                const newFolders = { ...project.folders };
                let currentPath = '';
                for (let i = 0; i < parts.length; i++) {
                    currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
                    newFolders[currentPath] = true;
                }

                return {
                    project: {
                        ...state.project,
                        [projectName]: {
                            ...project,
                            folders: newFolders
                        }
                    }
                };
            }),

        deleteFile: (projectName, fileName) =>
            set((state) => {
                const project = state.project[projectName];
                if (!project) return {};

                const newFiles = { ...project.files };
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
                            ...project,
                            files: newFiles
                        }
                    },
                    openTab: newOpenTab,
                    activeFile
                };
            }),

        deleteFolder: (projectName, folderPath) =>
            set((state) => {
                const project = state.project[projectName];
                if (!project) return {};

                const newFiles = { ...project.files };
                const newFolders = { ...project.folders };

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
                            ...project,
                            files: newFiles,
                            folders: newFolders
                        }
                    },
                    openTab: newOpenTab,
                    activeFile
                };
            }),

        updateCode: (projectName, fileName, code) =>
            set((state) => ({
                project: {
                    ...state.project,
                    [projectName]: {
                        ...state.project[projectName],
                        files: {
                            ...state.project[projectName].files,
                            [fileName]: {
                                ...state.project[projectName].files[fileName],
                                content: code
                            }

                        }
                    }
                }
            })),
        updateMessage: (projectName, messages) =>
            set((state) => ({
                project: {
                    ...state.project,
                    [projectName]: {
                        ...state.project[projectName],
                        message: [
                            ...state.project[projectName].message,
                            messages,
                        ]
                    }
                }
            })),

        appendMessageChunk: (projectName, chunk) =>
            set((state) => {
                const messages = state.project[projectName].message;
                const lastMessage = messages[messages.length - 1];

                const updateMessage = [...messages.slice(0, -1),
                {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                },]

                return {
                    project: {
                        ...state.project,
                        [projectName]: {
                            ...state.project[projectName],
                            message: updateMessage,
                        }
                    }
                };

            }),

        openFiles: (filename) =>
            set((state) => ({
                activeFile: filename,
                openTab: state.openTab.includes(filename) ? state.openTab : [...state.openTab, filename]
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
                    activeFile
                };
            }),
        colseFiles: (filename) => set((state) => codeBase.getState().closeFiles(filename)),
        closeOtherTabs: (filename) =>
            set((state) => ({
                openTab: state.openTab.includes(filename) ? [filename] : [],
                activeFile: filename
            })),
        closeAllTabs: () =>
            set(() => ({
                openTab: [],
                activeFile: null
            })),






        setActiveProject: (projectName) =>
            set(() => ({
                activeProject: projectName
            })),
        setActiveFile: (FileName) =>
            set(() => ({
                activeFile: FileName
            }))


    }), {
        name: "codeBase",
        getStorage: () => localStorage,
    })
)
