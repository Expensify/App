/** Drafts and collapsed groups change rows without changing the page used to fetch more actions. */
import {getReportActionMessage, getSystemMessageDisplayState} from '@libs/ReportActionsUtils';

import getReportActionsWithStreamedReply from '@pages/inbox/report/ReportActionsList/getReportActionsWithStreamedReply';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type GetReportActionsRowsParams = {
    visibleActions: ReportAction[];
    cachedActions: ReportAction[] | undefined;
    draftAction: ReportAction | null;
    isDraftPendingCompletion: boolean;
    shouldHideDraft: boolean;
    shouldCollapseSystemMessages: boolean;
    expandedActionIDs: ReadonlySet<string>;
    linkedActionID: string | undefined;
    unreadActionID: string | null;
};

function getReportActionsRows({
    visibleActions,
    cachedActions,
    draftAction,
    isDraftPendingCompletion,
    shouldHideDraft,
    shouldCollapseSystemMessages,
    expandedActionIDs,
    linkedActionID,
    unreadActionID,
}: GetReportActionsRowsParams) {
    const persistedDraftAction = draftAction
        ? (cachedActions ?? visibleActions).find((action) => action.reportActionID === draftAction.reportActionID && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)
        : undefined;
    const {reportActionsWithStreamedReply: renderedVisibleReportActions, isSyntheticDraftVisible} = getReportActionsWithStreamedReply({
        sortedVisibleReportActions: visibleActions,
        draftReportAction: draftAction,
        isDraftPendingCompletion,
        hasPersistedDraft: !!persistedDraftAction,
        shouldHideDraft,
    });
    const presentation = getSystemMessageDisplayState(shouldCollapseSystemMessages ? renderedVisibleReportActions : [], expandedActionIDs, linkedActionID ? [linkedActionID] : []);
    const listData = shouldCollapseSystemMessages ? presentation.displayReportActions : renderedVisibleReportActions;
    const unreadMarkerListIndex = unreadActionID ? listData.findIndex((action) => action.reportActionID === unreadActionID) : -1;
    const draftMessageHTML = draftAction ? getReportActionMessage(draftAction)?.html : undefined;

    return {
        renderedVisibleReportActions,
        listData,
        canonicalIndexByReportActionID: new Map(renderedVisibleReportActions.map((action, index) => [action.reportActionID, index])),
        reportActionIDToDisplayIndex: shouldCollapseSystemMessages ? presentation.reportActionIDToDisplayIndex : new Map(listData.map((action, index) => [action.reportActionID, index])),
        runsByAnchorReportActionID: presentation.runsByAnchorReportActionID,
        unreadMarkerListIndex: shouldCollapseSystemMessages && unreadActionID ? (presentation.reportActionIDToDisplayIndex.get(unreadActionID) ?? -1) : unreadMarkerListIndex,
        revealedActionIDs: [...presentation.runsByAnchorReportActionID.values()].filter((run) => run.isExpanded).flatMap((run) => run.reportActionIDs),
        persistedDraftAction,
        isSyntheticDraftVisible,
        draftMessageHTML,
        draftReportActionID: draftAction?.reportActionID,
        draftAutoScrollKey: isSyntheticDraftVisible && draftAction ? `${draftAction.reportActionID}:${draftMessageHTML ?? ''}` : '',
        isDraftPendingCompletion,
    };
}

export default getReportActionsRows;
