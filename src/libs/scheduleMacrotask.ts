import Log from './Log';

type Task = () => void;

type ScheduleMacrotask = (callback: Task) => void;

/**
 * Run a scheduled task, isolating a throw so it neither aborts sibling tasks queued in the same tick
 * nor escapes uncaught.
 */
function runTask(task: Task) {
    try {
        task();
    } catch (error) {
        Log.alert('[scheduleMacrotask] scheduled task threw', {error});
    }
}

/**
 * Runs `callback` on the next macrotask — after the current task's microtasks drain (so it still
 * coalesces an Onyx update's microtask-spread broadcasts), but without setTimeout's background-tab
 * throttling (hidden tabs clamp timers to >= 1s, and to ~1/min after 5 minutes hidden).
 *
 * Uses MessageChannel — the same technique React's scheduler uses — when available. Falls back to
 * setTimeout on React Native (no MessageChannel) and in tests, where timer-based flushing is what the
 * test harness (waitForBatchedUpdates) drives.
 */
const scheduleMacrotask: ScheduleMacrotask = (() => {
    const useTimeoutFallback = typeof MessageChannel === 'undefined' || process.env.NODE_ENV === 'test';
    if (useTimeoutFallback) {
        return (callback) => {
            setTimeout(() => runTask(callback), 0);
        };
    }

    const queue: Task[] = [];
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
        // Drain everything queued for this tick; a task that schedules another lands in the next tick.
        const tasks = queue.splice(0);
        for (const task of tasks) {
            runTask(task);
        }
    };

    return (callback) => {
        queue.push(callback);
        if (queue.length === 1) {
            channel.port2.postMessage(null);
        }
    };
})();

export default scheduleMacrotask;
export type {ScheduleMacrotask};
