import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import ReportPickerModal from '@components/ReportPicker/ReportPickerModal';

import useOnyx from '@hooks/useOnyx';

import {shouldUseTransactionDraft} from '@libs/IOUUtils';

import useReportPickerActions from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportPickerActions';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type ReportFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked report is written to */
    transactionID: string;
};

/**
 * The report list, in the container anchored to the expense form's report row. Mounted only once the row is opened,
 * and picks through the same hook the full-page selector uses so both leave the expense in the same state.
 */
function ReportFieldDropdown({transactionID, onClose, ...popoverProps}: ReportFieldDropdownProps) {
    const {reportID, action, iouType} = useConfirmationFields();

    // An expense being created, or moved from a tracked expense, lives in its draft until it is saved.
    const transactionCollection = shouldUseTransactionDraft(action) ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION;
    const [transaction] = useOnyx(`${transactionCollection}${transactionID}`);

    const {listProps} = useReportPickerActions({
        transaction,
        transactionID,
        action,
        iouType,
        reportIDFromRoute: reportID,
        goBack: onClose,
        onNavigateAway: onClose,
        // The container has no screen transition to wait for, and the row should show the new report as soon as it closes.
        shouldWriteAfterTransition: false,
    });

    return (
        <ReportPickerModal
            {...popoverProps}
            {...listProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
        />
    );
}

export default ReportFieldDropdown;
