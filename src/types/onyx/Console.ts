import type CONST from '@src/CONST';

/** Model of a log */
type Log = {
    /** Log time */
    time: Date;

    /** Log level */
    level: keyof typeof CONST.DEBUG_CONSOLE.LEVELS;

    /** Log message */
    message: string;

    /** Additional data */
    extraData: string | Record<string, unknown> | Array<Record<string, unknown>> | Error;
};

/** Record of captured logs */
type CapturedLogs = Record<number, Log>;

export type {Log, CapturedLogs};
