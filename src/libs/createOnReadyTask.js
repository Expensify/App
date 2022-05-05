/**
 * Helper method to create a task to track the "readiness" of something and defer any actions until after something is "ready".
 *
 * @example
 *
 *     const task = createOnReadyTask();
 *     task.isReady().then(() => doIt());
 *     task.setIsReady(); // -> doIt() will now execute
 *     task.reset() // -> will let us reset the task (useful for testing)
 * @returns {Object}
 */
export default function createOnReadyTask() {
    let resolveIsReadyPromise;
    let isReadyPromise;
    function reset() {
        isReadyPromise = (new Promise((resolve) => {
            resolveIsReadyPromise = resolve;
        }));
    }
    reset();
    return {
        isReady: () => isReadyPromise,
        setIsReady: () => resolveIsReadyPromise(),
        reset,
    };
}
