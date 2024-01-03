import type GetWindowHeightAdjustment from './types';

// Some platforms need to adjust the window height.
const getWindowHeightAdjustment: GetWindowHeightAdjustment = () => 0;

export default getWindowHeightAdjustment;
