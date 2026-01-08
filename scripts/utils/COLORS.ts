/**
 * ANSI color codes for terminal output formatting
 */
const COLORS = {
    RESET: '\x1b[0m',
    YELLOW: '\x1b[33m',
    BOLD: '\x1b[1m',
} as const;

export default COLORS;
