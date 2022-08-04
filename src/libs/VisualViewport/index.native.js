
/**
 * Visual Viewport is not available on native, so return an empty function.
 *
 * @returns {Function}
 */
function addViewportResizeListener() {
    return () => {};
}

export default addViewportResizeListener;
