import type GetScreenWrapperMaxHeight from './types';

/**
 * On native the window height is the root view's own size, so capping to it does nothing until a rotation, where the
 * cap keeps the old height for the frames before the dimensions re-render and bares the screen below the page.
 */
const getScreenWrapperMaxHeight: GetScreenWrapperMaxHeight = () => undefined;

export default getScreenWrapperMaxHeight;
