import type GetWindowHeightAdjustment from './types';

// On Android the window height does not include the status bar height, so we need to add it manually.
const getWindowHeightAdjustment: GetWindowHeightAdjustment = (insets) => insets?.top ?? 0;

export default getWindowHeightAdjustment;
