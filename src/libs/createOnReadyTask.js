/**
 * Helper method to create a task to track the "readiness" of something and defer any actions until after something is "ready".
 *
 * @example
 *
 *     const [isSomethingReady, setIsReady] = createOnReadyTask();
 *     isSomethingReady().then(() => doIt());
 *     setIsReady(); // -> doIt() will now execute
 *
 * @returns {Array<Promise, Function>}
 */
export default function createOnReadyTask() {
    let resolveIsReadyPromise;
    const isReadyPromise = (new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    }));
    return [isReadyPromise, resolveIsReadyPromise];
}
