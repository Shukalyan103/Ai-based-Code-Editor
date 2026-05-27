import React from 'react'
import { useShallow } from 'zustand/react/shallow'
import { codeBase } from '../store/codeBase';

const SideBar = () => {

    const { project, setActiveFile, createFile, activeProject, activeFile } =
        codeBase(
            useShallow(state => ({
                project: state.project,
                setActiveFile: state.setActiveFile,
                createFile: state.createFile,
                activeProject: state.activeProject,
                activeFile: state.activeFile
            }))
        )

    const files = activeProject && project[activeProject]?.files || {}

    const handleClick = (e) => {
        const fileName = prompt("Enter file name")
        if (fileName && activeProject) {
            createFile(activeProject, fileName)
            setActiveFile(fileName)
        } else if (!activeProject) {
            alert("Please select a project first")
        }
    }

    return (
        <div className='p-4'>
            <h3 className='text-lg font-bold mb-4'>Files</h3>
            <h3 className='text-lg font-bold mb-4'>{activeProject}</h3>
            <button
                onClick={handleClick}
                className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4'
            >
                Add File
            </button>

            {files && Object.keys(files).map((fileName) => {
                return <div
                    key={fileName}
                    onClick={() => {
                        setActiveFile(fileName)
                    }}
                    className={`p-2 m-2 rounded cursor-pointer ${activeFile === fileName ? 'bg-blue-400 text-white' : 'bg-gray-200'}`}
                >
                    {fileName}
                </div>
            })}
        </div>
    )
}

export default SideBar