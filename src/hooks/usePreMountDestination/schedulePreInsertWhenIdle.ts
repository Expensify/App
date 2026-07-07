import CONST from '@src/CONST';

import {unstable_cancelCallback as cancelScheduledCallback, unstable_IdlePriority as IdlePriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

type IdlePreInsertTask = {
    cancel: () => void;
};

/**
 * Schedules work through React's scheduler package at idle priority so pre-insert navigation
 * is less likely to compete with the confirmation screen's initial render. The timeout prevents
 * idle work from being starved indefinitely on a busy JS thread.
 * Keep package.json's scheduler dependency aligned with React/React Native so this import shares
 * React's root scheduler queue.
 */
function schedulePreInsertWhenIdle(callback: () => void): IdlePreInsertTask {
    const scheduledTask = scheduleCallback(IdlePriority, callback, {timeout: CONST.PRE_INSERT_FULLSCREEN_DELAY});

    return {
        cancel: () => {
            cancelScheduledCallback(scheduledTask);
        },
    };
}

export default schedulePreInsertWhenIdle;
export type {IdlePreInsertTask};
