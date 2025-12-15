/* eslint-disable @typescript-eslint/naming-convention */
import isEmpty from 'lodash/isEmpty';
import Onyx from 'react-native-onyx';
import {addLog} from '@libs/actions/Console';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';
import SafeString from '@src/utils/SafeString';

let shouldStoreLogs = false;

// We have opted for `connectWithoutView` here as the data is strictly for non-UI use.
Onyx.connectWithoutView({
    key: ONYXKEYS.SHOULD_STORE_LOGS,
    callback: (val) => {
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
const logPatternsToIgnore = [`merge called for key: ${ONYXKEYS.LOGS}`];

/**
 * Check if the log should be attached to the console
 * @param message the message to check
 * @returns true if the log should be attached to the console
 */
function shouldAttachLog(message: string) {
    return !logPatternsToIgnore.some((pattern) => message.includes(pattern));
}

/**
 * Goes through all the arguments passed the console, parses them to a string and adds them to the logs
 * @param args the arguments to log
 */
function logMessage(args: unknown[]) {
    const message = args
        .map((arg) => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2); // Indent for better readability
                } catch (e) {
                    return 'Unserializable Object';
                }
            }

            return SafeString(arg);
        })
        .join(' ');
    const newLog = {time: new Date(), level: CONST.DEBUG_CONSOLE.LEVELS.INFO, message, extraData: ''};
    addLog(newLog);
}

/**
 * Override the console.log function to add logs to the store
 * Log only in production environment to avoid storing large logs in development
 * @param args arguments passed to the console.log function
 */
// eslint-disable-next-line no-console
console.log = (...args) => {
    if (shouldStoreLogs && CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV) {
        logMessage(args);
    }

    originalConsoleLog.apply(console, args);
};

const charsToSanitize = /[\u2018\u2019\u201C\u201D\u201E\u2026]/g;

const charMap: Record<string, string> = {
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
function sanitizeConsoleInput(text: string): string {
    return text.replaceAll(charsToSanitize, (match) => charMap[match]);
}

/**
 * Run an arbitrary JS code and create a log from the output
 * @param text the JS code to run
 * @returns an array of logs created by eval call
 */
function createLog(text: string) {
    const time = new Date();
    try {
        // @ts-expect-error Any code inside `sanitizedInput` that gets evaluated by `eval()` will be executed in the context of the current this value.
        // eslint-disable-next-line no-eval, no-invalid-this
        const result = eval.call(this, text) as unknown;

        if (result !== undefined) {
            return [
                {time, level: CONST.DEBUG_CONSOLE.LEVELS.INFO, message: `> ${text}`, extraData: ''},
                {time, level: CONST.DEBUG_CONSOLE.LEVELS.RESULT, message: SafeString(result), extraData: ''},
            ];
        }
        return [{time, level: CONST.DEBUG_CONSOLE.LEVELS.INFO, message: `> ${text}`, extraData: ''}];
    } catch (error) {
        return [
            {time, level: CONST.DEBUG_CONSOLE.LEVELS.ERROR, message: `> ${text}`, extraData: ''},
            {time, level: CONST.DEBUG_CONSOLE.LEVELS.ERROR, message: `Error: ${(error as Error).message}`, extraData: ''},
        ];
    }
}

/**
 * Loops through all the logs and parses the message if it's a stringified JSON
 * @param logs Logs captured on the current device
 * @returns CapturedLogs with parsed messages
 */
function parseStringifiedMessages(logs: Log[]): Log[] {
    if (isEmpty(logs)) {
        return logs;
    }

    return logs.map((log) => {
        try {
            const parsedMessage = JSON.parse(log.message) as Log['message'];
            return {
                ...log,
                message: parsedMessage,
            };
        } catch {
            // If the message can't be parsed, just return the original log
            return log;
        }
    });
}

export {sanitizeConsoleInput, createLog, shouldAttachLog, parseStringifiedMessages};
export type {Log};
