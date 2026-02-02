import { useMemo, useRef, useEffect } from 'react';
import { useProcessStore } from '@/stores/processStore';
import { parseLogLines, getLogLevelColor, type LogLevel } from '@/utils/logLevelDetector';
import { stripAnsi } from '@/utils/ansiUtils';

interface FilteredLogViewProps {
  configId: string;
}

export function FilteredLogView({ configId }: FilteredLogViewProps) {
  const terminalOutputs = useProcessStore((state) => state.terminalOutputs[configId] || []);
  const activeFilters = useProcessStore((state) => state.activeFilters[configId] || new Set<LogLevel>());
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLines = useMemo(() => {
    const parsedLines = parseLogLines(terminalOutputs);
    return parsedLines.filter((line) => activeFilters.has(line.level));
  }, [terminalOutputs, activeFilters]);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLines.length]);

  if (filteredLines.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <p className="text-sm">No matching log lines</p>
          <p className="text-xs mt-1">Try adjusting your filter settings</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-auto font-mono text-sm p-2"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      {filteredLines.map((line) => (
        <div
          key={line.index}
          className={`whitespace-pre-wrap break-all leading-relaxed ${getLogLevelColor(line.level)}`}
        >
          {stripAnsi(line.text)}
        </div>
      ))}
    </div>
  );
}
