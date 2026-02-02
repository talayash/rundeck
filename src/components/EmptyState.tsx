import { Terminal, Plus, FolderOpen, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onNewConfig: () => void;
}

export function EmptyState({ onNewConfig }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-background via-background to-card/30">
      <div className="text-center max-w-md px-8 animate-slide-up-fade">
        {/* Logo with glow effect */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20">
            <Terminal className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-text mb-2">Welcome to RunHub</h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          Manage all your terminal-based run configurations in one place.
          Create configurations for shells, Gradle, Maven, Node.js, Docker, and more.
        </p>

        {/* Quick actions */}
        <div className="space-y-3 mb-8">
          <Button
            variant="success"
            className="w-full justify-start gap-3 h-11"
            onClick={onNewConfig}
          >
            <Plus className="w-4 h-4" />
            Create your first configuration
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11"
            disabled
          >
            <FolderOpen className="w-4 h-4" />
            Import from IntelliJ (coming soon)
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">New config</span>
              <kbd className="px-2 py-1 bg-background/80 rounded-md border border-border text-text font-mono">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Command palette</span>
              <kbd className="px-2 py-1 bg-background/80 rounded-md border border-border text-text font-mono">Ctrl+P</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Settings</span>
              <kbd className="px-2 py-1 bg-background/80 rounded-md border border-border text-text font-mono">Ctrl+Shift+S</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Start all</span>
              <kbd className="px-2 py-1 bg-background/80 rounded-md border border-border text-text font-mono">Ctrl+Shift+A</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
