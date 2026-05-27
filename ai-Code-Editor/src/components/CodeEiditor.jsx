import React, { act, useRef } from 'react'
import Editor from "@monaco-editor/react";
import { editStore } from '../store/editStore';
import { useContext } from 'react';
import { AppContext } from '../context/AppContextInstance';
import { codeBase } from '../store/codeBase';


const CodeEiditor = () => {
   const {editorRef}=useContext(AppContext)
//    const files = codeBase((state) => state.files)
   const updateCode = codeBase((state) => state.updateCode)
    const setActiveFile = codeBase((state) => state.setActiveFile)
    const activeFile = codeBase((state) => state.activeFile)
    const activeProject = codeBase((state) => state.activeProject)
    const project = codeBase((state) => state.project)
   

   

   
        

   
    return (
        
        <Editor
            height="100vh"
            theme="vs-dark"
            defaultLanguage="python"
            onMount={(editor) => {
                editorRef.current = editor
               
            
            }}
            value={project[activeProject]?.files[activeFile]?.content || ""}
            
            onChange={(value) => {
                updateCode(activeProject,activeFile,value)
            }}
            
        />
    )
}

export default CodeEiditor