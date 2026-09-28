const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_RED = '\x1b[31m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_BOLD = '\x1b[1m';

const EMOJIS = {
    // One column emojis need to be rendered with an extra space after to align with two column emojis
    INFO: '▶️ ',
    WARN: '⚠️ ',

    // Two column emojis can be rendered as-is
    SUCCESS: '✅',
    ERROR: '🔴',
};

type LogStream = 'stdout' | 'stderr';

type LogLevel = 'info' | 'bold' | 'success' | 'note' | 'warn' | 'error' | 'errorDetail';

/** Mirrors the console API: informational levels on stdout, warnings and errors on stderr. */
const outputStreams: Record<LogLevel, LogStream> = {
    info: 'stdout',
    bold: 'stdout',
    success: 'stdout',
    note: 'stdout',
    warn: 'stderr',
    error: 'stderr',
    errorDetail: 'stderr',
};

/**
 * Redirects individual levels; levels left out keep whatever they are set to. Call this at startup
 * from a script whose stdout carries machine-readable output (e.g. JSON parsed by another process),
 * where a stray log line would corrupt the payload: `setOutputStream({info: 'stderr'})`.
 */
const setOutputStream = (streams: Partial<Record<LogLevel, LogStream>>) => {
    Object.assign(outputStreams, streams);
};

const write = (level: LogLevel, ...args: unknown[]) => {
    if (outputStreams[level] === 'stderr') {
        console.error(...args);
        return;
    }
    console.log(...args);
};

const info = (...args: unknown[]) => {
    write('info', EMOJIS.INFO, ...args);
};

const bold = (...args: unknown[]) => {
    write('bold', COLOR_BOLD, ...args, COLOR_RESET);
};

const success = (...args: unknown[]) => {
    write('success', `${EMOJIS.SUCCESS}${COLOR_GREEN}`, ...args, COLOR_RESET);
};

const warn = (...args: unknown[]) => {
    write('warn', `${EMOJIS.WARN}${COLOR_YELLOW}`, ...args, COLOR_RESET);
};

const note = (...args: unknown[]) => {
    write('note', COLOR_DIM, ...args, COLOR_RESET);
};

const error = (...args: unknown[]) => {
    write('error', `${EMOJIS.ERROR}${COLOR_RED}`, ...args, COLOR_RESET);
};

const errorDetail = (...args: unknown[]) => {
    write('errorDetail', `   ${COLOR_RED}↳`, ...args, COLOR_RESET);
};

const formatLink = (name: string | number, url: string) => `\x1b]8;;${url}\x1b\\${name}\x1b]8;;\x1b\\`;

export {info, warn, note, error, errorDetail, success, formatLink, bold, setOutputStream};
export type {LogLevel, LogStream};
