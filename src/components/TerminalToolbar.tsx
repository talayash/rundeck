import { Play, Square, RotateCw, Trash2, Copy, Search, Download, Filter, Circle, SquareIcon, Columns, Rows, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore, type SplitMode } from '@/stores/processStore';
import type { LogLevel } from '@/utils/logLevelDetector';

interface TerminalToolbarProps {
  onSearch?: () => void;
}

const LOG_LEVEL_BUTTONS: { level: LogLevel; label: string; color: string }[] = [
  { level: 'error', label: 'E', color: 'text-red-400 hover:bg-red-500/20' },
  { level: 'warn', label: 'W', color: 'text-yellow-400 hover:bg-yellow-500/20' },
  { level: 'info', label: 'I', color: 'text-blue-400 hover:bg-blue-500/20' },
  { level: 'debug', label: 'D', color: 'text-zinc-400 hover:bg-zinc-500/20' },
];

const SPLIT_MODE_BUTTONS: { mode: SplitMode; icon: typeof SquareIcon; label: string }[] = [
  { mode: 'single', icon: SquareIcon, label: 'Single' },
  { mode: 'horizontal-2', icon: Columns, label: 'Horizontal Split' },
  { mode: 'vertical-2', icon: Rows, label: 'Vertical Split' },
  { mode: 'grid-4', icon: LayoutGrid, label: 'Grid (4)' },
];

export function TerminalToolbar({ onSearch }: TerminalToolbarProps) {
  const { configs } = useConfigStore();
  const {
    processes,
    activeConfigId,
    startProcess,
    stopProcess,
    restartProcess,
    clearOutput,
    exportLogs,
    filterMode,
    activeFilters,
    toggleFilterMode,
    setLogLevelFilter,
    splitMode,
    setSplitMode,
  } = useProcessStore();

  const activeConfig = configs.find((c) => c.id === activeConfigId);
  const process = activeConfigId ? processes[activeConfigId] : undefined;
  const status = process?.status || 'stopped';
  const isRunning = status === 'running';
  const isFilterActive = activeConfigId ? filterMode[activeConfigId] ?? false : false;
  const currentFilters = activeConfigId ? activeFilters[activeConfigId] : undefined;

  const statusBadge = {
    stopped: {
      label: 'Stopped',
      className: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
      icon: <Circle className="w-2 h-2 fill-current" />
    },
    starting: {
      label: 'Starting',
      className: 'bg-warning/10 text-warning border border-warning/20',
      icon: <Circle className="w-2 h-2 fill-current animate-pulse" />
    },
    running: {
      label: 'Running',
      className: 'bg-success/10 text-success border border-success/20',
      icon: <Circle className="w-2 h-2 fill-current" />
    },
    error: {
      label: 'Error',
      className: 'bg-error/10 text-error border border-error/20',
      icon: <Circle className="w-2 h-2 fill-current" />
    },
  };

  if (!activeConfig) {
    return (
      <div className="h-10 bg-surface/80 backdrop-blur-sm border-b border-border/50 flex items-center px-3">
        <span className="text-sm text-text-muted">No configuration selected</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-10 bg-surface/80 backdrop-blur-sm border-b border-border/50 flex items-center px-3 gap-2">
        {/* Config name and status */}
        <span className="text-sm font-medium text-text">{activeConfig.name}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${statusBadge[status].className}`}>
          {statusBadge[status].icon}
          {statusBadge[status].label}
        </span>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {isRunning ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:text-error hover:bg-error/10"
                  onClick={() => stopProcess(activeConfig.id)}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:text-success hover:bg-success/10"
                  onClick={() => startProcess(activeConfig)}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:text-warning hover:bg-warning/10"
                onClick={() => restartProcess(activeConfig)}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => clearOutput(activeConfig.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Output</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onSearch}
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search (Ctrl+F)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => exportLogs(activeConfig.id, activeConfig.name)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Logs</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isFilterActive ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => toggleFilterMode(activeConfig.id)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Filter View</TooltipContent>
          </Tooltip>

          {isFilterActive && (
            <>
              {LOG_LEVEL_BUTTONS.map(({ level, label, color }) => {
                const isEnabled = currentFilters?.has(level) ?? true;
                return (
                  <Tooltip key={level}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 font-bold text-xs transition-all duration-150 ${color} ${
                          isEnabled ? 'opacity-100' : 'opacity-30'
                        }`}
                        onClick={() => setLogLevelFilter(activeConfig.id, level, !isEnabled)}
                      >
                        {label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isEnabled ? 'Hide' : 'Show'} {level} logs
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </>
          )}

          <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />

          {/* Split mode buttons */}
          {SPLIT_MODE_BUTTONS.map(({ mode, icon: Icon, label }) => (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${
                    splitMode === mode ? 'bg-primary/20 text-primary' : ''
                  }`}
                  onClick={() => setSplitMode(mode)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
