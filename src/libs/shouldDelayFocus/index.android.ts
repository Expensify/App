import type ShouldDelayFocus from './types';

/** When using transitions on Android, we need to delay focusing the text inputs for the keyboard to open. */
const shouldDelayFocus: ShouldDelayFocus = true;

export default shouldDelayFocus;
