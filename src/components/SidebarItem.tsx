import { Play, Square, MoreVertical, SplitSquareHorizontal } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { RunConfig, ProcessState } from '@/types';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';

interface SidebarItemProps {
  config: RunConfig;
  process?: ProcessState;
  isActive: boolean;
  onSelect: () => void;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
}

export function SidebarItem({
  config,
  process,
  isActive,
  onSelect,
  onStart,
  onStop,
  onEdit,
}: SidebarItemProps) {
  const { deleteConfig, duplicateConfig } = useConfigStore();
  const { splitMode, splitTerminals, toggleSplitTerminal } = useProcessStore();
  const isSplitActive = splitMode !== 'single';
  const isInSplit = splitTerminals.includes(config.id);
  const maxTerminals = splitMode === 'grid-4' ? 4 : 2;
  const canAddToSplit = isSplitActive && !isInSplit && splitTerminals.length < maxTerminals;

  const status = process?.status || 'stopped';
  const isRunning = status === 'running';
  const isStarting = status === 'starting';

  const statusIndicator = {
    stopped: (
      <div className="w-2 h-2 rounded-full bg-zinc-500" />
    ),
    starting: (
      <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
    ),
    running: (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]"></span>
      </span>
    ),
    error: (
      <div className="w-2 h-2 rounded-full bg-error shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
    ),
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      onStop();
    } else {
      onStart();
    }
  };

  const menuContent = (
    <>
      <ContextMenuItem onClick={isRunning ? onStop : onStart}>
        {isRunning ? 'Stop' : 'Start'}
      </ContextMenuItem>
      <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
      <ContextMenuItem onClick={() => duplicateConfig(config.id)}>
        Duplicate
      </ContextMenuItem>
      {isSplitActive && (
        <ContextMenuItem
          onClick={() => toggleSplitTerminal(config.id)}
          disabled={!canAddToSplit && !isInSplit}
        >
          {isInSplit ? 'Remove from Split' : 'Add to Split'}
        </ContextMenuItem>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem
        className="text-red-500"
        onClick={() => deleteConfig(config.id)}
      >
        Delete
      </ContextMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`
            group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
            transition-all duration-150 border border-transparent
            hover:bg-surface-hover hover:border-border/50
            ${isActive ? 'bg-surface-hover border-primary/30' : ''}
          `}
          onClick={onSelect}
        >
          {/* Status indicator */}
          {statusIndicator[status]}

          {/* Config name */}
          <span className="flex-1 text-sm text-text truncate">{config.name}</span>

          {/* Split indicator */}
          {isInSplit && (
            <SplitSquareHorizontal className="w-3 h-3 text-primary" />
          )}

          {/* Color tag */}
          {config.color && (
            <div
              className="w-2 h-4 rounded-sm shadow-sm"
              style={{ backgroundColor: config.color }}
            />
          )}

          {/* Action buttons (visible on hover or when active) */}
          <div className={`flex items-center gap-1 transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${isRunning ? 'hover:text-error hover:bg-error/10' : 'hover:text-success hover:bg-success/10'}`}
              onClick={handleAction}
              disabled={isStarting}
            >
              {isRunning ? (
                <Square className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={isRunning ? onStop : onStart}>
                  {isRunning ? 'Stop' : 'Start'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateConfig(config.id)}>
                  Duplicate
                </DropdownMenuItem>
                {isSplitActive && (
                  <DropdownMenuItem
                    onClick={() => toggleSplitTerminal(config.id)}
                    disabled={!canAddToSplit && !isInSplit}
                  >
                    {isInSplit ? 'Remove from Split' : 'Add to Split'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => deleteConfig(config.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>{menuContent}</ContextMenuContent>
    </ContextMenu>
  );
}
