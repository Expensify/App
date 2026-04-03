import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {
    getActionableCard3DSTransactionApprovalMessage,
    getDemotedFromWorkspaceMessage,
    getDismissedViolationMessageText,
    getOriginalMessage,
    getRemovedFromApprovalChainMessage,
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

/**
 * Type guard that returns true for action types handled by SimpleMessageContent.
 * These are all one-liner branches that render a single ReportActionItemBasicMessage.
 */
function isSimpleMessageAction(action: OnyxTypes.ReportAction): boolean {
    return (
        action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED) ||
        isUnapprovedAction(action) ||
        isRejectedAction(action) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN)
    );
}

function SimpleMessageContent({action}: SimpleMessageContentProps) {
    const {translate} = useLocalize();

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
        return <ReportActionItemBasicMessage message={translate('iou.heldExpense')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT) {
        return <ReportActionItemBasicMessage message={getReportActionText(action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
        return <ReportActionItemBasicMessage message={translate('iou.unheldExpense')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD) {
        return <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.rejectedExpense')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED) {
        return <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.markedAsResolved')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
        return <ReportActionItemBasicMessage message={translate('iou.retracted')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
        return <ReportActionItemBasicMessage message={translate('iou.reopened')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY) {
        return <ReportActionItemBasicMessage message={getPolicyChangeMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION) {
        return <ReportActionItemBasicMessage message={getDeletedTransactionMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
        return <ReportActionItemBasicMessage message={translate('systemMessage.mergedWithCashTransaction')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
        return <ReportActionItemBasicMessage message={getDismissedViolationMessageText(translate, getOriginalMessage(action))} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES)) {
        return <ReportActionItemBasicMessage message={translate('violations.resolvedDuplicates')} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
        return <ReportActionItemBasicMessage message={translate('iou.receiptScanningFailed')} />;
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

    // Fallback — should not be reached if the dispatch guard is correct
    return null;
}

SimpleMessageContent.displayName = 'SimpleMessageContent';

export {isSimpleMessageAction};
export default SimpleMessageContent;
