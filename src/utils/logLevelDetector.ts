export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'unknown';

export interface ParsedLogLine {
  text: string;
  level: LogLevel;
  index: number;
}

// Patterns for detecting log levels
const LOG_PATTERNS: { level: LogLevel; patterns: RegExp[] }[] = [
  {
    level: 'error',
    patterns: [
      /\b(ERROR|FATAL|SEVERE|CRITICAL)\b/i,
      /\[ERROR\]/i,
      /\[FATAL\]/i,
      /error:/i,
      /exception:/i,
      /failed:/i,
      /failure:/i,
    ],
  },
  {
    level: 'warn',
    patterns: [
      /\b(WARN|WARNING)\b/i,
      /\[WARN\]/i,
      /\[WARNING\]/i,
      /warning:/i,
    ],
  },
  {
    level: 'info',
    patterns: [
      /\b(INFO)\b/i,
      /\[INFO\]/i,
      /info:/i,
    ],
  },
  {
    level: 'debug',
    patterns: [
      /\b(DEBUG|TRACE|VERBOSE)\b/i,
      /\[DEBUG\]/i,
      /\[TRACE\]/i,
      /debug:/i,
    ],
  },
];

/**
 * Detect the log level of a single line
 */
export function detectLogLevel(line: string): LogLevel {
  for (const { level, patterns } of LOG_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return level;
      }
    }
  }
  return 'unknown';
}

/**
 * Parse terminal output into structured log lines
 */
export function parseLogLines(outputs: string[]): ParsedLogLine[] {
  const lines: ParsedLogLine[] = [];
  let index = 0;

  for (const output of outputs) {
    // Split by newlines but preserve the content
    const outputLines = output.split(/(\r?\n)/);
    let currentLine = '';

    for (const part of outputLines) {
      if (part === '\n' || part === '\r\n') {
        if (currentLine) {
          lines.push({
            text: currentLine,
            level: detectLogLevel(currentLine),
            index: index++,
          });
          currentLine = '';
        }
      } else {
        currentLine += part;
      }
    }

    // Handle any remaining content without trailing newline
    if (currentLine) {
      lines.push({
        text: currentLine,
        level: detectLogLevel(currentLine),
        index: index++,
      });
    }
  }

  return lines;
}

/**
 * Get color class for log level
 */
export function getLogLevelColor(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'text-red-400';
    case 'warn':
      return 'text-yellow-400';
    case 'info':
      return 'text-blue-400';
    case 'debug':
      return 'text-zinc-500';
    default:
      return 'text-text';
  }
}

/**
 * Get background color class for log level badge
 */
export function getLogLevelBadgeColor(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'bg-red-500/20 text-red-400';
    case 'warn':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'info':
      return 'bg-blue-500/20 text-blue-400';
    case 'debug':
      return 'bg-zinc-500/20 text-zinc-400';
    default:
      return 'bg-zinc-500/10 text-zinc-500';
  }
}
