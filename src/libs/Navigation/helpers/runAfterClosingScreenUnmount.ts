import {unstable_LowPriority as LowPriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

/** Runs `callback` after two frames at low priority, so React usually commits the removal of the closed screen first. */
function runAfterClosingScreenUnmount(callback: () => void) {
    requestAnimationFrame(() => requestAnimationFrame(() => scheduleCallback(LowPriority, callback)));
}

export default runAfterClosingScreenUnmount;
