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
 * `isCoveredByScreen` is true while another screen is open over the bar. Focus landing outside the bar then belongs to
 * that screen rather than to the table, and leaves with it, so it is no use as a hand-back target. Popovers are left
 * out of this flag, because an RHP the bar is rendered inside reports itself as a visible modal for as long as it is
 * open. The bar tells those apart by the launcher they were opened from instead.
 */
type UseBulkActionBarFocus = (barRef: RefObject<unknown>, isCoveredByScreen: boolean) => BulkActionBarFocus;

export default UseBulkActionBarFocus;
