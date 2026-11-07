import CONST from '@src/CONST';

import {unstable_cancelCallback as cancelScheduledCallback, unstable_IdlePriority as IdlePriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

type IdleTask = {
    cancel: () => void;
};

type ScheduleWhenIdleOptions = {
    // Work that costs other flows when it runs off-idle, such as mounting a heavy subtree, opts out and waits for real idle.
    shouldUseFallbackTimer?: boolean;
};

/**
 * Schedules work through React's scheduler package at idle priority. The fallback timer
 * prevents idle work from being starved indefinitely on a busy JS thread.
 * Keep package.json's scheduler dependency aligned with React/React Native so this import shares
 * React's root scheduler queue.
 */
function scheduleWhenIdle(callback: () => void, options?: ScheduleWhenIdleOptions): IdleTask {
    const shouldUseFallbackTimer = options?.shouldUseFallbackTimer ?? true;
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
    if (shouldUseFallbackTimer) {
        fallbackTimer = setTimeout(runCallback, CONST.PRE_INSERT_FULLSCREEN_DELAY);
    }

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
