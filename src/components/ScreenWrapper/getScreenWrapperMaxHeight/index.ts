import type GetScreenWrapperMaxHeight from './types';

/**
 * On web the visual viewport shrinks under the keyboard while the layout viewport does not, so the content is capped to
 * the window height to keep it above the keyboard.
 */
const getScreenWrapperMaxHeight: GetScreenWrapperMaxHeight = (windowHeight) => windowHeight;

export default getScreenWrapperMaxHeight;
