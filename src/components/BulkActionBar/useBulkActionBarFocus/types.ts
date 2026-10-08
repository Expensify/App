import type {RefObject} from 'react';

type BulkActionBarFocus = {
    /**
     * Keeps Esc from painting a focus ring on a control the pointer put focus on. Focus that is inside the bar is left
     * alone, since the bar hands that back itself as it unmounts.
     */
    suppressStrayFocusRing: () => void;

    /** Whether one of the bar's own controls currently holds focus. */
    isFocusInsideBar: boolean;
};

/**
 * `isScreenFocused` is false while a screen is open over the one the bar is on, which is how focus taken by that
 * screen is told apart from focus still on the table behind it.
 */
type UseBulkActionBarFocus = (barRef: RefObject<unknown>, isScreenFocused: boolean) => BulkActionBarFocus;

export default UseBulkActionBarFocus;
