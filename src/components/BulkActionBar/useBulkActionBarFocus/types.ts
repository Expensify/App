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

type UseBulkActionBarFocus = (barRef: RefObject<unknown>) => BulkActionBarFocus;

export default UseBulkActionBarFocus;
