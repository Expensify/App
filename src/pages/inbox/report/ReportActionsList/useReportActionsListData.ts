import {getReportActionMessage, isTransactionThread} from '@libs/ReportActionsUtils';
import {isExpenseReport, isInvoiceReport, isIOUReport} from '@libs/ReportUtils';

import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import {useEffect} from 'react';

import type {UseReportActionsListDataParams} from './types';

import getReportActionsWithStreamedReply from './getReportActionsWithStreamedReply';

/** Prepares the rendered report rows, including streamed Concierge drafts and collapsed system messages. */
function useReportActionsListData({visibleActions, sessionStartTime, linkedReportActionID, unreadMarkerReportActionID}: UseReportActionsListDataParams) {
    const {report, parentReportAction} = useReportActionsListState();
    const {visibleActionsWithDraft, isSyntheticDraftVisible, draftReportAction, isDraftPendingCompletion, persistedDraftReportAction} = useVisibleActionsWithDraft(
        visibleActions,
        sessionStartTime,
    );
    const {clearDraft, revealDraftFromReportAction} = useConciergeDraftActions();

    const shouldCollapseSystemMessages = isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report) || isTransactionThread(parentReportAction);
    const {
        displayReportActions,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
    } = useReportActionsPresentation({
        visibleReportActions: shouldCollapseSystemMessages ? visibleActionsWithDraft : [],
        linkedReportActionID,
        unreadMarkerReportActionID,
    });

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    useEffect(() => {
        if (!isDraftPendingCompletion || !draftReportAction || !persistedDraftReportAction) {
            return;
        }

        // The persisted action is the durable completion signal when a terminal Pusher event is missed.
        // Reconcile by action ID even when its HTML is byte-identical to the last streamed draft.
        revealDraftFromReportAction(persistedDraftReportAction);
    }, [draftReportAction, isDraftPendingCompletion, persistedDraftReportAction, revealDraftFromReportAction]);

    // Everything below runs after the last hook, so React Compiler keeps it until its inputs change. A new Map on
    // every render would give `renderItem` a new identity and re-render every visible row.
    const listData = shouldCollapseSystemMessages ? displayReportActions : visibleActionsWithDraft;
    const canonicalIndexByReportActionID = new Map(visibleActionsWithDraft.map((action, index) => [action.reportActionID, index]));
    const unreadMarkerListIndex = shouldCollapseSystemMessages
        ? unreadMarkerReportActionIndex
        : visibleActionsWithDraft.findIndex((action) => action.reportActionID === unreadMarkerReportActionID);

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const draftAutoScrollKey = isSyntheticDraftVisible && draftReportAction ? `${draftReportAction.reportActionID}:${draftMessageHTML ?? ''}` : '';

    return {
        visibleActionsWithDraft,
        listData,
        canonicalIndexByReportActionID,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerListIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
        draftMessageHTML,
        draftReportActionID,
        draftAutoScrollKey,
        isDraftPendingCompletion,
    };
}

/**
 * `visibleActions` with the Concierge reply that is still streaming in. A hook of its own so the result is a hook value:
 * React Compiler can't keep an array that is built in the caller and then passed into another hook.
 */
function useVisibleActionsWithDraft(visibleActions: ReportAction[], sessionStartTime: string | null) {
    const {cachedActions, isConciergeHiddenHistory, showFullHistory} = useReportActionsListState();
    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const persistedDraftReportAction = draftReportAction
        ? (cachedActions ?? visibleActions).find((action) => action.reportActionID === draftReportAction.reportActionID && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)
        : undefined;

    const shouldHideDraft = !!(showHiddenHistory && sessionStartTime && draftReportAction && draftReportAction.created < sessionStartTime);
    const {reportActionsWithStreamedReply, isSyntheticDraftVisible} = getReportActionsWithStreamedReply({
        visibleActions,
        draftReportAction,
        isDraftPendingCompletion,
        hasPersistedDraft: !!persistedDraftReportAction,
        shouldHideDraft,
    });

    return {visibleActionsWithDraft: reportActionsWithStreamedReply, isSyntheticDraftVisible, draftReportAction, isDraftPendingCompletion, persistedDraftReportAction};
}

export default useReportActionsListData;
