import type AddViewportResizeListener from './types';

/**
 * Visual Viewport is not available on native, so return an empty function.
 */
const addViewportResizeListener: AddViewportResizeListener = () => () => {};

export default addViewportResizeListener;
