import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {shouldKeepBillPayActorHeader} from '@libs/BillPayReportActionUtils';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import {isConsecutiveActionMadeByPreviousActor, isDeletedParentAction, isReversedTransaction, isTransactionThread} from '@libs/ReportActionsUtils';
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

import {useReportActionsListActions, useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';

import CONST from '@src/CONST';
import {isLinkedToBillSelector} from '@src/selectors/ReportNameValuePairs';
import type * as OnyxTypes from '@src/types/onyx';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import type {UseReportActionsListRenderItemParams} from './types';

import ReportActionsListRow from './ReportActionsListRow';

/** Builds the report-actions row renderer and the `extraData` values that must re-render rows when they change. */
function useReportActionsListRenderItem({onExpandedSystemMessageReady}: UseReportActionsListRenderItemParams) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {
        report,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        parentReportAction,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
        reportStable,
        chatReportStable,
        reportsParentHierarchy,
        reportNameValuePairs,
        isReportArchived,
        isOffline,
        renderedVisibleReportActions,
        listData,
        canonicalIndexByReportActionID,
        runsByAnchorReportActionID,
        expandedSystemMessageReportActionIDs,
        focusRequestedReportActionID,
        draftMessageHTML,
        draftReportActionID,
        isDraftPendingCompletion,
        unreadMarkerReportActionID,
        linkedReportActionID,
        firstVisibleReportActionID,
        latestConciergeFeedbackActionIDs,
    } = useReportActionsListState();
    const {expandSystemMessageRun, handleShowPreviousMessages: onShowPreviousMessages} = useReportActionsListActions();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);
    const isInvoiceLinkedToBill = isLinkedToBillSelector(reportNameValuePairs);

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

        const collapsedSystemMessageRun = systemMessageRun && !systemMessageRun.isExpanded ? systemMessageRun : undefined;
        let actionReport = report;
        if (!reportAction.reportID) {
            actionReport = undefined;
        } else if (reportAction.reportID === transactionThreadReport?.reportID) {
            actionReport = transactionThreadReport;
        }

        return (
            <ReportActionsListRow
                index={index}
                collapsedSystemMessageRun={collapsedSystemMessageRun}
                collapsedSystemMessageRunUnreadMarkerReportActionID={
                    unreadMarkerReportActionID &&
                    collapsedSystemMessageRun?.reportActionIDs.includes(unreadMarkerReportActionID) &&
                    (!shouldUseThreadDividerLine || !shouldHideThreadDividerLine)
                        ? unreadMarkerReportActionID
                        : undefined
                }
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
                displayAsGroup={
                    !isAfterCollapsedRun &&
                    !shouldKeepBillPayActorHeader(reportAction, previousReportAction, reportStable, isInvoiceLinkedToBill) &&
                    !isConsecutiveChronosAutomaticTimerAction(renderedVisibleReportActions, canonicalIndex, chatIncludesChronosWithID(actionReport), isOffline) &&
                    isConsecutiveActionMadeByPreviousActor(renderedVisibleReportActions, canonicalIndex, isOffline)
                }
                shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                shouldDisplayReplyDivider={renderedVisibleReportActions.length > 1}
                isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                isLatestConciergeFeedbackAction={latestConciergeFeedbackActionIDs.includes(reportAction.reportActionID)}
                reportsParentHierarchy={reportsParentHierarchy}
                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
            />
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
