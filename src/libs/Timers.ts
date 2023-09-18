const timers: NodeJS.Timer[] = [];

/**
 * Register a timer so it can be cleaned up later.
 */
function register(timerID: NodeJS.Timer): NodeJS.Timer {
    timers.push(timerID);
    return timerID;
}

/**
 * Clears all timers that we have registered. Use for long running tasks that may begin once logged out.
 */
function clearAll(): void {
    timers.forEach((timer) => {
        // We don't know whether it's a setTimeout or a setInterval, but it doesn't really matter. If the id doesn't
        // exist nothing bad happens.
        clearTimeout(timer);
        clearInterval(timer);
    });
}

export default {
    register,
    clearAll,
};
