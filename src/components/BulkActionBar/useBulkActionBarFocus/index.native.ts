import type UseBulkActionBarFocus from './types';

const noop = () => {};

/** Native has no tab order and no focus ring, so the bar's controls are reached through the screen reader instead. */
const useBulkActionBarFocus: UseBulkActionBarFocus = () => ({handleFocusBeforeClose: noop, isFocusInsideBar: false});

export default useBulkActionBarFocus;
