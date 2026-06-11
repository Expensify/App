import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import CreatedReportForUnapprovedTransactionsAction from '@components/ReportActionItem/CreatedReportForUnapprovedTransactionsAction';
import CreateHarvestReportAction from '@components/ReportActionItem/CreateHarvestReportAction';
import ExportIntegration from '@components/ReportActionItem/ExportIntegration';
import IssueCardMessage from '@components/ReportActionItem/IssueCardMessage';
import MoneyRequestAction from '@components/ReportActionItem/MoneyRequestAction';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import MovedTransactionAction from '@components/ReportActionItem/MovedTransactionAction';
import TaskAction from '@components/ReportActionItem/TaskAction';
import TaskPreview from '@components/ReportActionItem/TaskPreview';
import TripRoomPreview from '@components/ReportActionItem/TripRoomPreview';
import UnreportedTransactionAction from '@components/ReportActionItem/UnreportedTransactionAction';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    getChangedApproverActionMessage,
    getCompanyCardConnectionBrokenMessage,
    getIOUReportIDFromReportActionPreview,
    getOriginalMessage,
    getPlaidBalanceFailureMessage,
    getRenamedAction,
    getReportActionHtml,
    getSettlementAccountLockedMessage,
    getTravelUpdateMessage,
    isActionableCardFraudAlert,
    isActionableJoinRequest,
    isActionableMentionInviteToSubmitExpenseConfirmWhisper,
    isActionableMentionWhisper,
    isActionableReportMentionWhisper,
    isActionOfType,
    isCardBrokenConnectionAction,
    isCardIssuedAction,
    isCreatedTaskReportAction,
    isIOURequestReportAction,
    isMoneyRequestAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isTaskAction,
    isTripPreview,
} from '@libs/ReportActionsUtils';
import {getMovedActionMessage, isExpenseReport} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import ApprovalFlowContent, {isApprovalFlowAction} from './ApprovalFlowContent';
import CardBrokenConnectionContent from './CardBrokenConnectionContent';
import ChatMessageContent from './ChatMessageContent';
import ChatTransactionPreview from './ChatTransactionPreview';
import ConfirmWhisperContent from './ConfirmWhisperContent';
import FraudAlertContent from './FraudAlertContent';
import IntegrationSyncFailedMessage from './IntegrationSyncFailedMessage';
import JoinRequestContent from './JoinRequestContent';
import MentionWhisperContent from './MentionWhisperContent';
import ModifiedExpenseContent from './ModifiedExpenseContent';
import PaymentContent from './PaymentContent';
import PolicyChangeLogContent, {isHandledPolicyChangeLogAction} from './PolicyChangeLogContent';
import ReceiptScanFailedContent from './ReceiptScanFailedContent';
import ReimbursedContent from './ReimbursedContent';
import ReimbursementDeQueuedContent from './ReimbursementDeQueuedContent';
import ReimbursementQueuedContent from './ReimbursementQueuedContent';
import ReportMentionWhisperContent from './ReportMentionWhisperContent';
import SimpleMessageContent, {isSimpleMessageAction} from './SimpleMessageContent';

type ActionContentRouterProps = {
    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<OnyxTypes.Report>;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxTypes.Report;

    /** Report ID for the current report */
    reportID: string | undefined;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** ReportAction draft message */
    draftMessage: string | undefined;

    /** Whether the report action is a whisper */
    isWhisper: boolean;

    /** Whether the report action is hovered (or context menu / emoji picker active) */
    hovered: boolean;

    /** Whether the message is moderation-hidden */
    isHidden: boolean;

    /** Toggle the hidden state of the message */
    updateHiddenState: (isHiddenValue: boolean) => void;

    /** Whether the provided report is a closed expense report with no expenses */
    isClosedExpenseReportWithNoExpenses?: boolean;

    /** Whether the report action is the "Created" action of a harvest-created expense report */
    isHarvestCreatedExpenseReport: boolean;

    /** Whether to show border for MoneyRequestReportPreviewContent */
    shouldShowBorder?: boolean;

    /** Whether the search-page UI is active */
    isOnSearch: boolean;

    /** Toggle whether the payment method popover is active */
    setIsPaymentMethodPopoverActive: (value: boolean) => void;
};

