import React, {memo, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getOriginalMessage, isSentMoneyReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
import {isChatThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, Report, ReportAction, ReportActionReactions, ReportActionsDrafts, Transaction} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';

type ReportActionsListItemRendererProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<Report>;

    /** All the data of the policy collection */
    policies: OnyxCollection<Policy>;

    /** All the data of the action item */
    reportAction: ReportAction;

    /** Array of report actions for the report */
    reportActions: ReportAction[];

    /** All the data of the transaction collection */
    transactions?: Array<OnyxEntry<Transaction>>;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread: OnyxEntry<ReportAction>;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Report for this action */
    report: OnyxEntry<Report>;

    /** The transaction thread report associated with the report for this action, if any */
    transactionThreadReport: OnyxEntry<Report>;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID?: string | null;

    /** If the thread divider line should be hidden */
    shouldHideThreadDividerLine: boolean;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    /** Report action ID that was referenced in the deeplink to report  */
    linkedReportActionID?: string;

    /** Whether we should display "Replies" divider */
    shouldDisplayReplyDivider: boolean;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /** If the thread divider line will be used */
    shouldUseThreadDividerLine?: boolean;

    /** Animate highlight action in few seconds */
    shouldHighlight?: boolean;

    /** Draft messages for the report */
    draftMessage?: string;

    /** Emoji reactions for the report action */
    emojiReactions?: OnyxEntry<ReportActionReactions>;

    /** User wallet tierName */
    userWalletTierName: string | undefined;

    /** Linked transaction route error */
    linkedTransactionRouteError?: OnyxEntry<Errors>;

    /** Whether the user is validated */
    isUserValidated: boolean | undefined;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** User billing fund ID */
    userBillingFundID: number | undefined;

    /** All draft messages collection */
    allDraftMessages?: OnyxCollection<ReportActionsDrafts>;

    /** All emoji reactions collection */
    allEmojiReactions?: OnyxCollection<ReportActionReactions>;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed: boolean | undefined;
    /** Whether the report is archived */
    isReportArchived: boolean;

    /** Report name value pairs origin */
    reportNameValuePairsOrigin?: string;

    /** Report name value pairs originalID */
    reportNameValuePairsOriginalID?: string;
};

