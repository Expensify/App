/** Inserts temporary streamed replies without treating them as saved report actions. */
import {isNewerReportAction} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

type GetReportActionsWithStreamedReplyParams = {
    visibleActions: ReportAction[];
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

function getReportActionsWithStreamedReply({
    visibleActions,
    draftReportAction,
    isDraftPendingCompletion,
    hasPersistedDraft,
    shouldHideDraft,
}: GetReportActionsWithStreamedReplyParams): ReportActionsWithStreamedReply {
    // A completed reveal belongs to the saved action, even when pagination keeps that action off screen.
    if (!draftReportAction || shouldHideDraft || (hasPersistedDraft && !isDraftPendingCompletion)) {
        return {reportActionsWithStreamedReply: visibleActions, isSyntheticDraftVisible: false};
    }

    for (const [index, action] of visibleActions.entries()) {
        if (action.reportActionID === draftReportAction.reportActionID) {
            // Completed local replies can retain their pending add flag after the server merges followups.
            if (!isDraftPendingCompletion) {
                return {reportActionsWithStreamedReply: visibleActions, isSyntheticDraftVisible: false};
            }

            const reportActionsWithStreamedReply = [...visibleActions];
            reportActionsWithStreamedReply[index] = draftReportAction;
            return {reportActionsWithStreamedReply, isSyntheticDraftVisible: true};
        }
        if (isNewerReportAction(draftReportAction, action)) {
            const reportActionsWithStreamedReply = [...visibleActions];
            reportActionsWithStreamedReply.splice(index, 0, draftReportAction);
            return {reportActionsWithStreamedReply, isSyntheticDraftVisible: true};
        }
    }

    const reportActionsWithStreamedReply = [...visibleActions];
    reportActionsWithStreamedReply.push(draftReportAction);
    return {reportActionsWithStreamedReply, isSyntheticDraftVisible: true};
}

export default getReportActionsWithStreamedReply;
