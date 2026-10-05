import {unstable_LowPriority as LowPriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

/** Runs `callback` after React committed the removal of the screen a finished transition closed, so it never delays it. */
function runAfterClosingScreenUnmount(callback: () => void) {
    requestAnimationFrame(() => requestAnimationFrame(() => scheduleCallback(LowPriority, callback)));
}

export default runAfterClosingScreenUnmount;
