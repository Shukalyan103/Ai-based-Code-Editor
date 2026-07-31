import React, { useContext, useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { codeBase } from '../store/codeBase';
import { AppContext } from '../context/AppContextInstance';
import {
    Folder,
    FolderOpen,
    File,
    FileCode,
    FileText,
    FileJson,
    ChevronDown,
    ChevronRight,
    FolderPlus,
    FilePlus,
    Trash2,
    ChevronsDownUp
} from 'lucide-react';

const SideBar = () => {
    const {
        project,
        setActiveFile,
        createFile,
        createFolder,
        deleteFile,
        deleteFolder,
        activeProject,
        activeFile,
        openFiles
    } = codeBase(
        useShallow(state => ({
            project: state.project,
            setActiveFile: state.setActiveFile,
            createFile: state.createFile,
            createFolder: state.createFolder,
            deleteFile: state.deleteFile,
            deleteFolder: state.deleteFolder,
            activeProject: state.activeProject,
            activeFile: state.activeFile,
            openFiles: state.openFiles
        }))
    )
    console.log(activeFile)
    const { setFileCount, fileCount } = useContext(AppContext)

    const files = activeProject && project[activeProject]?.files || {}
    const folders = activeProject && project[activeProject]?.folders || {}
    console.log("files", files)
    console.log("Folder", folders)

    const [collapsedPaths, setCollapsedPaths] = useState({})
    const [creating, setCreating] = useState(null) // { parentPath: string, type: 'file' | 'folder' }

    // Rebuild folder-file tree whenever project files/folders change
    const fileTree = useMemo(() => {
        const root = {
            name: 'root',
            type: 'folder',
            children: {},
            path: ''
        };

        // Add folders
        Object.keys(folders).forEach((folderPath) => {


            if (!folderPath) return;
            const parts = folderPath.split('/');   //"src/compontent" = ["src" , "compontent"]
            let current = root;
            let currentPath = '';
            parts.forEach((part) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                // console.log("currentpath", currentPath)
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        type: 'folder',
                        children: {},
                        path: currentPath,
                    };
                }
                current = current.children[part];
            });
        });

        // Add files
        Object.keys(files).forEach((filePath) => {
            if (!filePath) return;
            const parts = filePath.split('/');
            let current = root;
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        type: 'folder',
                        children: {},
                        path: currentPath,
                    };
                }
                current = current.children[part];
            }
            const fileName = parts[parts.length - 1];
            const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
            current.children[fileName] = {
                name: fileName,
                type: 'file',
                path: fullPath,
            };
        });

        return root;
    }, [files, folders]);

    const getSortedNodes = (childrenObj) => {
        const nodes = Object.values(childrenObj);
        return nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    };

    const getFileIcon = (fileName, isActive) => {
        const ext = fileName.split('.').pop().toLowerCase();
        const colorClass = isActive ? 'text-white' : '';

        switch (ext) {
            case 'js':
            case 'jsx':
                return <FileCode className={`w-4 h-4 shrink-0 ${colorClass || 'text-yellow-400'}`} />;
            case 'ts':
            case 'tsx':
                return <FileCode className={`w-4 h-4 shrink-0 ${colorClass || 'text-blue-400'}`} />;
            case 'css':
                return <FileText className={`w-4 h-4 shrink-0 ${colorClass || 'text-teal-400'}`} />;
            case 'json':
                return <FileJson className={`w-4 h-4 shrink-0 ${colorClass || 'text-amber-300'}`} />;
            case 'md':
                return <FileText className={`w-4 h-4 shrink-0 ${colorClass || 'text-violet-400'}`} />;
            default:
                return <File className={`w-4 h-4 shrink-0 ${colorClass || 'text-gray-400'}`} />;
        }
    };

    const toggleFolder = (path) => {
        setCollapsedPaths(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    const handleCollapseAll = () => {
        const newCollapsed = {};
        Object.keys(folders).forEach((path) => {
            newCollapsed[path] = true;
        });
        setCollapsedPaths(newCollapsed);
    };

    const handleInputKeyDown = (e, parentPath, type) => {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            if (!value) {
                setCreating(null);
                return;
            }
            if (value.includes('/') || value.includes('\\')) {
                alert('Names cannot contain "/" or "\\"');
                return;
            }
            const fullPath = parentPath ? `${parentPath}/${value}` : value;
            console.log(fullPath)

            if (type === 'file') {
                if (files[fullPath]) {
                    alert('A file with this name already exists.');
                    return;
                }
                createFile(activeProject, fullPath);
                setActiveFile(fullPath);
                setFileCount(prev => prev + 1);
            } else {
                if (folders[fullPath]) {
                    alert('A folder with this name already exists.');
                    return;
                }
                createFolder(activeProject, fullPath);
                if (parentPath) {
                    setCollapsedPaths(prev => ({
                        ...prev,
                        [parentPath]: false
                    }));
                }
            }
            setCreating(null);
        } else if (e.key === 'Escape') {
            setCreating(null);
        }
    };

    const renderInlineInput = (parentPath, type) => {
        const indentLevel = parentPath ? parentPath.split('/').length : 0;
        return (
            <div
                className="flex items-center gap-2 py-1 px-2 my-0.5 rounded bg-[#1f1f24] border border-blue-500/50"
                style={{ paddingLeft: `${indentLevel * 12 + 8}px` }}
            >
                {type === 'folder' ? (
                    <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
                ) : (
                    <File className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <input
                    autoFocus
                    type="text"
                    placeholder={type === 'folder' ? 'Folder name...' : 'File name...'}
                    className="w-full bg-transparent text-sm text-white focus:outline-none border-none p-0"
                    onKeyDown={(e) => handleInputKeyDown(e, parentPath, type)}
                    onBlur={() => setCreating(null)}
                />
            </div>
        );
    };

    const renderTreeNodes = (nodes, depth = 0) => {
        return nodes.map((node) => {
            const isFolder = node.type === 'folder';
            const isExpanded = !collapsedPaths[node.path];

            if (isFolder) {
                const sortedChildren = getSortedNodes(node.children);
                return (
                    <div key={node.path} className="flex flex-col">
                        <div
                            onClick={() => toggleFolder(node.path)}
                            className="group flex items-center justify-between py-1 px-2 hover:bg-zinc-800/60 rounded cursor-pointer transition-colors select-none"
                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span className="text-zinc-500">
                                    {isExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                    )}
                                </span>
                                <span>
                                    {isExpanded ? (
                                        <FolderOpen className="w-4 h-4 text-yellow-500 shrink-0" />
                                    ) : (
                                        <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
                                    )}
                                </span>
                                <span className="text-sm font-medium text-zinc-200 truncate">{node.name}</span>
                            </div>

                            <div
                                className="hidden group-hover:flex items-center gap-1.5 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    title="New File"
                                    onClick={() => setCreating({ parentPath: node.path, type: 'file' })}
                                    className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-colors"
                                >
                                    <FilePlus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    title="New Folder"
                                    onClick={() => setCreating({ parentPath: node.path, type: 'folder' })}
                                    className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-green-400 transition-colors"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    title="Delete Folder"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete folder "${node.name}" and all its contents?`)) {
                                            const filesToDelete = Object.keys(files).filter(path => path === node.path || path.startsWith(`${node.path}/`));
                                            deleteFolder(activeProject, node.path);
                                            setFileCount(prev => Math.max(0, prev - filesToDelete.length));
                                        }
                                    }}
                                    className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="flex flex-col">
                                {creating && creating.parentPath === node.path && renderInlineInput(node.path, creating.type)}
                                {renderTreeNodes(sortedChildren, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            } else {
                const isActive = activeFile === node.path;
                // console.log(node.path)
                return (
                    <div
                        key={node.path}
                        // tabs open tab function is use
                        onClick={() => {
                            setActiveFile(node.path)
                            openFiles(node.path)

                        }}
                        className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition-colors select-none ${isActive
                            ? 'bg-blue-600/25 text-blue-200 border-l-2 border-blue-500'
                            : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
                            }`}
                        style={{ paddingLeft: `${depth * 12 + 24}px` }}
                    >
                        <div className="flex items-center gap-2 truncate">
                            {getFileIcon(node.name, isActive)}
                            <span className="text-sm truncate">{node.name}</span>
                        </div>

                        <div
                            className="hidden group-hover:flex items-center shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                title="Delete File"
                                onClick={() => {
                                    if (confirm(`Are you sure you want to delete file "${node.name}"?`)) {
                                        deleteFile(activeProject, node.path);
                                        setFileCount(prev => Math.max(0, prev - 1));
                                    }
                                }}
                                className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                );
            }
        });
    };

    const sortedRootNodes = getSortedNodes(fileTree.children);

    return (
        <div className="p-4 bg-[#121215] h-full flex flex-col border-r border-[#1e1e24]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 select-none">
                <div className="flex flex-col min-w-0">
                    <span className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">Workspace</span>
                    <span className="text-sm font-bold text-zinc-200 truncate">{activeProject || 'No Project Selected'}</span>
                </div>

                {activeProject && (
                    <div className="flex items-center gap-1">
                        <button
                            title="New File at Root"
                            onClick={() => { setCreating({ parentPath: '', type: 'file' }) }}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 transition-colors"
                        >
                            <FilePlus className="w-4 h-4" />
                        </button>
                        <button
                            title="New Folder at Root"
                            onClick={() => setCreating({ parentPath: '', type: 'folder' })}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-green-400 transition-colors"
                        >
                            <FolderPlus className="w-4 h-4" />
                        </button>
                        <button
                            title="Collapse All"
                            onClick={handleCollapseAll}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
                        >
                            <ChevronsDownUp className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {activeProject ? (
                    <>
                        {creating && creating.parentPath === '' && renderInlineInput('', creating.type)}

                        {sortedRootNodes.length > 0 ? (
                            renderTreeNodes(sortedRootNodes)
                        ) : (
                            !creating && (
                                <div className="text-xs text-zinc-500 text-center py-8">
                                    No files or folders. Click the toolbar icons to create one.
                                </div>
                            )
                        )}
                    </>
                ) : (
                    <div className="text-xs text-zinc-500 text-center py-8">
                        Please select or create a project first.
                    </div>
                )}
            </div>
        </div>
    )
}

export default SideBar