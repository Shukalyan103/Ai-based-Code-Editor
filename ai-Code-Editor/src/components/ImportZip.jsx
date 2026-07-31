import JSZip, { loadAsync } from "jszip";
import { useState } from "react";
import { codeBase } from "../store/codeBase";





const ImportZip = () => {

    const [contextMenuEnable, setContextMenuEnable] = useState(null)

    const hidecontext = () => {
        if (contextMenuEnable === 'context') {
            setContextMenuEnable(null)
        } else {
            setContextMenuEnable('context')
        }
    }




    const ImportProject = async (zipFile) => {

        const zip = await JSZip.loadAsync(zipFile)
        console.log(zip)

        const projectName = zipFile.name.replace(/\.zip$/i,
            ""
        )
        console.log(projectName)

        const files = {}
        const folder = {}

        for (const path in zip.files) {
            const entry = zip.files[path]
            console.log(path)
            // console.log(entry)

            if (entry.dir) {
                // folder[path.replace(/\/$/, "")] = true
                continue;
            }

            const content = await entry.async("string")
            // console.log(content)

            files[path] = {
                content
            }

            const parts = path.split("/");

            let currentPath = "";

            for (let i = 0; i < parts.length - 1; i++) {
                currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

                folder[currentPath] = true
            }

        }





        setContextMenuEnable(null)
        codeBase.setState((state) => ({
            project: {
                ...state.project,
                [projectName]: {
                    files,
                    folders: folder,

                }
            },
            activeProject: projectName,

        }))


    }
    // context menu for importing
    const ContextBox = () => {


        return (
            <>
                <div className="h-fit w-20 absolute right-3 flex items-center flex-col rounded top-0 bg-[#131314]">
                    <label htmlFor="Zip" className="  p-3 hover:bg-[#2F2F32] rounded"  >ZIP

                    </label>

                    <button className=" p-3 hover:bg-[#2F2F32] rounded" onClick={() => { hidecontext() }
                    }>Folder</button>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="relative w1/3">
                <button className="w-30 h-10 bg-blue-600 rounded mr-23 font-bold" onClick={() => {
                    if (contextMenuEnable === 'context') {
                        setContextMenuEnable(null)
                    } else {
                        setContextMenuEnable('context')
                    }
                }}>Import</button>
                {contextMenuEnable === 'context' ? (<ContextBox />) : null}
            </div>

            <input
                type="file"
                accept=".zip"
                className="hidden"
                id="Zip"

                onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    await ImportProject(file);
                }}
            />




        </>
    )

}

export default ImportZip;