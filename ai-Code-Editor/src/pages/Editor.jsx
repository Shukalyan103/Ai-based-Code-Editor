import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { codeBase } from '../store/codeBase';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
  FolderCode,
  Languages,
  Home,
  Settings,
  Globe,
  Terminal as TerminalIcon,
  Bot,
  Play,
  RotateCw,
  Layers,
} from 'lucide-react';
import SideBar from '../components/SideBar';
import CodeEiditor from '../components/CodeEiditor';
import AiChat from '../components/AiChat';
import TranslateCode from '../components/TranslateCode';
import PreviewPanel from '../components/PreviewPanel';
import TerminalPanel from '../components/TerminalPanel';
import PopupDeleRename from '../components/PopupDeleRename';
import { AppContext } from '../context/AppContextInstance';

const Editor = () => {
  const { ProjectName } = useParams();
  const activeProject = codeBase((state) => state.activeProject);
  const runtime = codeBase((state) => state.runtime) || {};
  const startRuntime = codeBase((state) => state.startRuntime);
  const stopRuntime = codeBase((state) => state.stopRuntime);
  const restartRuntime = codeBase((state) => state.restartRuntime);
  const { setPopUpOpen } = useContext(AppContext);

  const navigate = useNavigate();

  const [sideBarVisible, setSideBarVisible] = useState('file');
  const [rightPanelTab, setRightPanelTab] = useState('preview'); // 'preview' | 'terminal' | 'chat'
  const [contextMenuEnable, setContextMenuEnable] = useState(null);

  useEffect(() => {
    if (ProjectName) {
      const store = codeBase.getState();
      if (!store.project[ProjectName]) {
        store.addProject(ProjectName);
      } else {
        if (store.activeProject !== ProjectName) {
          store.setActiveProject(ProjectName);
        } else {
          // If activeProject is already set from persisted localStorage, start runtime if not running
          if (!store.runtime || store.runtime.project !== ProjectName || store.runtime.status === 'idle' || store.runtime.status === 'stopped') {
            store.startRuntime();
          }
        }
      }
    }
  }, [ProjectName]);

  const hidecontext = (word) => {
    if (contextMenuEnable === 'context') {
      setContextMenuEnable(null);
    } else {
      setContextMenuEnable(word);
    }
  };

  const FileContext = () => {
    return (
      <div className="h-fit w-fit text-white font-semibold border border-gray-500/20 absolute left-[30px] top-[-95px] flex items-center flex-col rounded bg-[#131314] shadow-xl z-50">
        <button
          className="cursor-pointer p-3 hover:bg-[#2F2F32] rounded w-full text-left"
          onClick={() => setPopUpOpen('rename')}
        >
          Rename
        </button>
        <button
          className="cursor-pointer p-3 w-full hover:bg-[#2F2F32] rounded text-left text-red-400"
          onClick={() => setPopUpOpen('delete')}
        >
          Delete
        </button>
      </div>
    );
  };

  const sideBarChangeHandler = (name) => {
    if (sideBarVisible === name) {
      setSideBarVisible(null);
    } else {
      setSideBarVisible(name);
    }
  };

  const getRuntimeStatusDot = () => {
    switch (runtime?.status) {
      case 'running':
        return 'bg-emerald-400 animate-pulse';
      case 'installing':
      case 'starting':
      case 'mounting':
        return 'bg-amber-400 animate-spin';
      case 'error':
        return 'bg-rose-400';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="h-screen w-full relative bg-[#121214] text-white flex flex-col overflow-hidden">
      <div className="h-full w-full flex">
        {/* Left Navigation Bar */}
        <div className="h-full w-[60px] bg-[#101012] border-r border-[#1e1e24] flex items-center justify-between flex-col py-3 select-none shrink-0 z-20">
          <div className="flex flex-col items-center gap-4 w-full">
            <button
              title="Dashboard"
              onClick={() => navigate('/')}
              className="p-2 bg-[#6B69DA] hover:bg-[#5A58C9] rounded-xl text-white transition-all shadow-md cursor-pointer"
            >
              <Home className="w-5 h-5" />
            </button>

            <div className="w-8 h-[1px] bg-zinc-800" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                title="File Explorer"
                onClick={() => sideBarChangeHandler('file')}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  sideBarVisible === 'file'
                    ? 'text-amber-400 bg-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <FolderCode className="w-5 h-5" />
              </button>

              <button
                title="Translate Code"
                onClick={() => sideBarChangeHandler('translate')}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  sideBarVisible === 'translate'
                    ? 'text-amber-400 bg-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Languages className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Settings */}
          <div className="relative flex flex-col items-center">
            <button
              title="Settings"
              onClick={() => hidecontext('context')}
              className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
            {contextMenuEnable === 'context' && <FileContext />}
          </div>
        </div>

        {/* Center / Right IDE Area */}
        <div className="h-full flex-1 min-w-0 overflow-hidden">
          <Group direction="horizontal">
            {/* Collapsible Left Sidebar */}
            {sideBarVisible === 'file' && (
              <>
                <Panel defaultSize={20} minSize={15} maxSize={200}>
                  <SideBar />
                </Panel>
                <Separator className="w-1 bg-[#1e1e24] hover:bg-[#6B69DA] transition-colors cursor-col-resize" />
              </>
            )}

            {sideBarVisible === 'translate' && (
              <>
                <Panel defaultSize={25} minSize={20} maxSize={40}>
                  <TranslateCode />
                </Panel>
                <Separator className="w-1 bg-[#1e1e24] hover:bg-[#6B69DA] transition-colors cursor-col-resize" />
              </>
            )}

            {/* Code Editor Panel */}
            <Panel defaultSize={48} minSize={30}>
              <CodeEiditor className="h-full" />
            </Panel>

            <Separator className="w-1 bg-[#1e1e24] hover:bg-[#6B69DA] transition-colors cursor-col-resize" />

            {/* Right Multi-View Panel (Preview / Terminal / AI Chat) */}
            <Panel defaultSize={32} minSize={25}>
              <div className="h-full flex flex-col bg-[#141416] overflow-hidden">
                {/* Panel Navigation Tabs */}
                <div className="h-9 bg-[#111113] border-b border-[#23232a] flex items-center justify-between px-2 select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRightPanelTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        rightPanelTab === 'preview'
                          ? 'bg-[#1e1e24] text-zinc-100 shadow-sm border border-zinc-700/50'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>Preview</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${getRuntimeStatusDot()}`} />
                    </button>

                    <button
                      onClick={() => setRightPanelTab('terminal')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        rightPanelTab === 'terminal'
                          ? 'bg-[#1e1e24] text-zinc-100 shadow-sm border border-zinc-700/50'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Terminal</span>
                      {runtime?.terminalLogs?.length > 0 && (
                        <span className="text-[10px] px-1 rounded-full bg-zinc-800 text-zinc-400">
                          {runtime.terminalLogs.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setRightPanelTab('chat')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        rightPanelTab === 'chat'
                          ? 'bg-[#1e1e24] text-zinc-100 shadow-sm border border-zinc-700/50'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Assistant</span>
                    </button>
                  </div>
                </div>

                {/* Panel View Content */}
                <div className="flex-1 w-full overflow-hidden relative">
                  {rightPanelTab === 'preview' && (
                    <PreviewPanel onOpenTerminal={() => setRightPanelTab('terminal')} />
                  )}

                  {rightPanelTab === 'terminal' && <TerminalPanel />}

                  {rightPanelTab === 'chat' && <AiChat />}
                </div>
              </div>
            </Panel>
          </Group>
        </div>
      </div>

      <PopupDeleRename />
    </div>
  );
};

export default Editor;