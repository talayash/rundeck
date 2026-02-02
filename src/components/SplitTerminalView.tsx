import { TerminalView } from './TerminalView';
import { useProcessStore, type SplitMode } from '@/stores/processStore';
import { useConfigStore } from '@/stores/configStore';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplitTerminalViewProps {
  splitMode: SplitMode;
  splitTerminals: string[];
  activeConfigId: string | null;
}

const GRID_CLASSES: Record<SplitMode, string> = {
  'single': 'grid-cols-1 grid-rows-1',
  'horizontal-2': 'grid-cols-2 grid-rows-1',
  'vertical-2': 'grid-cols-1 grid-rows-2',
  'grid-4': 'grid-cols-2 grid-rows-2',
};

export function SplitTerminalView({
  splitMode,
  splitTerminals,
  activeConfigId,
}: SplitTerminalViewProps) {
  const { configs } = useConfigStore();
  const { setActiveConfig, toggleSplitTerminal } = useProcessStore();

  const getConfigName = (configId: string) => {
    return configs.find((c) => c.id === configId)?.name || 'Unknown';
  };

  const maxPanes = splitMode === 'grid-4' ? 4 : 2;
  const emptySlots = Math.max(0, maxPanes - splitTerminals.length);

  return (
    <div className={`h-full w-full grid gap-1 ${GRID_CLASSES[splitMode]}`}>
      {splitTerminals.map((configId) => (
        <div
          key={configId}
          className={`relative flex flex-col overflow-hidden border ${
            configId === activeConfigId
              ? 'border-primary'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setActiveConfig(configId)}
        >
          {/* Mini header */}
          <div className="h-7 bg-surface border-b border-border flex items-center px-2 gap-2 shrink-0">
            <span className="text-xs font-medium text-text truncate flex-1">
              {getConfigName(configId)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleSplitTerminal(configId);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Terminal */}
          <div className="flex-1 min-h-0">
            <TerminalView
              configId={configId}
              isActive={configId === activeConfigId}
            />
          </div>
        </div>
      ))}

      {/* Empty slots */}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="flex items-center justify-center border border-dashed border-border text-text-muted"
        >
          <div className="text-center">
            <p className="text-sm">Empty slot</p>
            <p className="text-xs mt-1">Click a config to add</p>
          </div>
        </div>
      ))}
    </div>
  );
}
