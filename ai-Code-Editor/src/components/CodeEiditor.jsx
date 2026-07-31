import React, { useContext } from 'react';
import Editor from "@monaco-editor/react";
import { AppContext } from '../context/AppContextInstance';
import { codeBase } from '../store/codeBase';
import Tabs from './Tabs';
import { FileCode2 } from 'lucide-react';

const CodeEiditor = ({ className = "" }) => {
  const { editorRef } = useContext(AppContext);
  const updateCode = codeBase((state) => state.updateCode);
  const activeFile = codeBase((state) => state.activeFile);
  const activeProject = codeBase((state) => state.activeProject);
  const project = codeBase((state) => state.project);

  const getLanguage = (fileName) => {
    if (!fileName) return "javascript";
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'py':
        return 'python';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'cs':
        return 'csharp';
      case 'java':
        return 'java';
      case 'rs':
        return 'rust';
      case 'go':
        return 'go';
      case 'sql':
        return 'sql';
      case 'sh':
        return 'shell';
      default:
        return 'plaintext';
    }
  };

  const activeContent = activeProject && activeFile && project[activeProject]?.files[activeFile]
    ? project[activeProject].files[activeFile].content
    : "";

  return (
    <div className={`h-full flex flex-col bg-[#1e1e1e] overflow-hidden ${className}`}>
      <Tabs />
      <div className="flex-1 w-full relative overflow-hidden bg-[#1e1e1e]">
        {activeFile ? (
          <Editor
            height="100%"
            theme="vs-dark"
            language={getLanguage(activeFile)}
            onMount={(editor) => {
              if (editorRef) {
                editorRef.current = editor;
              }
            }}
            value={activeContent}
            onChange={(value) => {
              if (activeProject && activeFile) {
                updateCode(activeProject, activeFile, value || "");
              }
            }}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on'
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3 select-none">
            <FileCode2 className="w-12 h-12 text-zinc-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-zinc-400">No file open</p>
            <p className="text-xs text-zinc-500">Select a file from the sidebar to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEiditor;