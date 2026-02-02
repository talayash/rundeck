import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import type { ProcessState, ProcessStatus, RunConfig } from '@/types';
import { buildCommand } from '@/utils/commandBuilder';
import { stripAnsi } from '@/utils/ansiUtils';
import type { LogLevel } from '@/utils/logLevelDetector';

export type SplitMode = 'single' | 'horizontal-2' | 'vertical-2' | 'grid-4';

interface ProcessStore {
  processes: Record<string, ProcessState>;
  activeConfigId: string | null;
  terminalOutputs: Record<string, string[]>;
  clearVersion: Record<string, number>;
  filterMode: Record<string, boolean>;
  activeFilters: Record<string, Set<LogLevel>>;
  splitMode: SplitMode;
  splitTerminals: string[];

  setActiveConfig: (id: string | null) => void;

  startProcess: (config: RunConfig) => Promise<void>;
  stopProcess: (id: string) => Promise<void>;
  restartProcess: (config: RunConfig) => Promise<void>;

  updateProcessStatus: (id: string, status: ProcessStatus, exitCode?: number) => void;
  appendOutput: (id: string, data: string) => void;
  clearOutput: (id: string) => void;
  exportLogs: (configId: string, configName: string) => Promise<void>;

  toggleFilterMode: (configId: string) => void;
  setLogLevelFilter: (configId: string, level: LogLevel, enabled: boolean) => void;

  setSplitMode: (mode: SplitMode) => void;
  toggleSplitTerminal: (configId: string) => void;

  initListeners: () => Promise<() => void>;
}

const DEFAULT_FILTERS: Set<LogLevel> = new Set(['error', 'warn', 'info', 'debug', 'unknown']);

export const useProcessStore = create<ProcessStore>((set, get) => ({
  processes: {},
  activeConfigId: null,
  terminalOutputs: {},
  clearVersion: {},
  filterMode: {},
  activeFilters: {},
  splitMode: 'single',
  splitTerminals: [],

  setActiveConfig: (id) => set({ activeConfigId: id }),

  startProcess: async (config) => {
    const { id } = config;
    const { command, args } = buildCommand(config);

    set((state) => ({
      processes: {
        ...state.processes,
        [id]: {
          status: 'starting',
          startedAt: Date.now(),
          restartCount: state.processes[id]?.restartCount || 0,
        },
      },
      terminalOutputs: {
        ...state.terminalOutputs,
        [id]: state.terminalOutputs[id] || [],
      },
    }));

    try {
      await invoke('spawn_process', {
        config: {
          id,
          command,
          args,
          working_dir: config.workingDir,
          env: config.env,
        },
      });

      set((state) => ({
        processes: {
          ...state.processes,
          [id]: {
            ...state.processes[id],
            status: 'running',
          },
        },
      }));
    } catch (error) {
      console.error('Failed to start process:', error);
      set((state) => ({
        processes: {
          ...state.processes,
          [id]: {
            ...state.processes[id],
            status: 'error',
          },
        },
      }));
    }
  },

  stopProcess: async (id) => {
    try {
      await invoke('kill_process', { id });
      set((state) => ({
        processes: {
          ...state.processes,
          [id]: {
            ...state.processes[id],
            status: 'stopped',
          },
        },
      }));
    } catch (error) {
      console.error('Failed to stop process:', error);
    }
  },

  restartProcess: async (config) => {
    const { startProcess } = get();

    // Always try to kill the process first to clean up any lingering PTY
    try {
      await invoke('kill_process', { id: config.id });
    } catch {
      // Ignore errors - process might not exist
    }

    // Brief delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    set((state) => ({
      processes: {
        ...state.processes,
        [config.id]: {
          ...state.processes[config.id],
          status: 'stopped',
          restartCount: (state.processes[config.id]?.restartCount || 0) + 1,
        },
      },
    }));

    await startProcess(config);
  },

  updateProcessStatus: (id, status, exitCode) => {
    set((state) => ({
      processes: {
        ...state.processes,
        [id]: {
          ...state.processes[id],
          status,
          exitCode,
        },
      },
    }));
  },

  appendOutput: (id, data) => {
    set((state) => ({
      terminalOutputs: {
        ...state.terminalOutputs,
        [id]: [...(state.terminalOutputs[id] || []), data],
      },
    }));
  },

  clearOutput: (id) => {
    set((state) => ({
      terminalOutputs: {
        ...state.terminalOutputs,
        [id]: [],
      },
      clearVersion: {
        ...state.clearVersion,
        [id]: (state.clearVersion[id] || 0) + 1,
      },
    }));
  },

  exportLogs: async (configId, configName) => {
    const outputs = get().terminalOutputs[configId] || [];
    if (outputs.length === 0) {
      return;
    }

    const rawContent = outputs.join('');
    const cleanContent = stripAnsi(rawContent);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultFilename = `${configName.replace(/[^a-zA-Z0-9-_]/g, '_')}-${timestamp}.log`;

    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [
        { name: 'Log Files', extensions: ['log', 'txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (filePath) {
      await writeTextFile(filePath, cleanContent);
    }
  },

  toggleFilterMode: (configId) => {
    set((state) => {
      const isCurrentlyActive = state.filterMode[configId] ?? false;
      return {
        filterMode: {
          ...state.filterMode,
          [configId]: !isCurrentlyActive,
        },
        activeFilters: {
          ...state.activeFilters,
          [configId]: state.activeFilters[configId] || new Set(DEFAULT_FILTERS),
        },
      };
    });
  },

  setLogLevelFilter: (configId, level, enabled) => {
    set((state) => {
      const currentFilters = state.activeFilters[configId] || new Set(DEFAULT_FILTERS);
      const newFilters = new Set(currentFilters);
      if (enabled) {
        newFilters.add(level);
      } else {
        newFilters.delete(level);
      }
      return {
        activeFilters: {
          ...state.activeFilters,
          [configId]: newFilters,
        },
      };
    });
  },

  setSplitMode: (mode) => {
    set((state) => {
      // When switching to single, clear split terminals
      if (mode === 'single') {
        return { splitMode: mode, splitTerminals: [] };
      }

      // When enabling split mode, initialize with active config if available
      const { activeConfigId, splitTerminals } = state;
      let newSplitTerminals = [...splitTerminals];

      if (newSplitTerminals.length === 0 && activeConfigId) {
        newSplitTerminals = [activeConfigId];
      }

      return { splitMode: mode, splitTerminals: newSplitTerminals };
    });
  },

  toggleSplitTerminal: (configId) => {
    set((state) => {
      const { splitTerminals, splitMode } = state;
      const maxTerminals = splitMode === 'grid-4' ? 4 : 2;

      if (splitTerminals.includes(configId)) {
        // Remove from split
        return {
          splitTerminals: splitTerminals.filter((id) => id !== configId),
        };
      } else if (splitTerminals.length < maxTerminals) {
        // Add to split
        return {
          splitTerminals: [...splitTerminals, configId],
        };
      }

      return state;
    });
  },

  initListeners: async () => {
    const unlistenOutput = await listen<{ id: string; data: string }>(
      'pty-output',
      (event) => {
        get().appendOutput(event.payload.id, event.payload.data);
      }
    );

    const unlistenExit = await listen<{ id: string; code: number | null }>(
      'pty-exit',
      (event) => {
        const status: ProcessStatus = event.payload.code === 0 ? 'stopped' : 'error';
        get().updateProcessStatus(event.payload.id, status, event.payload.code ?? undefined);
      }
    );

    return () => {
      unlistenOutput();
      unlistenExit();
    };
  },
}));
