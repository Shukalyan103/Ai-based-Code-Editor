import React from 'react';
import { codeBase } from "../store/codeBase";
import {
    X,
    FileCode,
    FileText,
    FileJson,
    File,
    XCircle
} from 'lucide-react';

const getFileIcon = (fileName, isActive) => {
    if (!fileName) return <File className="w-4 h-4 shrink-0 text-zinc-400" />;
    const ext = fileName.split('.').pop().toLowerCase();
    const colorClass = isActive ? 'text-white' : '';

    switch (ext) {
        case 'js':
        case 'jsx':
            return <FileCode className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-yellow-400'}`} />;
        case 'ts':
        case 'tsx':
            return <FileCode className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-blue-400'}`} />;
        case 'css':
            return <FileText className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-teal-400'}`} />;
        case 'html':
            return <FileCode className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-orange-400'}`} />;
        case 'json':
            return <FileJson className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-amber-300'}`} />;
        case 'md':
            return <FileText className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-violet-400'}`} />;
        default:
            return <File className={`w-3.5 h-3.5 shrink-0 ${colorClass || 'text-zinc-400'}`} />;
    }
};

const Tabs = () => {
    const {
        openTab = [],
        activeFile,
        setActiveFile,
        closeFiles,
        colseFiles,
        closeAllTabs
    } = codeBase();

    const handleClose = (e, file) => {
        e.stopPropagation();
        if (closeFiles) {
            closeFiles(file);
        } else if (colseFiles) {
            colseFiles(file);
        }
    };

    const handleMiddleClick = (e, file) => {
        if (e.button === 1) {
            e.preventDefault();
            handleClose(e, file);
        }
    };

    if (!openTab || openTab.length === 0) {
        return (
            <div className="h-9 bg-[#18181c] border-b border-[#27272a] flex items-center px-4 select-none shrink-0 text-xs text-zinc-500 italic">
                No open files
            </div>
        );
    }

    return (
        <div className="h-9 bg-[#141416] border-b border-[#27272a] flex items-center justify-between select-none shrink-0 overflow-hidden">
            <div className="flex items-center h-full overflow-x-auto overflow-y-hidden no-scrollbar flex-1">
                {openTab.map((file) => {
                    const isActive = file === activeFile;
                    const fileNameOnly = file.split('/').pop();

                    return (
                        <div
                            key={file}
                            title={file}
                            onClick={() => setActiveFile(file)}
                            onMouseDown={(e) => handleMiddleClick(e, file)}
                            className={`group h-full flex items-center gap-2 px-3 border-r border-[#27272a] cursor-pointer transition-colors text-xs min-w-[110px] max-w-[200px] shrink-0 border-t-2 ${
                                isActive
                                    ? 'bg-[#1e1e1e] text-zinc-100 border-t-blue-500 font-medium'
                                    : 'bg-[#141416] text-zinc-400 border-t-transparent hover:bg-[#1a1a1e] hover:text-zinc-200'
                            }`}
                        >
                            {getFileIcon(file, isActive)}
                            <span className="truncate flex-1">{fileNameOnly}</span>
                            <button
                                title="Close tab"
                                onClick={(e) => handleClose(e, file)}
                                className={`p-0.5 rounded transition-all ${
                                    isActive
                                        ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60'
                                        : 'opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50'
                                }`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {openTab.length > 0 && closeAllTabs && (
                <div className="flex items-center px-2 shrink-0 bg-[#141416] h-full border-l border-[#27272a]">
                    <button
                        title="Close all tabs"
                        onClick={closeAllTabs}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                        <XCircle className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Tabs;