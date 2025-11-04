/* eslint-disable no-console */
const DISABLE_LOGGER = false;

const wrapReasonWithSourceData = (reason: string, args: Record<string, unknown>) => {
    return `${reason}, source data:\n${JSON.stringify(args, null, 2)}\n`;
};

const Logger = {
    e: (...args: unknown[]) => {
        if (!DISABLE_LOGGER) {
            console.error(...args);
        }
        return args.join(' ');
    },
    w: (...args: unknown[]) => {
        if (!DISABLE_LOGGER) {
            console.warn(...args);
        }
        return args.join(' ');
    },
    m: (...args: unknown[]) => {
        if (!DISABLE_LOGGER) {
            console.log(...args);
        }
        return args.join(' ');
    },
    mw: (reason: string, args: Record<string, unknown>) => {
        if (!DISABLE_LOGGER) {
            console.log(wrapReasonWithSourceData(reason, args));
        }
        return reason;
    },
    ww: (reason: string, args: Record<string, unknown>) => {
        if (!DISABLE_LOGGER) {
            console.warn(wrapReasonWithSourceData(reason, args));
        }
        return reason;
    },
};

export default Logger;
