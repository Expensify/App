/* eslint-disable import/no-import-module-exports */
import fs from 'fs';
import path from 'path';
import CONFIG from '../config';

const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_RED = '\x1b[31m';
const COLOR_GREEN = '\x1b[32m';

const getDateString = () => `[${Date()}] `;

const writeToLogFile = (...args: string[]) => {
    if (!fs.existsSync(CONFIG.LOG_FILE)) {
        // Check that the directory exists
        const logDir = path.dirname(CONFIG.LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        fs.writeFileSync(CONFIG.LOG_FILE, '');
    }
    fs.appendFileSync(
        CONFIG.LOG_FILE,
        `${args
            .map((arg) => {
                if (typeof arg === 'string') {
                    // Remove color codes from arg, because they are not supported in log files
                    // eslint-disable-next-line no-control-regex
                    return arg.replaceAll(/\x1b\[\d+m/g, '');
                }
                return arg;
            })
            .join(' ')
            .trim()}\n`,
    );
};

const log = (...args: string[]) => {
    const argsWithTime = [getDateString(), ...args];
    console.debug(...argsWithTime);
    writeToLogFile(...argsWithTime);
};

const info = (...args: string[]) => {
    log('▶️', ...args);
};

const success = (...args: string[]) => {
    const lines = ['✅', COLOR_GREEN, ...args, COLOR_RESET];
    log(...lines);
};

const warn = (...args: string[]) => {
    const lines = ['⚠️', COLOR_YELLOW, ...args, COLOR_RESET];
    log(...lines);
};

const note = (...args: string[]) => {
    const lines = [COLOR_DIM, ...args, COLOR_RESET];
    log(...lines);
};

const error = (...args: string[]) => {
    const lines = ['🔴', COLOR_RED, ...args, COLOR_RESET];
    log(...lines);
};

export {log, info, warn, note, error, success, writeToLogFile};
