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

export default addViewportResizeListener;
