import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import ReportPickerModal from '@components/ReportPicker/ReportPickerModal';

import useOnyx from '@hooks/useOnyx';

import {shouldUseTransactionDraft} from '@libs/IOUUtils';

import useReportPickerActions from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportPickerActions';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type ReportFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked report is written to */
    transactionID: string;
};

type ReportFieldDropdownListProps = ReportFieldDropdownProps & {
    /** Called once the container has finished closing, when the list can go */
    onModalHide: () => void;
};

/** The report list and the hooks that drive it, which pick through the same hook the full-page selector uses so both leave the expense in the same state */
function ReportFieldDropdownList({transactionID, onClose, onModalHide, ...popoverProps}: ReportFieldDropdownListProps) {
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
            onModalHide={onModalHide}
            shouldFitContentHeight
            shouldShowHeader
        />
    );
}

/**
 * The report list, in the container anchored to the expense form's report row. `ExpenseFieldDropdown` keeps a dropdown
 * mounted once it has been opened, so the list is mounted here only while its container is open or still closing: its
 * hooks subscribe to whole report, policy and transaction collections and fetch outstanding reports again on every
 * reconnect, which the form should not pay for while the list is hidden.
 */
function ReportFieldDropdown(props: ReportFieldDropdownProps) {
    const [isListMounted, setIsListMounted] = useState(props.isVisible);
    if (props.isVisible && !isListMounted) {
        setIsListMounted(true);
    }
    if (!isListMounted) {
        return null;
    }

    return (
        <ReportFieldDropdownList
            {...props}
            onModalHide={() => {
                // The row may have opened the container again before the previous close finished.
                if (props.isVisible) {
                    return;
                }
                setIsListMounted(false);
            }}
        />
    );
}

export default ReportFieldDropdown;
