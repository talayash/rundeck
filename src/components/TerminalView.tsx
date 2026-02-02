import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useProcessStore } from '@/stores/processStore';
import '@xterm/xterm/css/xterm.css';

interface TerminalViewProps {
  configId: string;
  isActive: boolean;
  onSearchAddonReady?: (searchAddon: SearchAddon | null) => void;
}

export function TerminalView({ configId, isActive, onSearchAddonReady }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const clearVersion = useProcessStore((state) => state.clearVersion[configId] || 0);

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current) {
      fitAddonRef.current.fit();
      const { cols, rows } = xtermRef.current;
      invoke('resize_pty', { id: configId, cols, rows }).catch(console.error);
    }
  }, [configId]);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const terminal = new Terminal({
      theme: {
        background: '#12121c',
        foreground: '#e8e8ed',
        cursor: '#3b82f6',
        cursorAccent: '#12121c',
        selectionBackground: '#3b82f680',
        selectionForeground: '#ffffff',
        black: '#1a1a2e',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e8e8ed',
        brightBlack: '#71717a',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde047',
        brightBlue: '#93c5fd',
        brightMagenta: '#c4b5fd',
        brightCyan: '#67e8f9',
        brightWhite: '#fafafa',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    // Notify parent of search addon
    onSearchAddonReady?.(searchAddon);

    // Handle keyboard input
    terminal.onData((data) => {
      invoke('write_to_process', { id: configId, data }).catch(console.error);
    });

    // Listen for PTY output
    const unlistenPromise = listen<{ id: string; data: string }>(
      'pty-output',
      (event) => {
        if (event.payload.id === configId) {
          terminal.write(event.payload.data);
        }
      }
    );

    // Handle window resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(terminalRef.current);

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
      resizeObserver.disconnect();
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
      onSearchAddonReady?.(null);
    };
  }, [configId, handleResize, onSearchAddonReady]);

  useEffect(() => {
    if (isActive) {
      handleResize();
      xtermRef.current?.focus();
    }
  }, [isActive, handleResize]);

  // Clear terminal when clearVersion changes
  useEffect(() => {
    if (clearVersion > 0 && xtermRef.current) {
      xtermRef.current.clear();
    }
  }, [clearVersion]);

  return (
    <div
      ref={terminalRef}
      className={`h-full w-full ${isActive ? '' : 'hidden'}`}
      style={{ padding: '12px' }}
    />
  );
}
