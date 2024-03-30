import React, {memo, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';

type ReportActionsListItemRendererProps = {
    /** All the data of the action item */
    reportAction: ReportAction;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Report for this action */
    report: Report;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID?: string | null;

    /** If the thread divider line should be hidden */
    shouldHideThreadDividerLine: boolean;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    /** Linked report action ID */
    linkedReportActionID?: string;

    /** Whether we should display "Replies" divider */
    shouldDisplayReplyDivider: boolean;
};

function ReportActionsListItemRenderer({
    reportAction,
    parentReportAction,
    index,
    report,
    displayAsGroup,
    mostRecentIOUReportActionID = '',
    shouldHideThreadDividerLine,
    shouldDisplayNewMarker,
    linkedReportActionID = '',
    shouldDisplayReplyDivider,
}: ReportActionsListItemRendererProps) {
    const shouldDisplayParentAction =
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && ReportUtils.isChatThread(report) && !ReportActionsUtils.isTransactionThread(parentReportAction);

    /**
     * Create a lightweight ReportAction so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     */
    const action: ReportAction = useMemo(
        () =>
            ({
                reportActionID: reportAction.reportActionID,
                message: reportAction.message,
                pendingAction: reportAction.pendingAction,
                actionName: reportAction.actionName,
                errors: reportAction.errors,
                originalMessage: reportAction.originalMessage,
                childCommenterCount: reportAction.childCommenterCount,
                linkMetadata: reportAction.linkMetadata,
                childReportID: reportAction.childReportID,
                childLastVisibleActionCreated: reportAction.childLastVisibleActionCreated,
                whisperedToAccountIDs: reportAction.whisperedToAccountIDs,
                error: reportAction.error,
                created: reportAction.created,
                actorAccountID: reportAction.actorAccountID,
                childVisibleActionCount: reportAction.childVisibleActionCount,
                childOldestFourAccountIDs: reportAction.childOldestFourAccountIDs,
                childType: reportAction.childType,
                person: reportAction.person,
                isOptimisticAction: reportAction.isOptimisticAction,
                delegateAccountID: reportAction.delegateAccountID,
                previousMessage: reportAction.previousMessage,
                attachmentInfo: reportAction.attachmentInfo,
                childStateNum: reportAction.childStateNum,
                childStatusNum: reportAction.childStatusNum,
                childReportName: reportAction.childReportName,
                childManagerAccountID: reportAction.childManagerAccountID,
                childMoneyRequestCount: reportAction.childMoneyRequestCount,
            } as ReportAction),
        [
            reportAction.actionName,
            reportAction.childCommenterCount,
            reportAction.childLastVisibleActionCreated,
            reportAction.childReportID,
            reportAction.created,
            reportAction.error,
            reportAction.errors,
            reportAction.linkMetadata,
            reportAction.message,
            reportAction.originalMessage,
            reportAction.pendingAction,
            reportAction.reportActionID,
            reportAction.whisperedToAccountIDs,
            reportAction.actorAccountID,
            reportAction.childVisibleActionCount,
            reportAction.childOldestFourAccountIDs,
            reportAction.person,
            reportAction.isOptimisticAction,
            reportAction.childType,
            reportAction.delegateAccountID,
            reportAction.previousMessage,
            reportAction.attachmentInfo,
            reportAction.childStateNum,
            reportAction.childStatusNum,
            reportAction.childReportName,
            reportAction.childManagerAccountID,
            reportAction.childMoneyRequestCount,
        ],
    );

    return shouldDisplayParentAction ? (
        <ReportActionItemParentAction
            shouldHideThreadDividerLine={shouldDisplayParentAction && shouldHideThreadDividerLine}
            shouldDisplayReplyDivider={shouldDisplayReplyDivider}
            parentReportAction={parentReportAction}
            reportID={report.reportID}
            report={report}
            index={index}
        />
    ) : (
        <ReportActionItem
            shouldHideThreadDividerLine={shouldHideThreadDividerLine}
            parentReportAction={parentReportAction}
            report={report}
            action={action}
            linkedReportActionID={linkedReportActionID}
            displayAsGroup={displayAsGroup}
            shouldDisplayNewMarker={shouldDisplayNewMarker}
            shouldShowSubscriptAvatar={
                (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isExpenseReport(report)) &&
                [CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW, CONST.REPORT.ACTIONS.TYPE.SUBMITTED, CONST.REPORT.ACTIONS.TYPE.APPROVED].some(
                    (type) => type === reportAction.actionName,
                )
            }
            isMostRecentIOUReportAction={reportAction.reportActionID === mostRecentIOUReportActionID}
            index={index}
        />
    );
}

ReportActionsListItemRenderer.displayName = 'ReportActionsListItemRenderer';

export default memo(ReportActionsListItemRenderer);
