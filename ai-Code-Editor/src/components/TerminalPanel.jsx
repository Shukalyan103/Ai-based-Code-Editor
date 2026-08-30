import React, { useEffect, useRef, useState } from 'react';
import { codeBase } from '../store/codeBase';
import { projectRuntime } from '../services/webcontainer/projectRuntime';
import {
  Terminal as TerminalIcon,
  Trash2,
  RotateCw,
  Copy,
  Check,
  ArrowDown,
} from 'lucide-react';

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

const TerminalPanel = ({ className = '' }) => {
  const terminalRef = useRef(null);
  const xtermInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);

  const status = codeBase((state) => state.runtime?.status) || 'idle';
  const clearTerminalLogs = codeBase((state) => state.clearTerminalLogs);
  const restartRuntime = codeBase((state) => state.restartRuntime);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm Terminal instance
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      lineHeight: 1.25,
      convertEol: true,
      scrollback: 5000,
      disableStdin: true,
      theme: {
        background: '#0e0e11',
        foreground: '#d4d4d8',
        cursor: '#38bdf8',
        selectionBackground: 'rgba(56, 189, 248, 0.25)',
        black: '#1e1e24',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#f4f4f5',
        brightBlack: '#71717a',
        brightRed: '#ef4444',
        brightGreen: '#22c55e',
        brightYellow: '#eab308',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#06b6d4',
        brightWhite: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Write existing logs into the terminal instance
    const initialLogs = codeBase.getState().runtime?.terminalLogs || [];
    if (initialLogs.length > 0) {
      for (const log of initialLogs) {
        term.write(log.text);
      }
    } else {
      term.writeln('\x1b[90m[Terminal initialized. Waiting for process output...]\x1b[0m');
    }

    // Subscribe to live incoming log streams from projectRuntime
    const unsubscribeLogs = projectRuntime.subscribeLogs((logEntries) => {
      if (!term) return;
      const entries = Array.isArray(logEntries) ? logEntries : [logEntries];
      for (const entry of entries) {
        if (entry?.text) {
          term.write(entry.text);
        }
      }
    });

    // ResizeObserver to automatically adjust terminal dimensions on panel resize
    const resizeObserver = new ResizeObserver(() => {
      try {
        if (fitAddonRef.current && terminalRef.current?.clientWidth > 0) {
          fitAddonRef.current.fit();
        }
      } catch (err) {
        console.warn('Terminal fit error:', err);
      }
    });

    resizeObserver.observe(terminalRef.current);

    // Initial fit with small delay to ensure container layout dimensions are calculated
    const initialTimer = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {}
    }, 50);

    return () => {
      clearTimeout(initialTimer);
      unsubscribeLogs();
      resizeObserver.disconnect();
      term.dispose();
      xtermInstanceRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  const handleClear = () => {
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.clear();
    }
    clearTerminalLogs();
  };

  const handleScrollToBottom = () => {
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.scrollToBottom();
    }
  };

  const handleCopyLogs = () => {
    if (xtermInstanceRef.current) {
      const selection = xtermInstanceRef.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    }

    const allLogs = codeBase.getState().runtime?.terminalLogs || [];
    const text = allLogs.map((l) => l.text).join('');
    navigator.clipboard.writeText(text);
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
    <div className={`h-full w-full flex flex-col bg-[#0e0e11] text-zinc-200 select-text overflow-hidden ${className}`}>
      {/* Terminal Toolbar */}
      <div className="h-9 bg-[#141418] border-b border-[#23232a] flex items-center justify-between px-3 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300 font-sans tracking-wide">Terminal</span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-1">
          <button
            title="Scroll to bottom"
            onClick={handleScrollToBottom}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            title="Copy selection or all logs"
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
            onClick={handleClear}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* xterm.js DOM Mount Target */}
      <div className="flex-1 w-full h-[calc(100%-36px)] p-2 bg-[#0e0e11] overflow-hidden">
        <div ref={terminalRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default TerminalPanel;
