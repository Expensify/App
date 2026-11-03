import {isNewerReportAction} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

type GetReportActionsWithStreamedReplyParams = {
    sortedVisibleReportActions: ReportAction[];
    draftReportAction: ReportAction | null;
    isDraftPendingCompletion: boolean;
    /** Includes saved replies outside the currently visible page. */
    hasPersistedDraft: boolean;
    shouldHideDraft: boolean;
};

type ReportActionsWithStreamedReply = {
    reportActionsWithStreamedReply: ReportAction[];
    isSyntheticDraftVisible: boolean;
};

/** Inserts temporary streamed replies without treating them as saved report actions. */
function getReportActionsWithStreamedReply({
    sortedVisibleReportActions,
    draftReportAction,
    isDraftPendingCompletion,
    hasPersistedDraft,
    shouldHideDraft,
}: GetReportActionsWithStreamedReplyParams): ReportActionsWithStreamedReply {
    if (!draftReportAction || shouldHideDraft || (hasPersistedDraft && !isDraftPendingCompletion)) {
        return {reportActionsWithStreamedReply: sortedVisibleReportActions, isSyntheticDraftVisible: false};
    }

    for (const [index, action] of sortedVisibleReportActions.entries()) {
        if (action.reportActionID === draftReportAction.reportActionID) {
            // Completed local replies can retain their pending add flag after the server merges followups.
            if (!isDraftPendingCompletion) {
                return {reportActionsWithStreamedReply: sortedVisibleReportActions, isSyntheticDraftVisible: false};
            }

            const reportActionsWithStreamedReply = [...sortedVisibleReportActions];
            reportActionsWithStreamedReply[index] = draftReportAction;
            return {reportActionsWithStreamedReply, isSyntheticDraftVisible: true};
        }
        if (isNewerReportAction(draftReportAction, action)) {
            const reportActionsWithStreamedReply = [...sortedVisibleReportActions];
            reportActionsWithStreamedReply.splice(index, 0, draftReportAction);
            return {reportActionsWithStreamedReply, isSyntheticDraftVisible: true};
        }
    }

    const reportActionsWithStreamedReply = [...sortedVisibleReportActions];
    reportActionsWithStreamedReply.push(draftReportAction);
    return {reportActionsWithStreamedReply, isSyntheticDraftVisible: true};
}

export default getReportActionsWithStreamedReply;
