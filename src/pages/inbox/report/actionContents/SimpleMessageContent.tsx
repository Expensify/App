import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {
    getActionableCard3DSTransactionApprovalMessage,
    getDemotedFromWorkspaceMessage,
    getDismissedViolationMessageText,
    getMarkedReimbursedMessage,
    getOriginalMessage,
    getRemovedFromApprovalChainMessage,
    getReportActionMessageText,
    getReportActionText,
    isActionOfType,
    isRejectedAction,
    isUnapprovedAction,
} from '@libs/ReportActionsUtils';
import {getDeletedTransactionMessage, getPolicyChangeMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type SimpleMessageContentProps = {
    action: OnyxTypes.ReportAction;
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
]);

function isSimpleMessageAction(action: OnyxTypes.ReportAction): boolean {
    return SIMPLE_MESSAGE_ACTION_TYPES.has(action.actionName) || isUnapprovedAction(action) || isRejectedAction(action);
}

function SimpleMessageContent({action}: SimpleMessageContentProps) {
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
        const htmlMessage = getReportActionMessageText(action) || translate('iou.receiptScanningFailed');
        return <ReportActionItemBasicMessage message={htmlMessage} />;
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

    return null;
}

SimpleMessageContent.displayName = 'SimpleMessageContent';

export default SimpleMessageContent;
export {isSimpleMessageAction};
