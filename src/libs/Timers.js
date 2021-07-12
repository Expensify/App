import _ from 'underscore';

const timers = [];

/**
 * Register a timer so it can be cleaned up later.
 *
 * @param {Number} timerID
 * @returns {Number}
 */
function register(timerID) {
    timers.push(timerID);
    return timerID;
}

/**
 * Clears all timers that we have registered. Use for long running tasks that may begin once logged out.
 */
function clearAll() {
    _.each(timers, (timer) => {
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
