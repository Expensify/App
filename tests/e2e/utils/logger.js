const fs = require('fs');
const {LOG_FILE} = require('../config');

let isVerbose = true;
const setLogLevelVerbose = (value) => {
    isVerbose = value;
};

// On CI systems when using .progressInfo, the current line won't reset but a new line gets added
// Which can flood the logs. You can increase this rate to mitigate this effect.
const LOGGER_PROGRESS_REFRESH_RATE = process.env.LOGGER_PROGRESS_REFRESH_RATE || 250;
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';
const COLOR_YELLOW = '\x1b[33m';

const log = (...args) => {
    if (isVerbose) {
        console.debug(...args);
    }

    // Write to log file
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '');
    }
    const time = new Date();
    const timeStr = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()} ${time.getMilliseconds()}`;
    fs.appendFileSync(LOG_FILE, `[${timeStr}]   ${args.join(' ')}\n`);
};

const progressInfo = (textParam) => {
    let text = textParam || '';
    const getTexts = () => [`🕛 ${text}`, `🕔 ${text}`, `🕗 ${text}`, `🕙 ${text}`];
    log(textParam);

    const startTime = Date.now();
    let i = 0;
    const timer = setInterval(() => {
        process.stdout.write(`\r${getTexts()[i++]}`);
        // eslint-disable-next-line no-bitwise
        i &= 3;
    }, Number(LOGGER_PROGRESS_REFRESH_RATE));

    const getTimeText = () => {
        const timeInSeconds = Math.round((Date.now() - startTime) / 1000).toFixed(0);
        return `(${COLOR_DIM}took: ${timeInSeconds}s${COLOR_RESET})`;
    };
    return {
        updateText: (newText) => {
            text = newText;
            log(newText);
        },
        done: () => {
            clearInterval(timer);
            process.stdout.write(`\r✅ ${text} ${getTimeText()}\n`);
        },
        error: () => {
            clearInterval(timer);
            process.stdout.write(`\r❌ ${text} ${getTimeText()}\n`);
        },
    };
};

const info = (...args) => {
    console.debug('> ', ...args);
    log(...args);
};

const warn = (...args) => {
    const lines = [`\n${COLOR_YELLOW}⚠️`, ...args, `${COLOR_RESET}\n`];
    console.debug(...lines);
    log(...lines);
};

const note = (...args) => {
    const lines = [`\n💡${COLOR_DIM}`, ...args, `${COLOR_RESET}\n`];
    console.debug(...lines);
    log(...lines);
};

module.exports = {
    log,
    info,
    warn,
    note,
    progressInfo,
    setLogLevelVerbose,
};
