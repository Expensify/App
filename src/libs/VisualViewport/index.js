/**
 * Add a visual viewport resize listener if available. Return a function to remove the listener.
 *
 * @param {Function} onViewportResize
 * @returns {Function}
 */
function addViewportResizeListener(onViewportResize) {
    if (!window.visualViewport) {
        return () => {};
    }

    window.visualViewport.addEventListener('resize', onViewportResize);
    return () => window.visualViewport.removeEventListener('resize', onViewportResize);
}

/**
 * Add a visual viewport scroll listener if available. Return a function to remove the listener.
 *
 * @param {Function} onViewportScroll
 * @returns {Function}
 */
function addViewportScrollListener(onViewportScroll) {
    if (!window.visualViewport) {
        return () => {};
    }

    window.visualViewport.addEventListener('scroll', onViewportScroll);
    return () => window.visualViewport.removeEventListener('scroll', onViewportScroll);
}

export default {
    addViewportResizeListener,
    addViewportScrollListener,
};
