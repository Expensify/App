import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useReportsParentHierarchy from '@hooks/useReportsParentHierarchy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getFirstVisibleReportActionID,
    getFeedbackPromptActionIDs,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isReversedTransaction,
    isTransactionThread,
} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    isArchivedNonExpenseReport,
    isCanceledTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isTaskReport,
    isSupportTicket,
} from '@libs/ReportUtils';

import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';
import {ReportActionPositionContextProvider} from '@pages/inbox/report/ReportActionIndexContext';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import ShowPreviousMessagesButton from '@pages/inbox/report/ShowPreviousMessagesButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import {getCustomAgentAccountIDs} from '@selectors/AgentZeroChat';
import {accountIDSelector} from '@selectors/Session';
import React from 'react';

import type {UseReportActionsListRenderItemParams} from './types';

/** Builds the report-actions row renderer and the `extraData` values that must re-render rows when they change. */
function useReportActionsListRenderItem({
    reportID,
    reportNameValuePairs,
    isReportArchived,
    isOffline,
    sortedReportActions,
    renderedVisibleReportActions,
    listData,
    canonicalIndexByReportActionID,
    runsByAnchorReportActionID,
    expandedSystemMessageReportActionIDs,
    expandSystemMessageRun,
    focusRequestedReportActionID,
    onExpandedSystemMessageReady,
    draftMessageHTML,
    draftReportActionID,
    isDraftPendingCompletion,
    unreadMarkerReportActionID,
    linkedReportActionID,
    onShowPreviousMessages,
}: UseReportActionsListRenderItemParams) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {
        report,
        hasNewerActions,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        parentReportAction,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
        persistedReportActionIDs,
    } = useReportActionsListState();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getStableReportSelector});
    const [chatReportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportStable?.chatReportID)}`, {selector: getStableReportSelector});
    const reportsParentHierarchy = useReportsParentHierarchy(reportID);
    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    const firstVisibleReportActionID = getFirstVisibleReportActionID(sortedReportActions, isOffline);

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    // An agent account can be opened through Copilot, and the agent must not rate its own replies
    const actorAccountIDs = [...new Set(renderedVisibleReportActions.map((action) => action.actorAccountID))].filter((accountID) => accountID !== currentUserAccountID);
    const [customAgentAccountIDs = getEmptyArray<number>()] = usePersonalDetailsByIDs(actorAccountIDs, getCustomAgentAccountIDs);

    // Skip inside the thread the backend opens after a thumbs down, while a Concierge answer is still streaming, and while newer actions are not loaded because the newest reply may not be in the list yet
    const latestConciergeFeedbackActionIDs =
        reportNameValuePairs?.conciergeFeedbackForReportActionID || isDraftPendingCompletion || hasNewerActions
            ? getEmptyArray<string>()
            : getFeedbackPromptActionIDs(renderedVisibleReportActions, persistedReportActionIDs, customAgentAccountIDs);

    /**
     * Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    const shouldHideThreadDividerLine = firstVisibleReportActionID === unreadMarkerReportActionID;

    const shouldUseThreadDividerLine = (() => {
        const topReport = renderedVisibleReportActions.length > 0 ? renderedVisibleReportActions.at(renderedVisibleReportActions.length - 1) : null;

        if (topReport && topReport.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return false;
        }

        if (isTransactionThread(parentReportAction)) {
            return !isDeletedParentAction(parentReportAction) && !isReversedTransaction(parentReportAction);
        }

        if (isTaskReport(report)) {
            return !isCanceledTaskReport(report, parentReportAction);
        }

        if (isSupportTicket(report)) {
            return true;
        }

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    })();

    const renderItem = ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
        const canonicalIndex = canonicalIndexByReportActionID.get(reportAction.reportActionID) ?? index;
        const systemMessageRun = runsByAnchorReportActionID.get(reportAction.reportActionID);
        const previousReportAction = listData.at(index + 1);
        const previousRun = previousReportAction ? runsByAnchorReportActionID.get(previousReportAction.reportActionID) : undefined;
        const isAfterCollapsedRun = !!previousRun && !previousRun.isExpanded;
        const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;

        return (
            <ReportActionPositionContextProvider
                index={index}
                isNewest={index === 0}
            >
                {systemMessageRun && !systemMessageRun.isExpanded ? (
                    <CollapsedSystemMessages
                        count={systemMessageRun.reportActionIDs.length}
                        earliestReportAction={systemMessageRun.earliestReportAction}
                        report={reportStable}
                        onPress={() => expandSystemMessageRun(systemMessageRun.reportActionIDs)}
                        unreadMarkerReportActionID={
                            unreadMarkerReportActionID &&
                            systemMessageRun.reportActionIDs.includes(unreadMarkerReportActionID) &&
                            (!shouldUseThreadDividerLine || !shouldHideThreadDividerLine)
                                ? unreadMarkerReportActionID
                                : undefined
                        }
                    />
                ) : (
                    <ReportActionsListItemRenderer
                        reportAction={reportAction}
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                        report={reportStable}
                        transactionThreadReport={transactionThreadReport}
                        chatReport={chatReportStable}
                        linkedReportActionID={linkedReportActionID}
                        displayAsGroup={
                            !isAfterCollapsedRun &&
                            !isConsecutiveChronosAutomaticTimerAction(renderedVisibleReportActions, canonicalIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                            isConsecutiveActionMadeByPreviousActor(renderedVisibleReportActions, canonicalIndex, isOffline)
                        }
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                        shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                        shouldDisplayReplyDivider={renderedVisibleReportActions.length > 1}
                        isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                        isLatestConciergeFeedbackAction={latestConciergeFeedbackActionIDs.includes(reportAction.reportActionID)}
                        reportsParentHierarchy={reportsParentHierarchy}
                        onExpandedSystemMessageReady={
                            reportAction.reportActionID === focusRequestedReportActionID ? (target) => onExpandedSystemMessageReady(reportAction.reportActionID, target) : undefined
                        }
                        shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                        isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                        shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                    />
                )}
                {!!reportStable?.reportID && (
                    <ShowPreviousMessagesButton
                        reportID={reportStable.reportID}
                        actionType={reportAction.actionName}
                        hasPreviousMessages={!!hasPreviousMessages}
                        showFullHistory={!showHiddenHistory}
                        onPress={onShowPreviousMessages}
                    />
                )}
            </ReportActionPositionContextProvider>
        );
    };

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = [
        shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined,
        isArchivedNonExpenseReport(report, isReportArchived),
        draftReportActionID,
        draftMessageHTML,
        isDraftPendingCompletion,
        latestConciergeFeedbackActionIDs,
        expandedSystemMessageReportActionIDs,
        focusRequestedReportActionID,
    ];

    return {renderItem, extraData};
}

export default useReportActionsListRenderItem;
