
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.parseStringifiedMessages = exports.shouldAttachLog = exports.createLog = exports.sanitizeConsoleInput = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const isEmpty_1 = require('lodash/isEmpty');
const react_native_onyx_1 = require('react-native-onyx');
const Console_1 = require('@libs/actions/Console');
const CONFIG_1 = require('@src/CONFIG');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

let shouldStoreLogs = false;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].SHOULD_STORE_LOGS,
    callback (val) {
        if (!val) {
            return;
        }
        shouldStoreLogs = val;
    },
});
/* store the original console.log function so we can call it */
// eslint-disable-next-line no-console
const originalConsoleLog = console.log;
/* List of patterns to ignore in logs. "logs" key always needs to be ignored because otherwise it will cause infinite loop */
const logPatternsToIgnore = [`merge called for key: ${  ONYXKEYS_1['default'].LOGS}`];
/**
 * Check if the log should be attached to the console
 * @param message the message to check
 * @returns true if the log should be attached to the console
 */
function shouldAttachLog(message) {
    return !logPatternsToIgnore.some(function (pattern) {
        return message.includes(pattern);
    });
}
exports.shouldAttachLog = shouldAttachLog;
/**
 * Goes through all the arguments passed the console, parses them to a string and adds them to the logs
 * @param args the arguments to log
 */
function logMessage(args) {
    const message = args
        .map(function (arg) {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2); // Indent for better readability
                } catch (e) {
                    return 'Unserializable Object';
                }
            }
            return String(arg);
        })
        .join(' ');
    const newLog = {time: new Date(), level: CONST_1['default'].DEBUG_CONSOLE.LEVELS.INFO, message, extraData: ''};
    Console_1.addLog(newLog);
}
/**
 * Override the console.log function to add logs to the store
 * Log only in production environment to avoid storing large logs in development
 * @param args arguments passed to the console.log function
 */
// eslint-disable-next-line no-console
console.log = function () {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (shouldStoreLogs && CONFIG_1['default'].ENVIRONMENT !== CONST_1['default'].ENVIRONMENT.DEV) {
        logMessage(args);
    }
    originalConsoleLog.apply(console, args);
};
const charsToSanitize = /[\u2018\u2019\u201C\u201D\u201E\u2026]/g;
const charMap = {
    '\u2018': "'",
    '\u2019': "'",
    '\u201C': '"',
    '\u201D': '"',
    '\u201E': '"',
    '\u2026': '...',
};
/**
 * Sanitize the input to the console
 * @param text the text to sanitize
 * @returns the sanitized text
 */
function sanitizeConsoleInput(text) {
    return text.replace(charsToSanitize, function (match) {
        return charMap[match];
    });
}
exports.sanitizeConsoleInput = sanitizeConsoleInput;
/**
 * Run an arbitrary JS code and create a log from the output
 * @param text the JS code to run
 * @returns an array of logs created by eval call
 */
function createLog(text) {
    const time = new Date();
    try {
        // @ts-expect-error Any code inside `sanitizedInput` that gets evaluated by `eval()` will be executed in the context of the current this value.
        // eslint-disable-next-line no-eval, no-invalid-this
        const result = eval.call(this, text);
        if (result !== undefined) {
            return [
                {time, level: CONST_1['default'].DEBUG_CONSOLE.LEVELS.INFO, message: `> ${  text}`, extraData: ''},
                {time, level: CONST_1['default'].DEBUG_CONSOLE.LEVELS.RESULT, message: String(result), extraData: ''},
            ];
        }
        return [{time, level: CONST_1['default'].DEBUG_CONSOLE.LEVELS.INFO, message: `> ${  text}`, extraData: ''}];
    } catch (error) {
        return [
            {time, level: CONST_1['default'].DEBUG_CONSOLE.LEVELS.ERROR, message: `> ${  text}`, extraData: ''},
            {time, level: CONST_1['default'].DEBUG_CONSOLE.LEVELS.ERROR, message: `Error: ${  error.message}`, extraData: ''},
        ];
    }
}
exports.createLog = createLog;
/**
 * Loops through all the logs and parses the message if it's a stringified JSON
 * @param logs Logs captured on the current device
 * @returns CapturedLogs with parsed messages
 */
function parseStringifiedMessages(logs) {
    if (isEmpty_1['default'](logs)) {
        return logs;
    }
    return logs.map(function (log) {
        try {
            const parsedMessage = JSON.parse(log.message);
            return {...log, message: parsedMessage};
        } catch (_a) {
            // If the message can't be parsed, just return the original log
            return log;
        }
    });
}
exports.parseStringifiedMessages = parseStringifiedMessages;
