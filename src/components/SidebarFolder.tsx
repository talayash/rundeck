import { ChevronRight, Folder as FolderIcon } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { useConfigStore } from '@/stores/configStore';
import type { Folder, RunConfig, ProcessState } from '@/types';

interface SidebarFolderProps {
  folder: Folder;
  configs: RunConfig[];
  processes: Record<string, ProcessState>;
  activeConfigId: string | null;
  onSelect: (id: string) => void;
  onStart: (config: RunConfig) => void;
  onStop: (id: string) => void;
  onEdit: (id: string) => void;
}

export function SidebarFolder({
  folder,
  configs,
  processes,
  activeConfigId,
  onSelect,
  onStart,
  onStop,
  onEdit,
}: SidebarFolderProps) {
  const { toggleFolder } = useConfigStore();

  if (configs.length === 0) return null;

  const runningCount = configs.filter(
    (c) => processes[c.id]?.status === 'running'
  ).length;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-hover transition-colors duration-150"
        onClick={() => toggleFolder(folder.id)}
      >
        <ChevronRight
          className={`w-4 h-4 text-text-muted transition-transform duration-150 ${
            folder.expanded ? 'rotate-90' : ''
          }`}
        />
        <FolderIcon
          className="w-4 h-4"
          style={{ color: folder.color || '#a1a1aa' }}
        />
        <span className="flex-1 text-sm text-text font-medium">{folder.name}</span>
        {runningCount > 0 && (
          <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded font-medium shadow-sm">
            {runningCount}
          </span>
        )}
        <span className="text-xs text-text-muted bg-background/50 px-1.5 py-0.5 rounded">
          {configs.length}
        </span>
      </div>

      {folder.expanded && (
        <div className="pl-4 space-y-1 border-l border-border/30 ml-2">
          {configs.map((config) => (
            <SidebarItem
              key={config.id}
              config={config}
              process={processes[config.id]}
              isActive={activeConfigId === config.id}
              onSelect={() => onSelect(config.id)}
              onStart={() => onStart(config)}
              onStop={() => onStop(config.id)}
              onEdit={() => onEdit(config.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
