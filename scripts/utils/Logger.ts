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

const info = (...args: unknown[]) => {
    console.log(EMOJIS.INFO, ...args);
};

const bold = (...args: unknown[]) => {
    console.log(COLOR_BOLD, ...args, COLOR_RESET);
};

const success = (...args: unknown[]) => {
    console.log(`${EMOJIS.SUCCESS}${COLOR_GREEN}`, ...args, COLOR_RESET);
};

const warn = (...args: unknown[]) => {
    console.warn(`${EMOJIS.WARN}${COLOR_YELLOW}`, ...args, COLOR_RESET);
};

const note = (...args: unknown[]) => {
    console.log(COLOR_DIM, ...args, COLOR_RESET);
};

const error = (...args: unknown[]) => {
    console.error(`${EMOJIS.ERROR}${COLOR_RED}`, ...args, COLOR_RESET);
};

const errorDetail = (...args: unknown[]) => {
    console.error(`   ${COLOR_RED}↳`, ...args, COLOR_RESET);
};

const formatLink = (name: string | number, url: string) => `\x1b]8;;${url}\x1b\\${name}\x1b]8;;\x1b\\`;

export {info, warn, note, error, errorDetail, success, formatLink, bold};
