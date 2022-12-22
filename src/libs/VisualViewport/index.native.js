/**
 * Visual Viewport is not available on native, so return an empty function.
 *
 * @returns {Function}
 */
function addViewportResizeListener() {
    return () => {};
}

/**
 * Visual Viewport is not available on native, so return an empty function.
 *
 * @returns {Function}
 */
function addViewportScrollListener() {
    return () => {};
}

export default {
    addViewportResizeListener,
    addViewportScrollListener,
};
