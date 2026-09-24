import type * as OnyxTypes from '@src/types/onyx';

import {useEffect, useRef} from 'react';

import {usePendingScrollToEditingReportActionID, useReportActionActiveEditActions} from './ReportActionEditMessageContext';

type UseScrollToEditingReportActionParams = {
    /** The report actions the list renders, in render order — the index handed to `scrollToIndex` is an index into this array */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Scrolls the list so the action at `index` within `visibleReportActions` is rendered and on screen */
    scrollToIndex: (index: number) => void;
};

/**
 * Consumes the pending "scroll to the action that just entered edit mode" request from the composer (ArrowUp).
 *
 * A message put into edit mode this way can sit outside a virtualized list's render window, so its editor never mounts
 * and never takes focus. Only the list knows how a report action maps onto a row, so each list passes in the actions it
 * renders plus how to scroll to one of them, and the request is resolved and cleared here.
 */
function useScrollToEditingReportAction({visibleReportActions, scrollToIndex}: UseScrollToEditingReportActionParams) {
    const pendingScrollToEditingReportActionID = usePendingScrollToEditingReportActionID();
    const {clearPendingScrollToEditingAction} = useReportActionActiveEditActions();

    // Derived at render so the effect keys on a stable number rather than the churning actions array.
    const editingReportActionIndex = pendingScrollToEditingReportActionID
        ? visibleReportActions.findIndex((action) => action.reportActionID === pendingScrollToEditingReportActionID)
        : -1;

    // Kept in a ref so a fresh callback identity can't re-fire the effect and scroll a second time for one request.
    const scrollToIndexRef = useRef(scrollToIndex);
    useEffect(() => {
        scrollToIndexRef.current = scrollToIndex;
    });

    useEffect(() => {
        if (!pendingScrollToEditingReportActionID) {
            return;
        }

        clearPendingScrollToEditingAction();

        if (editingReportActionIndex < 0) {
            return;
        }

        scrollToIndexRef.current(editingReportActionIndex);
    }, [clearPendingScrollToEditingAction, pendingScrollToEditingReportActionID, editingReportActionIndex]);
}

export default useScrollToEditingReportAction;
