/* eslint-disable @typescript-eslint/naming-convention */
type Log = {
    time: Date;
    level: string;
    message: string;
};

type UpdateLogsFunction = (newLog: Log) => void;

let updateLogs: UpdateLogsFunction | null = null;
const capturedLogs: Log[] = [];
// eslint-disable-next-line no-console
const originalConsoleLog = console.log;

function setUpdateLogsFunction(func: UpdateLogsFunction | null) {
    updateLogs = func;
}

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

            return String(arg);
        })
        .join(' ');
    const newLog = {time: new Date(), level: 'LOG', message};
    capturedLogs.push(newLog);
    if (updateLogs) {
        updateLogs(newLog);
    }
}

// eslint-disable-next-line no-console
console.log = (...args) => {
    logMessage(args);
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

function sanitizeConsoleInput(text: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return text.replace(charsToSanitize, (match) => charMap[match]);
}

function createLog(text: string) {
    const time = new Date();
    try {
        // @ts-expect-error Any code inside `sanitizedInput` that gets evaluated by `eval()` will be executed in the context of the current this value.
        // eslint-disable-next-line no-eval, no-invalid-this
        const result = eval.call(this, text);

        if (result !== undefined) {
            return [
                {time, level: 'INFO', message: `> ${text}`},
                {time, level: 'RESULT', message: String(result)},
            ];
        }
        return [{time, level: 'INFO', message: `> ${text}`}];
    } catch (error) {
        return [
            {time, level: 'ERROR', message: `> ${text}`},
            {time, level: 'ERROR', message: `Error: ${(error as Error).message}`},
        ];
    }
}

export {sanitizeConsoleInput, createLog, capturedLogs, setUpdateLogsFunction};
export type {Log};
