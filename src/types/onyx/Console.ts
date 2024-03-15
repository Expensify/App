import type CONST from '@src/CONST';

type Log = {
    time: Date;
    level: keyof typeof CONST.DEBUG_CONSOLE.LEVELS;
    message: string;
};

export default Log;
