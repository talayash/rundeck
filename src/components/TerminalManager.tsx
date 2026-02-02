import { TerminalView } from './TerminalView';
import { FilteredLogView } from './FilteredLogView';
import { SplitTerminalView } from './SplitTerminalView';
import { useProcessStore } from '@/stores/processStore';
import type { SearchAddon } from '@xterm/addon-search';

interface TerminalManagerProps {
  onSearchAddonReady?: (searchAddon: SearchAddon | null) => void;
}

export function TerminalManager({ onSearchAddonReady }: TerminalManagerProps) {
  const { processes, activeConfigId, filterMode, splitMode, splitTerminals } = useProcessStore();
  const isFilterActive = activeConfigId ? filterMode[activeConfigId] ?? false : false;
  const isSplitActive = splitMode !== 'single';

  // Get all config IDs that have been started at some point
  const startedConfigIds = Object.keys(processes);

  if (startedConfigIds.length === 0 || !activeConfigId) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <p className="text-lg mb-2">No active terminal</p>
          <p className="text-sm">Select a configuration to start</p>
        </div>
      </div>
    );
  }

  // Split terminal view mode
  if (isSplitActive) {
    return (
      <SplitTerminalView
        splitMode={splitMode}
        splitTerminals={splitTerminals}
        activeConfigId={activeConfigId}
      />
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Filtered log view overlay */}
      {isFilterActive && activeConfigId && (
        <div className="absolute inset-0 z-10">
          <FilteredLogView configId={activeConfigId} />
        </div>
      )}

      {/* Terminal views (hidden when filter mode is active) */}
      {startedConfigIds.map((configId) => (
        <div
          key={configId}
          className={`absolute inset-0 ${
            configId === activeConfigId && !isFilterActive ? '' : 'invisible'
          }`}
        >
          <TerminalView
            configId={configId}
            isActive={configId === activeConfigId && !isFilterActive}
            onSearchAddonReady={configId === activeConfigId ? onSearchAddonReady : undefined}
          />
        </div>
      ))}
    </div>
  );
}
