import CONST from '@src/CONST';

import {unstable_LowPriority as LowPriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

/** Runs `callback` after two frames at low priority, so React usually commits the removal of the closed screen first. */
function runAfterClosingScreenUnmount(callback: () => void) {
    let hasRun = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
        if (hasRun) {
            return;
        }
        hasRun = true;
        clearTimeout(fallbackTimer);
        callback();
    };

    // A background browser tab stops animation frames, so the work (e.g. an expense write) must not wait for them alone.
    fallbackTimer = setTimeout(run, CONST.MAX_TRANSITION_DURATION_MS);
    requestAnimationFrame(() => requestAnimationFrame(() => scheduleCallback(LowPriority, run)));
}

export default runAfterClosingScreenUnmount;
