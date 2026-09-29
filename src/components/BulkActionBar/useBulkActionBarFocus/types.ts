import type {RefObject} from 'react';

type BulkActionBarFocus = {
    /**
     * Settles where focus should be before the selection goes away and takes the bar with it. Call it from every path
     * that clears the selection.
     */
    handleFocusBeforeClose: () => void;
};

type UseBulkActionBarFocus = (barRef: RefObject<unknown>) => BulkActionBarFocus;

export default UseBulkActionBarFocus;
export type {BulkActionBarFocus};
