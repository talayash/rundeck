import { useProcessStore } from '@/stores/processStore';
import { useConfigStore } from '@/stores/configStore';

export function StatusBar() {
  const { processes, activeConfigId } = useProcessStore();
  const { configs } = useConfigStore();

  const runningCount = Object.values(processes).filter(
    (p) => p.status === 'running'
  ).length;

  const activeConfig = configs.find((c) => c.id === activeConfigId);

  return (
    <div className="h-7 bg-surface/80 backdrop-blur-sm border-t border-border/50 flex items-center justify-between px-3 text-xs text-text-muted">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {runningCount > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
          )}
          <span>
            {runningCount} process{runningCount !== 1 ? 'es' : ''} running
          </span>
        </div>
        {activeConfig && (
          <>
            <span className="text-border">|</span>
            <span className="text-text">
              {activeConfig.name}
            </span>
          </>
        )}
      </div>
      <span className="text-text-muted/70">v0.1.0</span>
    </div>
  );
}
