import React, { useState, useEffect, useMemo } from 'react';
import { codeBase } from '../store/codeBase';
import { isReactProject, buildStaticHtmlPreview } from '../services/webcontainer/runtimeConfig';
import {
  Play,
  Square,
  RotateCw,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Globe,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react';

const PreviewPanel = ({ onOpenTerminal, className = '' }) => {
  const activeProject = codeBase((state) => state.activeProject);
  const project = codeBase((state) => state.project) || {};
  const runtime = codeBase((state) => state.runtime) || {};
  const startRuntime = codeBase((state) => state.startRuntime);
  const stopRuntime = codeBase((state) => state.stopRuntime);
  const restartRuntime = codeBase((state) => state.restartRuntime);

  const [refreshKey, setRefreshKey] = useState(0);

  const activeFiles = useMemo(() => {
    return activeProject && project[activeProject] ? project[activeProject].files || {} : {};
  }, [activeProject, project]);

  const isReact = useMemo(() => isReactProject(activeFiles), [activeFiles]);

  const liveStaticHtml = useMemo(() => {
    if (!activeProject || isReact) return null;
    return buildStaticHtmlPreview(activeFiles);
  }, [activeProject, activeFiles, isReact]);

  const {
    status = 'idle',
    previewUrl = null,
    error = null,
    runtimeType = null,
    isStatic = false,
    staticHtml = null,
  } = runtime;

  // Auto-start runtime when activeProject changes if currently idle
  useEffect(() => {
    if (activeProject && (!status || status === 'idle')) {
      startRuntime();
    }
  }, [activeProject]);

  const isSelfUrl = Boolean(
    previewUrl &&
    typeof window !== 'undefined' &&
    (previewUrl === window.location.origin ||
     previewUrl === window.location.href ||
     previewUrl === `${window.location.origin}/`)
  );

  const handleRefreshIframe = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (previewUrl && !isSelfUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Render status indicator badge
  const renderStatusBadge = () => {
    if (!isReact && activeProject && liveStaticHtml) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live (Static)
        </span>
      );
    }

    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live ({runtimeType || 'React'})
          </span>
        );
      case 'installing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            Installing
          </span>
        );
      case 'starting':
      case 'mounting':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            {status === 'mounting' ? 'Mounting' : 'Starting Server'}
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Error
          </span>
        );
      case 'stopped':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700/20 text-zinc-400 border border-zinc-700/30">
            Stopped
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            Idle
          </span>
        );
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#121214] text-zinc-200 ${className}`}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-[#16161a] select-none">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-[#8E8DED] shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 truncate">
            {activeProject ? `${activeProject}` : 'No Project Selected'}
          </span>
          {renderStatusBadge()}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Refresh Iframe Content */}
          <button
            onClick={handleRefreshIframe}
            title="Reload Preview"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Open in New Tab (WebContainer or Blob URL) */}
          {previewUrl && !isSelfUrl && (
            <button
              onClick={handleOpenExternal}
              title="Open in new window"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Terminal Toggle Button */}
          {onOpenTerminal && isReact && (
            <button
              onClick={onOpenTerminal}
              title="Open Runtime Logs / Terminal"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Start / Restart / Stop Controls for React projects */}
          {isReact && (
            <>
              {status === 'running' ? (
                <>
                  <button
                    onClick={restartRuntime}
                    title="Restart Dev Server"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={stopRuntime}
                    title="Stop Server"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={startRuntime}
                  disabled={status === 'installing' || status === 'mounting' || status === 'starting'}
                  title="Run Project"
                  className="px-2.5 py-1 rounded-lg bg-[#6B69DA] hover:bg-[#5A58C9] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Preview / Status Body */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-white">
        {!activeProject ? (
          /* State: No Project */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none text-zinc-500 gap-3 bg-[#121214]">
            <Layers className="w-10 h-10 text-zinc-700" />
            <div>
              <p className="text-sm font-semibold text-zinc-400">No project selected</p>
              <p className="text-xs text-zinc-600 mt-1">Select or create a project to see the live preview</p>
            </div>
          </div>
        ) : !isReact && liveStaticHtml ? (
          /* State: Instant Reactive Static Preview (HTML/CSS/JS) */
          <iframe
            key={refreshKey}
            title={`Preview - ${activeProject}`}
            srcDoc={liveStaticHtml}
            className="w-full h-full border-none bg-white"
            allow="cross-origin-isolated; autoplay; camera; microphone; geolocation; clipboard-read; clipboard-write;"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
          />
        ) : isReact && (status === 'mounting' || status === 'installing' || status === 'starting') ? (
          /* State: React WebContainer Booting / Installing */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#121214] text-zinc-400 gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-[#8E8DED] animate-spin" />
              <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">
                {status === 'mounting' && 'Mounting workspace files...'}
                {status === 'installing' && 'Installing React dependencies (npm install)...'}
                {status === 'starting' && 'Starting Vite development server...'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
                {status === 'installing'
                  ? 'Dependencies are being installed inside the in-browser WebContainer.'
                  : 'Booting WebContainer runtime environment...'}
              </p>
            </div>
            {onOpenTerminal && (
              <button
                onClick={onOpenTerminal}
                className="mt-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                View Terminal Output
              </button>
            )}
          </div>
        ) : isReact && status === 'error' ? (
          /* State: Error */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#121214] text-zinc-400 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-300">Runtime Error</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md break-words bg-rose-950/20 border border-rose-800/30 p-2.5 rounded-xl font-mono text-left text-[11px] leading-relaxed">
                {error || 'An unexpected error occurred during execution.'}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={restartRuntime}
                className="px-4 py-2 rounded-xl bg-[#6B69DA] text-xs font-bold text-white shadow hover:bg-[#5A58C9] transition-colors cursor-pointer"
              >
                Retry Run
              </button>
              {onOpenTerminal && (
                <button
                  onClick={onOpenTerminal}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Inspect Terminal
                </button>
              )}
            </div>
          </div>
        ) : isReact && status === 'stopped' ? (
          /* State: Stopped */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#121214] text-zinc-500 gap-3">
            <Square className="w-10 h-10 text-zinc-600" />
            <div>
              <p className="text-sm font-semibold text-zinc-300">Project process stopped</p>
              <p className="text-xs text-zinc-500 mt-1">Click Run to restart preview</p>
            </div>
            <button
              onClick={startRuntime}
              className="mt-2 px-4 py-2 rounded-xl bg-[#6B69DA] text-xs font-bold text-white shadow hover:bg-[#5A58C9] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Project
            </button>
          </div>
        ) : isReact && status === 'running' && previewUrl && !isSelfUrl ? (
          /* State: Live Running React WebContainer Preview */
          <iframe
            key={refreshKey}
            title={`Preview - ${activeProject}`}
            src={previewUrl}
            className="w-full h-full border-none bg-white"
            allow="cross-origin-isolated; autoplay; camera; microphone; geolocation; clipboard-read; clipboard-write;"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
          />
        ) : (
          /* State: Idle / Fallback */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#121214] text-zinc-500 gap-3">
            <Sparkles className="w-10 h-10 text-[#8E8DED]/60" />
            <div>
              <p className="text-sm font-semibold text-zinc-300">Preview is ready</p>
              <p className="text-xs text-zinc-500 mt-1">Click Run to mount and start the workspace server</p>
            </div>
            <button
              onClick={startRuntime}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B69DA] to-[#8E8DED] text-xs font-bold text-white shadow-lg shadow-[#6B69DA]/20 hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Server
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
