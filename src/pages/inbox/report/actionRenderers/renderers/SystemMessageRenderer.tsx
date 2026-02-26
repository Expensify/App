import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import {
    getDemotedFromWorkspaceMessage,
    getDismissedViolationMessageText,
    getMarkedReimbursedMessage,
    getOriginalMessage,
    getRemovedFromApprovalChainMessage,
    getReportActionText,
    isActionOfType,
} from '@libs/ReportActionsUtils';
import {getDeletedTransactionMessage, getPolicyChangeMessage} from '@libs/ReportUtils';
import type ActionRendererProps from '@pages/inbox/report/actionRenderers/types';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';

function SystemMessageRenderer({action}: ActionRendererProps) {
    const {translate} = useLocalize();

    switch (action.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.HOLD:
            return <ReportActionItemBasicMessage message={translate('iou.heldExpense')} />;

        case CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT:
            return <ReportActionItemBasicMessage message={getReportActionText(action)} />;

        case CONST.REPORT.ACTIONS.TYPE.UNHOLD:
            return <ReportActionItemBasicMessage message={translate('iou.unheldExpense')} />;

        case CONST.REPORT.ACTIONS.TYPE.REJECTED:
            return <ReportActionItemBasicMessage message={translate('iou.rejectedThisReport')} />;

        case CONST.REPORT.ACTIONS.TYPE.RETRACTED:
            return <ReportActionItemBasicMessage message={translate('iou.retracted')} />;

        case CONST.REPORT.ACTIONS.TYPE.REOPENED:
            return <ReportActionItemBasicMessage message={translate('iou.reopened')} />;

        case CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD:
            return <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.rejectedExpense')} />;

        case CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED:
            return <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.markedAsResolved')} />;

        case CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION:
            return <ReportActionItemBasicMessage message={translate('systemMessage.mergedWithCashTransaction')} />;

        case CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY:
            return <ReportActionItemBasicMessage message={getPolicyChangeMessage(translate, action)} />;

        case CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION:
            return <ReportActionItemBasicMessage message={getDeletedTransactionMessage(translate, action)} />;

        default:
            break;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
        return <ReportActionItemBasicMessage message={translate('iou.receiptScanningFailed')} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.UNAPPROVED)) {
        return <ReportActionItemBasicMessage message={translate('iou.unapproved')} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
        return <ReportActionItemBasicMessage message={getDismissedViolationMessageText(translate, getOriginalMessage(action))} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES)) {
        return <ReportActionItemBasicMessage message={translate('violations.resolvedDuplicates')} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        const isFromNewDot = getOriginalMessage(action)?.isNewDot ?? false;
        if (isFromNewDot) {
            return <RenderHTML html="" />;
        }
        return <ReportActionItemBasicMessage message={getMarkedReimbursedMessage(translate, action)} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN)) {
        return <ReportActionItemBasicMessage message={getRemovedFromApprovalChainMessage(translate, action)} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE)) {
        return <ReportActionItemBasicMessage message={getDemotedFromWorkspaceMessage(translate, action)} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM)) {
        return <ReportActionItemBasicMessage message={translate('report.actions.type.leftTheChat')} />;
    }

    return null;
}

SystemMessageRenderer.displayName = 'SystemMessageRenderer';

export default SystemMessageRenderer;
