import CONST from '@src/CONST';

import {unstable_cancelCallback as cancelScheduledCallback, unstable_IdlePriority as IdlePriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

type IdleTask = {
    cancel: () => void;
};

/**
 * Schedules work through React's scheduler package at idle priority. The fallback timer
 * prevents idle work from being starved indefinitely on a busy JS thread.
 * Keep package.json's scheduler dependency aligned with React/React Native so this import shares
 * React's root scheduler queue.
 */
function scheduleWhenIdle(callback: () => void): IdleTask {
    let hasCallbackRun = false;
    let scheduledTask: ReturnType<typeof scheduleCallback> | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const runCallback = () => {
        if (hasCallbackRun) {
            return;
        }

        hasCallbackRun = true;
        if (scheduledTask !== undefined) {
            cancelScheduledCallback(scheduledTask);
        }
        if (fallbackTimer !== undefined) {
            clearTimeout(fallbackTimer);
        }
        callback();
    };

    scheduledTask = scheduleCallback(IdlePriority, runCallback);
    fallbackTimer = setTimeout(runCallback, CONST.PRE_INSERT_FULLSCREEN_DELAY);

    return {
        cancel: () => {
            if (hasCallbackRun) {
                return;
            }

            hasCallbackRun = true;
            if (scheduledTask !== undefined) {
                cancelScheduledCallback(scheduledTask);
            }
            if (fallbackTimer !== undefined) {
                clearTimeout(fallbackTimer);
            }
        },
    };
}

const Scheduler = {
    scheduleWhenIdle,
};

export {Scheduler};
export type {IdleTask};
