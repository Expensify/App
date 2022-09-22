/**
 * Detects whether the app is visible or not.
 *
 * @returns {Boolean}
 */
function isVisible() {
    return document.visibilityState === 'visible';
}

export default {
    isVisible,
};
