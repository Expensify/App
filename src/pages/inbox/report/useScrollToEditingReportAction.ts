import type * as OnyxTypes from '@src/types/onyx';

import {useEffect, useRef} from 'react';

import {useEditingReportActionID} from './ReportActionEditMessageContext';

type UseScrollToEditingReportActionParams = {
    /** The report actions the list renders, in render order — the index handed to `scrollToIndex` is an index into this array */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Scrolls the list so the action at `index` within `visibleReportActions` is rendered and on screen */
    scrollToIndex: (index: number) => void;
};

/**
 * Scrolls the action that just entered edit mode into view.
 *
 * The action being edited can sit outside a virtualized list's render window — started from the composer with ArrowUp,
 * that is the common case — so its editor never mounts and never takes focus. Only the list knows how a report action
 * maps onto a row, so each list passes in the actions it renders plus how to scroll to one of them.
 */
function useScrollToEditingReportAction({visibleReportActions, scrollToIndex}: UseScrollToEditingReportActionParams) {
    const editingReportActionID = useEditingReportActionID();

    // Derived at render so the effect keys on a stable number rather than the churning actions array.
    const editingReportActionIndex = editingReportActionID ? visibleReportActions.findIndex((action) => action.reportActionID === editingReportActionID) : -1;

    // Kept in a ref so a fresh callback identity can't re-fire the effect and scroll a second time.
    const scrollToIndexRef = useRef(scrollToIndex);
    useEffect(() => {
        scrollToIndexRef.current = scrollToIndex;
    });

    // Scroll once per edited action. The row keeps re-rendering and can shift (pagination, a new message, the editor
    // growing as the user types) for as long as the editor is open, and re-scrolling on that would drag the list out
    // from under the user mid-edit.
    const scrolledToEditingReportActionIDRef = useRef<string | null>(null);

    useEffect(() => {
        if (!editingReportActionID) {
            scrolledToEditingReportActionIDRef.current = null;
            return;
        }

        // Not rendered yet (still paginating in). Leave the ref alone so the scroll happens once it shows up.
        if (editingReportActionIndex < 0 || scrolledToEditingReportActionIDRef.current === editingReportActionID) {
            return;
        }

        scrolledToEditingReportActionIDRef.current = editingReportActionID;
        scrollToIndexRef.current(editingReportActionIndex);
    }, [editingReportActionID, editingReportActionIndex]);
}

export default useScrollToEditingReportAction;
