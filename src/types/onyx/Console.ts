import type CONST from '@src/CONST';

type Log = {
    time: Date;
    level: keyof typeof CONST.DEBUG_CONSOLE.LEVELS;
    message: string;
};

type CapturedLogs = Record<number, Log>;

export type {Log, CapturedLogs};
