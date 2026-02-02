import { useState } from 'react';
import { Plus, Settings, Play, Search, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarItem } from './SidebarItem';
import { SidebarFolder } from './SidebarFolder';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';

interface SidebarProps {
  onNewConfig: () => void;
  onEditConfig: (id: string) => void;
  onSettings: () => void;
}

export function Sidebar({ onNewConfig, onEditConfig, onSettings }: SidebarProps) {
  const [filter, setFilter] = useState('');
  const { configs, folders } = useConfigStore();
  const { processes, activeConfigId, setActiveConfig, startProcess, stopProcess } =
    useProcessStore();

  const filteredConfigs = configs.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const ungroupedConfigs = filteredConfigs.filter((c) => !c.folderId);
  const groupedByFolder = folders.map((folder) => ({
    folder,
    configs: filteredConfigs.filter((c) => c.folderId === folder.id),
  }));

  const handleStartAll = async () => {
    for (const config of configs) {
      const process = processes[config.id];
      if (process?.status !== 'running') {
        await startProcess(config);
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-surface to-card">
      {/* Header */}
      <div className="p-3 space-y-3 relative z-10">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Filter configurations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="!pl-9 h-8 bg-background/50 border-border/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="success"
            size="sm"
            className="flex-1 h-8"
            onClick={handleStartAll}
          >
            <Play className="w-3 h-3 mr-1" />
            Start All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onNewConfig}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onSettings}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Config List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groupedByFolder.map(({ folder, configs: folderConfigs }) => (
            <SidebarFolder
              key={folder.id}
              folder={folder}
              configs={folderConfigs}
              processes={processes}
              activeConfigId={activeConfigId}
              onSelect={setActiveConfig}
              onStart={startProcess}
              onStop={stopProcess}
              onEdit={onEditConfig}
            />
          ))}

          {ungroupedConfigs.map((config) => (
            <SidebarItem
              key={config.id}
              config={config}
              process={processes[config.id]}
              isActive={activeConfigId === config.id}
              onSelect={() => setActiveConfig(config.id)}
              onStart={() => startProcess(config)}
              onStop={() => stopProcess(config.id)}
              onEdit={() => onEditConfig(config.id)}
            />
          ))}

          {configs.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Terminal className="w-6 h-6 text-primary/60" />
              </div>
              <p className="mb-2">No configurations yet.</p>
              <button
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
                onClick={onNewConfig}
              >
                Create your first config
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
