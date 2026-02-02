import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = async () => {
    if (await appWindow.isMaximized()) {
      appWindow.unmaximize();
    } else {
      appWindow.maximize();
    }
  };
  const handleClose = () => appWindow.close();

  return (
    <div
      className="h-10 bg-gradient-to-r from-surface via-surface to-card flex items-center justify-between select-none border-b border-border/50 relative z-20"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2.5 px-3" data-tauri-drag-region>
        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="text-sm font-semibold text-text tracking-tight">RunHub</span>
      </div>

      <div className="flex">
        <button
          onClick={handleMinimize}
          className="w-12 h-10 flex items-center justify-center hover:bg-surface-hover transition-colors duration-150"
        >
          <Minus className="w-4 h-4 text-text-muted" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-10 flex items-center justify-center hover:bg-surface-hover transition-colors duration-150"
        >
          <Square className="w-3 h-3 text-text-muted" />
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-10 flex items-center justify-center hover:bg-error transition-colors duration-150 group"
        >
          <X className="w-4 h-4 text-text-muted group-hover:text-white transition-colors duration-150" />
        </button>
      </div>
    </div>
  );
}
