"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timers = [];
/**
 * Register a timer so it can be cleaned up later.
 */
function register(timerID) {
    timers.push(timerID);
    return timerID;
}
/**
 * Clears all timers that we have registered. Use for long running tasks that may begin once logged out.
 */
function clearAll() {
    timers.forEach(function (timer) {
        // We don't know whether it's a setTimeout or a setInterval, but it doesn't really matter. If the id doesn't
        // exist nothing bad happens.
        clearTimeout(timer);
        clearInterval(timer);
    });
}
exports.default = {
    register: register,
    clearAll: clearAll,
};
