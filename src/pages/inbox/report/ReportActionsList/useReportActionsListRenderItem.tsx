import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useReportsParentHierarchy from '@hooks/useReportsParentHierarchy';

import {shouldKeepBillPayActorHeader} from '@libs/BillPayReportActionUtils';
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

import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import {isLinkedToBillSelector} from '@src/selectors/ReportNameValuePairs';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {LegendListRenderItemProps} from '@legendapp/list/react-native';

import {getCustomAgentAccountIDs} from '@selectors/AgentZeroChat';
import {accountIDSelector} from '@selectors/Session';
import React from 'react';

import type {UseReportActionsListRenderItemParams} from './types';

import ReportActionsListRow from './ReportActionsListRow';
import SkeletonBelowLinkedAction from './SkeletonBelowLinkedAction';

/** Builds the report-actions row renderer and the `extraData` values that must re-render rows when they change. */
function useReportActionsListRenderItem({
    reportID,
    reportNameValuePairs,
    isReportArchived,
    isOffline,
    sortedReportActions,
    renderedVisibleReportActions,
    reportActionsToRender,
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
    shouldShowSkeletonBelowLinkedAction,
    hasRowsBelowLinkedAction,
    hideSkeletonBelowLinkedAction,
}: UseReportActionsListRenderItemParams) {
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
    const isInvoiceLinkedToBill = isLinkedToBillSelector(reportNameValuePairs);

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

    const renderItem = ({item: reportAction, index}: LegendListRenderItemProps<OnyxTypes.ReportAction>) => {
        const canonicalIndex = canonicalIndexByReportActionID.get(reportAction.reportActionID) ?? index;
        const systemMessageRun = runsByAnchorReportActionID.get(reportAction.reportActionID);
        const previousReportAction = index > 0 ? listData.at(index - 1) : undefined;
        const previousRun = previousReportAction ? runsByAnchorReportActionID.get(previousReportAction.reportActionID) : undefined;
        const isAfterCollapsedRun = !!previousRun && !previousRun.isExpanded;
        const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;

        const collapsedSystemMessageRun = systemMessageRun && !systemMessageRun.isExpanded ? systemMessageRun : undefined;
        const collapsedRunUnreadMarkerReportActionID =
            unreadMarkerReportActionID && collapsedSystemMessageRun?.reportActionIDs.includes(unreadMarkerReportActionID) && (!shouldUseThreadDividerLine || !shouldHideThreadDividerLine)
                ? unreadMarkerReportActionID
                : undefined;
        const shouldGroupWithPreviousActor =
            !isAfterCollapsedRun &&
            !shouldKeepBillPayActorHeader(reportAction, previousReportAction, reportStable, isInvoiceLinkedToBill) &&
            !isConsecutiveChronosAutomaticTimerAction(reportActionsToRender, canonicalIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
            isConsecutiveActionMadeByPreviousActor(reportActionsToRender, canonicalIndex, isOffline);

        const row = (
            <ReportActionsListRow
                index={index}
                isNewest={index === listData.length - 1}
                collapsedSystemMessageRun={collapsedSystemMessageRun}
                collapsedSystemMessageRunUnreadMarkerReportActionID={collapsedRunUnreadMarkerReportActionID}
                expandSystemMessageRun={expandSystemMessageRun}
                onExpandedSystemMessageReady={reportAction.reportActionID === focusRequestedReportActionID ? onExpandedSystemMessageReady : undefined}
                hasPreviousMessages={!!hasPreviousMessages}
                showFullHistory={!showHiddenHistory}
                onShowPreviousMessages={onShowPreviousMessages}
                reportAction={reportAction}
                parentReportAction={parentReportAction}
                parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                report={reportStable}
                transactionThreadReport={transactionThreadReport}
                chatReport={chatReportStable}
                linkedReportActionID={linkedReportActionID}
                displayAsGroup={shouldGroupWithPreviousActor}
                shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                shouldDisplayReplyDivider={reportActionsToRender.length > 1}
                isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                isLatestConciergeFeedbackAction={latestConciergeFeedbackActionIDs.includes(reportAction.reportActionID)}
                reportsParentHierarchy={reportsParentHierarchy}
                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
            />
        );
        if (reportAction.reportActionID !== linkedReportActionID) {
            return row;
        }
        // The linked row always renders as a fragment, so removing the skeleton does not remount the row.
        return (
            <>
                {row}
                {shouldShowSkeletonBelowLinkedAction && (
                    <SkeletonBelowLinkedAction
                        linkedActionIndex={index}
                        hasNewerRows={hasRowsBelowLinkedAction}
                        onNewerRowMeasured={hideSkeletonBelowLinkedAction}
                    />
                )}
            </>
        );
    };

    // Ensure row presentation updates when these values change without changing the action data.
    const extraData = [
        unreadMarkerReportActionID,
        isArchivedNonExpenseReport(report, isReportArchived),
        draftReportActionID,
        draftMessageHTML,
        isDraftPendingCompletion,
        latestConciergeFeedbackActionIDs,
        expandedSystemMessageReportActionIDs,
        focusRequestedReportActionID,
        shouldShowSkeletonBelowLinkedAction,
        hasRowsBelowLinkedAction,
    ];

    return {renderItem, extraData};
}

export default useReportActionsListRenderItem;
