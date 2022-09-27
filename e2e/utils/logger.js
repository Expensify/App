const fs = require('fs');
const {LOG_FILE} = require('../config');

let isVerbose = false;
const setLogLevelVerbose = (value) => {
    isVerbose = value;
};

// on CI systems when using .progressInfo, the current line won't reset but a new line gets added
// which can flood the logs. You can increase this rate to mitigate this effect.
const LOGGER_PROGRESS_REFRESH_RATE = process.env.LOGGER_PROGRESS_REFRESH_RATE || 250;

const log = (...args) => {
    if (isVerbose) {
        console.debug(...args);
    }

    // write to log file
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '');
    }
    fs.appendFileSync(LOG_FILE, `${args.join(' ')}\n`);
};

const progressInfo = (textParam) => {
    let text = textParam || '';
    const getTexts = () => [`🕛 ${text}`, `🕔 ${text}`, `🕗 ${text}`, `🕙 ${text}`];
    log(textParam);

    let i = 0;
    const timer = setInterval(() => {
        process.stdout.write(`\r${getTexts()[i++]}`);
        // eslint-disable-next-line no-bitwise
        i &= 3;
    }, Number(LOGGER_PROGRESS_REFRESH_RATE));

    return {
        updateText: (newText) => {
            text = newText;
            log(newText);
        },
        done: () => {
            clearInterval(timer);
            process.stdout.write(`\r✅ ${text}\n`);
        },
        error: () => {
            clearInterval(timer);
            process.stdout.write(`\r❌ ${text}\n`);
        },
    };
};

const info = (...args) => {
    console.debug('> ', ...args);
};

module.exports = {
    log,
    info,
    progressInfo,
    setLogLevelVerbose,
};
