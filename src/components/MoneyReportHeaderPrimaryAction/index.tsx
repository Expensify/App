import CONST from '@src/CONST';

import React from 'react';

import type {MoneyReportHeaderPrimaryActionProps} from './types';

import ApprovePrimaryAction from './ApprovePrimaryAction';
import ExportPrimaryAction from './ExportPrimaryAction';
import MarkAsCashPrimaryAction from './MarkAsCashPrimaryAction';
import MarkAsResolvedPrimaryAction from './MarkAsResolvedPrimaryAction';
import PayPrimaryAction from './PayPrimaryAction';
import RemoveHoldPrimaryAction from './RemoveHoldPrimaryAction';
import ReviewDuplicatesPrimaryAction from './ReviewDuplicatesPrimaryAction';
import SubmitPrimaryAction from './SubmitPrimaryAction';

function MoneyReportHeaderPrimaryAction({reportID, chatReportID, primaryAction, onExportModalOpen}: MoneyReportHeaderPrimaryActionProps) {
    if (!primaryAction) {
        return null;
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT) {
        return <SubmitPrimaryAction reportID={reportID} />;
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE) {
        return (
            <ApprovePrimaryAction
                reportID={reportID}
                chatReportID={chatReportID}
            />
        );
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY) {
        return (
            <PayPrimaryAction
                reportID={reportID}
                chatReportID={chatReportID}
            />
        );
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING) {
        return (
            <ExportPrimaryAction
                reportID={reportID}
                onExportModalOpen={onExportModalOpen}
            />
        );
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD) {
        return (
            <RemoveHoldPrimaryAction
                reportID={reportID}
                chatReportID={chatReportID}
            />
        );
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH) {
        return (
            <MarkAsCashPrimaryAction
                reportID={reportID}
                chatReportID={chatReportID}
            />
        );
    }

    if (primaryAction === CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED) {
        return (
            <MarkAsResolvedPrimaryAction
                reportID={reportID}
                chatReportID={chatReportID}
            />
        );
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES) {
        return (
            <ReviewDuplicatesPrimaryAction
                reportID={reportID}
                chatReportID={chatReportID}
            />
        );
    }
}

MoneyReportHeaderPrimaryAction.displayName = 'MoneyReportHeaderPrimaryAction';

export default MoneyReportHeaderPrimaryAction;