function ActionContentRouter({
    action,
    report,
    originalReport,
    originalReportID,
    iouReport,
    reportID,
    displayAsGroup,
    draftMessage,
    isWhisper,
    hovered,
    isHidden,
    updateHiddenState,
    isClosedExpenseReportWithNoExpenses,
    isHarvestCreatedExpenseReport,
    shouldShowBorder,
    isOnSearch,
    setIsPaymentMethodPopoverActive,
}: ActionContentRouterProps): React.JSX.Element | null {
    const {translate, formatTravelDate} = useLocalize();
    const styles = useThemeStyles();

    // Report that owns this action for mutations (thread / merged-list cases use originalReport). This is a stable projection (heartbeat fields stripped).
    const actionOwnerReportStable = originalReport ?? report;

    const actionOwnerReportID = originalReportID ?? reportID;
    const policyID = report?.policyID;
    const reportOwnerAccountID = report?.ownerAccountID;

    if (isIOURequestReportAction(action)) {
        const moneyRequestOriginalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
        // If originalMessage.iouReportID is set, this is a 1:1 IOU expense in a DM chat whose reportID is report.chatReportID
        const chatReportID = moneyRequestOriginalMessage?.IOUReportID ? report?.chatReportID : reportID;

        if (report?.type === CONST.REPORT.TYPE.CHAT) {
            const isSplitBill = moneyRequestOriginalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
            const isSplitScanWithNoAmount = isSplitBill && moneyRequestOriginalMessage?.amount === 0;
            const shouldShowSplitPreview = isSplitBill || isSplitScanWithNoAmount;
            if (report.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM || shouldShowSplitPreview) {
                return (
                    <ChatTransactionPreview
                        action={action}
                        reportID={reportID}
                        iouReport={iouReport}
                        shouldShowSplitPreview={shouldShowSplitPreview}
                        transactionID={shouldShowSplitPreview ? moneyRequestOriginalMessage?.IOUTransactionID : undefined}
                    />
                );
            }
            // No per-action preview in non-self-DM chats — the preview lives in the linked expense report.
            return null;
        }

        return (
            <MoneyRequestAction
                chatReportID={chatReportID}
                // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
                requestReportID={moneyRequestOriginalMessage?.IOUReportID?.toString()}
                reportID={reportID}
                action={action}
                isHovered={hovered}
                style={displayAsGroup ? [] : [styles.mt2]}
                isWhisper={isWhisper}
            />
        );
    }
    if (isTripPreview(action)) {
        return (
            <TripRoomPreview
                action={action}
                isHovered={hovered}
                containerStyles={displayAsGroup ? [] : [styles.mt2]}
            />
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isClosedExpenseReportWithNoExpenses) {
        return <RenderHTML html={`<deleted-action>${translate('parentReportAction.deletedReport')}</deleted-action>`} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
        return (
            <MoneyRequestReportPreview
                iouReportID={getIOUReportIDFromReportActionPreview(action)}
                policyID={policyID}
                chatReportID={reportID}
                action={action}
                isHovered={hovered}
                isWhisper={isWhisper}
                onPaymentOptionsShow={() => setIsPaymentMethodPopoverActive(true)}
                onPaymentOptionsHide={() => setIsPaymentMethodPopoverActive(false)}
                shouldShowBorder={shouldShowBorder}
            />
        );
    }
    if (isTaskAction(action)) {
        return <TaskAction action={action} />;
    }
    if (isCreatedTaskReportAction(action)) {
        return (
            <TaskPreview
                style={displayAsGroup ? [] : [styles.mt1]}
                chatReportID={reportID}
                action={action}
                isHovered={hovered}
                policyID={policyID}
            />
        );
    }
    if (isReimbursementQueuedAction(action)) {
        return (
            <ReimbursementQueuedContent
                action={action}
                report={report}
                iouReport={iouReport}
            />
        );
    }
    if (isReimbursementDeQueuedOrCanceledAction(action)) {
        return (
            <ReimbursementDeQueuedContent
                action={action}
                reportOwnerAccountID={reportOwnerAccountID}
            />
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
        return (
            <ModifiedExpenseContent
                action={action}
                policyID={policyID}
                originalReport={originalReport}
            />
        );
    }
    if (isApprovalFlowAction(action)) {
        return (
            <ApprovalFlowContent
                action={action}
                policyID={policyID}
                reportID={reportID}
                originalReport={originalReport}
            />
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        return (
            <PaymentContent
                action={action}
                policyID={policyID}
            />
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        return (
            <ReimbursedContent
                action={action}
                reportOwnerAccountID={reportOwnerAccountID}
            />
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
        return (
            <ReceiptScanFailedContent
                reportID={reportID}
                reportType={report?.type}
                parentReportID={report?.parentReportID}
                parentReportActionID={report?.parentReportActionID}
                actionReportID={action.reportID}
                action={action}
            />
        );
    }
    if (isSimpleMessageAction(action)) {
        return <SimpleMessageContent action={action} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const wasAutoForwarded = getOriginalMessage(action)?.automaticAction ?? false;
        if (wasAutoForwarded) {
            return (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyForwarded')}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        }
        return <ReportActionItemBasicMessage message={translate('iou.forwarded')} />;
    }
    if (isHandledPolicyChangeLogAction(action)) {
        return (
            <PolicyChangeLogContent
                action={action}
                policyID={policyID}
            />
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION) {
        return (
            <MovedTransactionAction
                action={action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION>}
                originalReport={originalReport}
            />
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getMovedActionMessage(translate, action, report)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getTravelUpdateMessage(translate, action, formatTravelDate)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
        return (
            <UnreportedTransactionAction
                action={action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION>}
                originalReport={originalReport}
            />
        );
    }
    if (
        action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_DEACTIVATED
    ) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getReportActionHtml(action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (isActionableCardFraudAlert(action)) {
        return (
            <FraudAlertContent
                action={action}
                reportID={reportID}
            />
        );
    }
    if (isActionableJoinRequest(action)) {
        return (
            <JoinRequestContent
                action={action}
                actionOwnerReportID={actionOwnerReportID}
                policyID={policyID}
            />
        );
    }
    if (isActionableMentionWhisper(action)) {
        return (
            <MentionWhisperContent
                action={action}
                actionOwnerReportStable={actionOwnerReportStable}
                originalReportID={originalReportID}
                parentReport={originalReport ? report : undefined}
                policyID={policyID}
            />
        );
    }
    if (isActionableReportMentionWhisper(action)) {
        return (
            <ReportMentionWhisperContent
                action={action}
                reportID={reportID}
                actionOwnerReportStable={actionOwnerReportStable}
            />
        );
    }
    if (isActionableMentionInviteToSubmitExpenseConfirmWhisper(action)) {
        return (
            <ConfirmWhisperContent
                action={action}
                reportID={reportID}
                actionOwnerReportStable={actionOwnerReportStable}
                originalReportID={originalReportID}
            />
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM)) {
        return <ReportActionItemBasicMessage message={translate('report.actions.type.leftTheChat')} />;
    }
    if (isCardIssuedAction(action)) {
        return (
            <IssueCardMessage
                action={action}
                policyID={policyID}
            />
        );
    }
    if (isCardBrokenConnectionAction(action)) {
        return <CardBrokenConnectionContent action={action} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
        return (
            <ExportIntegration
                action={action}
                originalReport={originalReport}
            />
        );
    }
    if (isRenamedAction(action)) {
        return <ReportActionItemBasicMessage message={getRenamedAction(translate, action, isExpenseReport(report))} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        return (
            <IntegrationSyncFailedMessage
                action={action}
                policyID={policyID}
            />
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getCompanyCardConnectionBrokenMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getPlaidBalanceFailureMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CREATED) && isHarvestCreatedExpenseReport) {
        return <CreateHarvestReportAction reportID={reportID} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
        return <CreatedReportForUnapprovedTransactionsAction action={action} />;
    }
    if (
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REROUTE) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER)
    ) {
        return (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<comment><muted-text>${getChangedApproverActionMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
        return (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<comment><muted-text>${getSettlementAccountLockedMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }

    return (
        <ChatMessageContent
            action={action}
            policyID={policyID}
            reportID={reportID}
            originalReportID={originalReportID}
            displayAsGroup={displayAsGroup}
            draftMessage={draftMessage}
            isHidden={isHidden}
            updateHiddenState={updateHiddenState}
            isOnSearch={isOnSearch}
        />
    );
}

export default ActionContentRouter;
