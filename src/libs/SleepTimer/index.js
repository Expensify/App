/**
 * The Timer module is used on web/desktop to detect when a computer has gone to sleep. We don't use this on native
 * mobile since it does not work reliably and fires at inappropriate times.
 */
let sleepTimer;
let lastTime;

/**
 * Adds a listener for detecting when laptop screens have closed or desktop computers put to sleep. Not reliable on
 * native platforms.
 *
 * @param {Function} onClockSkewCallback function to call when the
 * @returns {Fuction} that when called clears the timer
 */
function addClockSkewListener(onClockSkewCallback) {
    clearInterval(sleepTimer);
    sleepTimer = setInterval(() => {
        const currentTime = (new Date()).getTime();
        const isSkewed = currentTime > (lastTime + 8000);
        lastTime = currentTime;

        if (!isSkewed) {
            return;
        }

        onClockSkewCallback();
    }, 2000);

    return () => {
        clearInterval(sleepTimer);
        sleepTimer = null;
    };
}

export default {
    addClockSkewListener,
};
