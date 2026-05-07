import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getActionableCard3DSTransactionApprovalMessage,
    getDemotedFromWorkspaceMessage,
    getDismissedViolationMessageText,
    getLinkedTransactionID,
    getMarkedReimbursedMessage,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getRemovedFromApprovalChainMessage,
    getReportActionText,
    isActionOfType,
    isRejectedAction,
    isUnapprovedAction,
    wasActionTakenByCurrentUser,
} from '@libs/ReportActionsUtils';
import {getDeletedTransactionMessage, getPolicyChangeMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type SimpleMessageContentProps = {
    action: OnyxTypes.ReportAction;
    report: OnyxEntry<OnyxTypes.Report>;
};

const SIMPLE_MESSAGE_ACTION_TYPES = new Set<string>([
    CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED,
    CONST.REPORT.ACTIONS.TYPE.HOLD,
    CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT,
    CONST.REPORT.ACTIONS.TYPE.UNHOLD,
    CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD,
    CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED,
    CONST.REPORT.ACTIONS.TYPE.RETRACTED,
    CONST.REPORT.ACTIONS.TYPE.REOPENED,
    CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY,
    CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION,
    CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION,
    CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION,
    CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES,
    CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED,
    CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE,
    CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL,
    CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN,
    CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION,
]);

function isSimpleMessageAction(action: OnyxTypes.ReportAction): boolean {
    return SIMPLE_MESSAGE_ACTION_TYPES.has(action.actionName) || isUnapprovedAction(action) || isRejectedAction(action);
}

function ReceiptScanFailedContent({report}: {report: OnyxEntry<OnyxTypes.Report>}) {
    const {translate} = useLocalize();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    // Subscribe to the parent and grandparent report actions so the component re-renders when they arrive
    // — getReportAction reads a static snapshot and would otherwise leave us with stale data on first paint.
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [grandparentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(parentReport?.parentReportID)}`);
    // The action's parent isn't always the IOU action (it can be the CREATED action when the thread spans an extra layer),
    // so fall back to the grandparent action — this matches the lookup in ReportNameUtils.
    let iouAction: OnyxTypes.ReportAction | undefined = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    if (!isActionOfType(iouAction, CONST.REPORT.ACTIONS.TYPE.IOU)) {
        iouAction = parentReport?.parentReportActionID ? grandparentReportActions?.[parentReport.parentReportActionID] : undefined;
    }
    const transactionID = getLinkedTransactionID(iouAction);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);
    const smartscanFailedViolation = transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED);
    const missingFields = smartscanFailedViolation?.data?.missingFields ?? [];
    return <ReportActionItemBasicMessage message={translate('violations.smartscanFailed', {canEdit: wasActionTakenByCurrentUser(iouAction), missingFields})} />;
}

function SimpleMessageContent({action, report}: SimpleMessageContentProps) {
    const {translate} = useLocalize();

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        return <ReportActionItemBasicMessage message={getMarkedReimbursedMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.HOLD)) {
        return <ReportActionItemBasicMessage message={translate('iou.heldExpense')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT)) {
        return <ReportActionItemBasicMessage message={getReportActionText(action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.UNHOLD)) {
        return <ReportActionItemBasicMessage message={translate('iou.unheldExpense')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD)) {
        return <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.rejectedExpense')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED)) {
        return <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.markedAsResolved')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RETRACTED)) {
        return <ReportActionItemBasicMessage message={translate('iou.retracted')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REOPENED)) {
        return <ReportActionItemBasicMessage message={translate('iou.reopened')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION)) {
        return <ReportActionItemBasicMessage message={getDeletedTransactionMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION)) {
        return <ReportActionItemBasicMessage message={translate('systemMessage.mergedWithCashTransaction')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
        return <ReportActionItemBasicMessage message={getDismissedViolationMessageText(translate, getOriginalMessage(action))} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES)) {
        return <ReportActionItemBasicMessage message={translate('violations.resolvedDuplicates')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
        return <ReceiptScanFailedContent report={report} />;
    }
    if (isUnapprovedAction(action)) {
        return <ReportActionItemBasicMessage message={translate('iou.unapproved')} />;
    }
    if (isRejectedAction(action)) {
        return <ReportActionItemBasicMessage message={translate('iou.rejectedThisReport')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE)) {
        return <ReportActionItemBasicMessage message={getDemotedFromWorkspaceMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL)) {
        return <ReportActionItemBasicMessage message={getActionableCard3DSTransactionApprovalMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN)) {
        return <ReportActionItemBasicMessage message={getRemovedFromApprovalChainMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION)) {
        return <ReportActionItemBasicMessage message={getMessageOfOldDotReportAction(translate, action)} />;
    }

    return null;
}

SimpleMessageContent.displayName = 'SimpleMessageContent';

export default SimpleMessageContent;
export {isSimpleMessageAction};
