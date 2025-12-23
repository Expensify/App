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

const log = (...args: unknown[]) => {
    console.debug(...args);
};

const info = (...args: unknown[]) => {
    const lines = [EMOJIS.INFO, ...args];
    log(...lines);
};

const bold = (...args: unknown[]) => {
    const lines = [COLOR_BOLD, ...args, COLOR_RESET];
    log(...lines);
};

const success = (...args: unknown[]) => {
    const lines = [`${EMOJIS.SUCCESS}${COLOR_GREEN}`, ...args, COLOR_RESET];
    log(...lines);
};

const warn = (...args: unknown[]) => {
    const lines = [`${EMOJIS.WARN}${COLOR_YELLOW}`, ...args, COLOR_RESET];
    log(...lines);
};

const note = (...args: unknown[]) => {
    const lines = [COLOR_DIM, ...args, COLOR_RESET];
    log(...lines);
};

const error = (...args: unknown[]) => {
    const lines = [`${EMOJIS.ERROR}${COLOR_RED}`, ...args, COLOR_RESET];
    log(...lines);
};

const formatLink = (name: string | number, url: string) => `\x1b]8;;${url}\x1b\\${name}\x1b]8;;\x1b\\`;

export {log, info, warn, note, error, success, formatLink, bold};
