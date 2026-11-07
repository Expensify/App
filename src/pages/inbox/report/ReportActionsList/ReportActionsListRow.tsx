/**
 * One row of the report actions list. A send shifts every row's index, so renderItem runs for all visible rows.
 * Building the row inside this component lets React Compiler reuse the elements of rows whose props did not change.
 */
import type {SystemMessageRun} from '@libs/ReportActionsUtils';

import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';
import {ReportActionPositionContextProvider} from '@pages/inbox/report/ReportActionIndexContext';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import type {ReportActionsListItemRendererProps} from '@pages/inbox/report/ReportActionsListItemRenderer';
import ShowPreviousMessagesButton from '@pages/inbox/report/ShowPreviousMessagesButton';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React from 'react';

type ReportActionsListRowProps = Omit<ReportActionsListItemRendererProps, 'onExpandedSystemMessageReady'> & {
    index: number;

    /** Set only when this row anchors a collapsed run of system messages. The row then renders the run instead of the action. */
    collapsedSystemMessageRun?: SystemMessageRun;

    /** Set only when the unread marker falls inside the collapsed run and the thread divider does not hide it */
    collapsedSystemMessageRunUnreadMarkerReportActionID?: string;

    expandSystemMessageRun: (reportActionIDs: string[]) => void;

    /** Passed only to the row whose action has focus requested */
    onExpandedSystemMessageReady?: (reportActionID: string, target: ComponentRef<typeof View> | null) => void;
    hasPreviousMessages: boolean;
    showFullHistory: boolean;
    onShowPreviousMessages: () => void;
};

function ReportActionsListRow({
    index,
    collapsedSystemMessageRun,
    collapsedSystemMessageRunUnreadMarkerReportActionID,
    expandSystemMessageRun,
    onExpandedSystemMessageReady,
    hasPreviousMessages,
    showFullHistory,
    onShowPreviousMessages,
    reportAction,
    parentReportAction,
    parentReportActionForTransactionThread,
    report,
    transactionThreadReport,
    chatReport,
    linkedReportActionID,
    displayAsGroup,
    shouldHideThreadDividerLine,
    shouldDisplayNewMarker,
    shouldDisplayReplyDivider,
    isFirstVisibleReportAction,
    isLatestConciergeFeedbackAction,
    reportsParentHierarchy,
    shouldUseThreadDividerLine,
    isHarvestCreatedExpenseReport,
    shouldDisableContextMenuForConciergeDraft,
}: ReportActionsListRowProps) {
    return (
        <ReportActionPositionContextProvider
            index={index}
            isNewest={index === 0}
        >
            {collapsedSystemMessageRun ? (
                <CollapsedSystemMessages
                    count={collapsedSystemMessageRun.reportActionIDs.length}
                    earliestReportAction={collapsedSystemMessageRun.earliestReportAction}
                    report={report}
                    onPress={() => expandSystemMessageRun(collapsedSystemMessageRun.reportActionIDs)}
                    unreadMarkerReportActionID={collapsedSystemMessageRunUnreadMarkerReportActionID}
                />
            ) : (
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                    report={report}
                    transactionThreadReport={transactionThreadReport}
                    chatReport={chatReport}
                    linkedReportActionID={linkedReportActionID}
                    displayAsGroup={displayAsGroup}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                    shouldDisplayReplyDivider={shouldDisplayReplyDivider}
                    isFirstVisibleReportAction={isFirstVisibleReportAction}
                    isLatestConciergeFeedbackAction={isLatestConciergeFeedbackAction}
                    reportsParentHierarchy={reportsParentHierarchy}
                    onExpandedSystemMessageReady={onExpandedSystemMessageReady ? (target) => onExpandedSystemMessageReady(reportAction.reportActionID, target) : undefined}
                    shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                    isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReport}
                    shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                />
            )}
            {!!report?.reportID && (
                <ShowPreviousMessagesButton
                    reportID={report.reportID}
                    actionType={reportAction.actionName}
                    hasPreviousMessages={hasPreviousMessages}
                    showFullHistory={showFullHistory}
                    onPress={onShowPreviousMessages}
                />
            )}
        </ReportActionPositionContextProvider>
    );
}

export default ReportActionsListRow;
