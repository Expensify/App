/** Inserts temporary streamed replies without treating them as saved report actions. */
import {isNewerReportAction} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

type GetReportActionsWithDraftParams = {
    sortedVisibleReportActions: ReportAction[];
    draftReportAction: ReportAction | null;
    isDraftPendingCompletion: boolean;
    /** Includes saved replies outside the currently visible page. */
    hasPersistedDraft: boolean;
    shouldHideDraft: boolean;
};

type ReportActionsWithDraft = {
    visibleReportActions: ReportAction[];
    isSyntheticDraftVisible: boolean;
};

function getReportActionsWithDraft({
    sortedVisibleReportActions,
    draftReportAction,
    isDraftPendingCompletion,
    hasPersistedDraft,
    shouldHideDraft,
}: GetReportActionsWithDraftParams): ReportActionsWithDraft {
    if (!draftReportAction || shouldHideDraft || (hasPersistedDraft && !isDraftPendingCompletion)) {
        return {visibleReportActions: sortedVisibleReportActions, isSyntheticDraftVisible: false};
    }

    for (const [index, action] of sortedVisibleReportActions.entries()) {
        if (action.reportActionID === draftReportAction.reportActionID) {
            // Completed local replies can retain their pending add flag after the server merges followups.
            if (!isDraftPendingCompletion) {
                return {visibleReportActions: sortedVisibleReportActions, isSyntheticDraftVisible: false};
            }

            const visibleReportActions = [...sortedVisibleReportActions];
            visibleReportActions[index] = draftReportAction;
            return {visibleReportActions, isSyntheticDraftVisible: true};
        }
        if (isNewerReportAction(draftReportAction, action)) {
            const visibleReportActions = [...sortedVisibleReportActions];
            visibleReportActions.splice(index, 0, draftReportAction);
            return {visibleReportActions, isSyntheticDraftVisible: true};
        }
    }

    const visibleReportActions = [...sortedVisibleReportActions];
    visibleReportActions.push(draftReportAction);
    return {visibleReportActions, isSyntheticDraftVisible: true};
}

export default getReportActionsWithDraft;
