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
 * `isCoveredByOverlay` is true while a screen or a popover is open over the bar. Focus landing outside the bar then
 * belongs to that overlay rather than to the table, and leaves with it, so it is no use as a hand-back target.
 */
type UseBulkActionBarFocus = (barRef: RefObject<unknown>, isCoveredByOverlay: boolean) => BulkActionBarFocus;

export default UseBulkActionBarFocus;
