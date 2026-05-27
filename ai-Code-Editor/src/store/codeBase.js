import { create } from "zustand";


export const codeBase = create((set) => ({
    promt: "",
    project: {},

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

    createFile: (projectName, fileName) =>
        set((state) => ({
            project: {
                ...state.project,
                [projectName]: {
                    ...state.project[projectName],
                    files: {
                        ...state.project[projectName].files,
                        [fileName]: {
                            content: ""
                        }
                    }
                }
            },
            activeFile: fileName
        })),

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
    updateMessage: (projectName, role, content) =>
        set((state) => ({
            project: {
                ...state.project,
                [projectName]: {
                    ...state.project[projectName],
                    message: [
                        ...state.project[projectName].message,
                        {
                            role: role,
                            content: content
                        }
                    ]
                }
            }
        })),


    setActiveProject: (projectName) =>
        set(() => ({
            activeProject: projectName
        })),
    setActiveFile: (FileName) =>
        set(() => ({
            activeFile: FileName
        }))

}))
