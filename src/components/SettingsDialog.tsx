import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/stores/settingsStore';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCENT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useSettingsStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-text">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="terminal" className="flex-1">Terminal</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex-1">Shortcuts</TabsTrigger>
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <div>
                  <p className="text-sm font-medium text-text">Start on boot</p>
                  <p className="text-xs text-text-muted">Launch RunHub when Windows starts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startOnBoot}
                  onChange={(e) => settings.updateSettings({ startOnBoot: e.target.checked })}
                  className="rounded w-4 h-4 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <div>
                  <p className="text-sm font-medium text-text">Minimize to tray</p>
                  <p className="text-xs text-text-muted">Keep RunHub running in system tray when closed</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => settings.updateSettings({ minimizeToTray: e.target.checked })}
                  className="rounded w-4 h-4 accent-primary"
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Default shell</p>
                <Input
                  value={settings.defaultShell}
                  onChange={(e) => settings.updateSettings({ defaultShell: e.target.value })}
                  placeholder="powershell.exe"
                  className="bg-background/50 border-border/50 font-mono"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Font family</p>
                <Input
                  value={settings.fontFamily}
                  onChange={(e) => settings.updateSettings({ fontFamily: e.target.value })}
                  className="bg-background/50 border-border/50 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text">Font size</p>
                  <Input
                    type="number"
                    value={settings.fontSize}
                    onChange={(e) => settings.updateSettings({ fontSize: parseInt(e.target.value) || 13 })}
                    min={8}
                    max={24}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-text">Scrollback lines</p>
                  <Input
                    type="number"
                    value={settings.scrollback}
                    onChange={(e) => settings.updateSettings({ scrollback: parseInt(e.target.value) || 10000 })}
                    min={1000}
                    max={100000}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Cursor style</p>
                <div className="flex gap-2">
                  {(['bar', 'block', 'underline'] as const).map((style) => (
                    <Button
                      key={style}
                      variant={settings.cursorStyle === style ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => settings.updateSettings({ cursorStyle: style })}
                      className={settings.cursorStyle === style ? 'shadow-lg shadow-primary/20' : ''}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <p className="text-sm font-medium text-text">Cursor blink</p>
                <input
                  type="checkbox"
                  checked={settings.cursorBlink}
                  onChange={(e) => settings.updateSettings({ cursorBlink: e.target.checked })}
                  className="rounded w-4 h-4 accent-primary"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Accent color</p>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-lg transition-all duration-150 ${
                        settings.accentColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => settings.updateSettings({ accentColor: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Sidebar width</p>
                <Input
                  type="number"
                  value={settings.sidebarWidth}
                  onChange={(e) => settings.updateSettings({ sidebarWidth: parseInt(e.target.value) || 280 })}
                  min={200}
                  max={400}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-4">
            <div className="space-y-2">
              {[
                { key: 'Ctrl+N', action: 'New configuration' },
                { key: 'Ctrl+Shift+S', action: 'Open settings' },
                { key: 'Ctrl+F', action: 'Search in terminal' },
                { key: 'Ctrl+P', action: 'Command palette' },
                { key: 'Ctrl+L', action: 'Clear terminal' },
                { key: 'Ctrl+Shift+A', action: 'Start all' },
                { key: 'Ctrl+Shift+X', action: 'Stop all' },
              ].map(({ key, action }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 px-3 bg-background/30 rounded-lg border border-border/30"
                >
                  <span className="text-sm text-text">{action}</span>
                  <kbd className="px-2.5 py-1 bg-card border border-border/50 rounded-md text-xs font-mono text-text-muted">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-white text-3xl font-bold">R</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-text mb-1">RunHub</h2>
              <p className="text-text-muted mb-4">Version 0.1.0</p>
              <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                A Windows desktop application for managing terminal-based run
                configurations. Built with Tauri, React, and TypeScript.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
