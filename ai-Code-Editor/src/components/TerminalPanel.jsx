import React, { useEffect, useRef, useState } from 'react';
import { codeBase } from '../store/codeBase';
import {
  Terminal as TerminalIcon,
  Trash2,
  RotateCw,
  ArrowDownCircle,
  Copy,
  Check,
} from 'lucide-react';

/**
 * Basic ANSI escape sequence stripper / simple parser for terminal logs.
 */
function cleanAnsi(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

const TerminalPanel = ({ className = '' }) => {
  const terminalLogs = codeBase((state) => state.runtime?.terminalLogs) || [];
  const status = codeBase((state) => state.runtime?.status) || 'idle';
  const clearTerminalLogs = codeBase((state) => state.clearTerminalLogs);
  const restartRuntime = codeBase((state) => state.restartRuntime);

  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, autoScroll]);

  const handleCopyLogs = () => {
    const rawText = terminalLogs.map((l) => cleanAnsi(l.text)).join('');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'mounting':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">Mounting</span>;
      case 'installing':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Installing</span>;
      case 'starting':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">Starting</span>;
      case 'running':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">Running</span>;
      case 'error':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-medium">Error</span>;
      case 'stopped':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 font-medium">Stopped</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-700/30 text-zinc-400 font-medium">Idle</span>;
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[#0e0e11] text-zinc-200 font-mono select-text border-t border-[#1e1e24] ${className}`}>
      {/* Terminal Toolbar */}
      <div className="h-9 bg-[#141418] border-b border-[#23232a] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300 font-sans tracking-wide">Terminal Output</span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-1">
          <button
            title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${
              autoScroll ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          <button
            title="Copy logs"
            onClick={handleCopyLogs}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            title="Restart process"
            onClick={restartRuntime}
            className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            title="Clear terminal"
            onClick={clearTerminalLogs}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content Stream */}
      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto overflow-x-auto text-[13px] leading-relaxed select-text space-y-0.5"
      >
        {terminalLogs.length === 0 ? (
          <div className="text-zinc-500 text-xs py-4 select-none italic">
            Waiting for process execution...
          </div>
        ) : (
          terminalLogs.map((log, index) => {
            const cleanText = cleanAnsi(log.text);
            const isError = log.stream === 'stderr';
            const isSystem = log.stream === 'system';

            let colorClass = 'text-zinc-300';
            if (isError) colorClass = 'text-rose-400 font-medium';
            else if (isSystem) colorClass = 'text-cyan-300';
            else if (cleanText.includes('> ') || cleanText.includes('npm run') || cleanText.includes('vite')) {
              colorClass = 'text-amber-300 font-semibold';
            }

            return (
              <span
                key={index}
                className={`whitespace-pre-wrap break-all inline-block w-full ${colorClass}`}
              >
                {cleanText}
              </span>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalPanel;