function ReportActionsListItemRenderer({
    allReports,
    policies,
    reportAction,
    reportActions = [],
    transactions,
    parentReportAction,
    index,
    report,
    transactionThreadReport,
    displayAsGroup,
    mostRecentIOUReportActionID = '',
    shouldHideThreadDividerLine,
    shouldDisplayNewMarker,
    linkedReportActionID = '',
    shouldDisplayReplyDivider,
    isFirstVisibleReportAction = false,
    shouldUseThreadDividerLine = false,
    shouldHighlight = false,
    parentReportActionForTransactionThread,
    draftMessage,
    emojiReactions,
    userWalletTierName,
    linkedTransactionRouteError,
    isUserValidated,
    userBillingFundID,
    personalDetails,
    allDraftMessages,
    allEmojiReactions,
    isTryNewDotNVPDismissed = false,
    isReportArchived = false,
    reportNameValuePairsOrigin,
    reportNameValuePairsOriginalID,
}: ReportActionsListItemRendererProps) {
    const originalMessage = useMemo(() => getOriginalMessage(reportAction), [reportAction]);

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
                originalMessage,
                childCommenterCount: reportAction.childCommenterCount,
                linkMetadata: reportAction.linkMetadata,
                childReportID: reportAction.childReportID,
                childLastVisibleActionCreated: reportAction.childLastVisibleActionCreated,
                error: reportAction.error,
                created: reportAction.created,
                actorAccountID: reportAction.actorAccountID,
                adminAccountID: reportAction.adminAccountID,
                childVisibleActionCount: reportAction.childVisibleActionCount,
                childOldestFourAccountIDs: reportAction.childOldestFourAccountIDs,
                childType: reportAction.childType,
                person: reportAction.person,
                isOptimisticAction: reportAction.isOptimisticAction,
                delegateAccountID: reportAction.delegateAccountID,
                previousMessage: reportAction.previousMessage,
                isAttachmentWithText: reportAction.isAttachmentWithText,
                childStateNum: reportAction.childStateNum,
                childStatusNum: reportAction.childStatusNum,
                childReportName: reportAction.childReportName,
                childManagerAccountID: reportAction.childManagerAccountID,
                childMoneyRequestCount: reportAction.childMoneyRequestCount,
                childOwnerAccountID: reportAction.childOwnerAccountID,
            }) as ReportAction,
        [
            reportAction.reportActionID,
            reportAction.message,
            reportAction.pendingAction,
            reportAction.actionName,
            reportAction.errors,
            reportAction.childCommenterCount,
            reportAction.linkMetadata,
            reportAction.childReportID,
            reportAction.childLastVisibleActionCreated,
            reportAction.error,
            reportAction.created,
            reportAction.actorAccountID,
            reportAction.adminAccountID,
            reportAction.childVisibleActionCount,
            reportAction.childOldestFourAccountIDs,
            reportAction.childType,
            reportAction.person,
            reportAction.isOptimisticAction,
            reportAction.delegateAccountID,
            reportAction.previousMessage,
            reportAction.isAttachmentWithText,
            reportAction.childStateNum,
            reportAction.childStatusNum,
            reportAction.childReportName,
            reportAction.childManagerAccountID,
            reportAction.childMoneyRequestCount,
            reportAction.childOwnerAccountID,
            originalMessage,
        ],
    );

    const shouldDisplayParentAction =
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && (!isTransactionThread(parentReportAction) || isSentMoneyReportAction(parentReportAction));

    if (shouldDisplayParentAction && isChatThread(report)) {
        return (
            <ReportActionItemParentAction
                allReports={allReports}
                policies={policies}
                shouldHideThreadDividerLine={shouldDisplayParentAction && shouldHideThreadDividerLine}
                shouldDisplayReplyDivider={shouldDisplayReplyDivider}
                parentReportAction={parentReportAction}
                reportID={report.reportID}
                report={report}
                reportActions={reportActions}
                transactionThreadReport={transactionThreadReport}
                index={index}
                isFirstVisibleReportAction={isFirstVisibleReportAction}
                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                userWalletTierName={userWalletTierName}
                isUserValidated={isUserValidated}
                personalDetails={personalDetails}
                allDraftMessages={allDraftMessages}
                allEmojiReactions={allEmojiReactions}
                linkedTransactionRouteError={linkedTransactionRouteError}
                userBillingFundID={userBillingFundID}
                isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                isReportArchived={isReportArchived}
            />
        );
    }

    return (
        <ReportActionItem
            allReports={allReports}
            policies={policies}
            shouldHideThreadDividerLine={shouldHideThreadDividerLine}
            parentReportAction={parentReportAction}
            report={report}
            transactionThreadReport={transactionThreadReport}
            parentReportActionForTransactionThread={parentReportActionForTransactionThread}
            action={action}
            reportActions={reportActions}
            linkedReportActionID={linkedReportActionID}
            displayAsGroup={displayAsGroup}
            transactions={transactions}
            shouldDisplayNewMarker={shouldDisplayNewMarker}
            isMostRecentIOUReportAction={reportAction.reportActionID === mostRecentIOUReportActionID}
            index={index}
            isFirstVisibleReportAction={isFirstVisibleReportAction}
            shouldUseThreadDividerLine={shouldUseThreadDividerLine}
            shouldHighlight={shouldHighlight}
            userWalletTierName={userWalletTierName}
            isUserValidated={isUserValidated}
            personalDetails={personalDetails}
            draftMessage={draftMessage}
            emojiReactions={emojiReactions}
            linkedTransactionRouteError={linkedTransactionRouteError}
            userBillingFundID={userBillingFundID}
            isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
            reportNameValuePairsOrigin={reportNameValuePairsOrigin}
            reportNameValuePairsOriginalID={reportNameValuePairsOriginalID}
        />
    );
}

export default memo(ReportActionsListItemRenderer);
