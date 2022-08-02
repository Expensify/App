
/**
 * Visual Viewport is not available on native, so return an empty function.
 *
 * @param {Function} onViewportResize
 * @returns {Function}
 */
// eslint-disable-next-line no-unused-vars
function addResizeListener(onViewportResize) {
    return () => {};
}

export default addResizeListener;
