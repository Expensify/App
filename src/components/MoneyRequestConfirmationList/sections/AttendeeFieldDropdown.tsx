/**
 * The attendees row's dropdown on an expense form: the attendee list anchored to the row, holding the selection until
 * the user applies it to the expense.
 */
import AttendeePickerModal from '@components/AttendeePicker/AttendeePickerModal';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import useMoneyRequestUpdateParams from '@hooks/useMoneyRequestUpdateParams';
import useOnyx from '@hooks/useOnyx';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';
import useUpdateTransactionAttendees from '@hooks/useUpdateTransactionAttendees';

import {getOriginalAttendees} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import {deepEqual} from 'fast-equals';
import React, {useState} from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type AttendeeFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the attendees are written to */
    transactionID: string;

    /** Type of the expense, which the list's empty state is worded for */
    iouType: IOUType;
};

/**
 * The attendee list, in the container anchored to an expense form's attendees row. Mounted only once the row is
 * opened. The selection is kept here while the user picks and written to the expense when applied, through the same
 * hook the full page saves with; dismissing the container drops the unapplied selection.
 */
function AttendeeFieldDropdown({transactionID, iouType, isVisible, onClose, ...popoverProps}: AttendeeFieldDropdownProps) {
    const {action, reportID} = useConfirmationFields();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // A saved expense being edited is read as saved, and anything else from its draft, the same as the full page reads it.
    const [transaction] = useOnyx(`${isEditing ? ONYXKEYS.COLLECTION.TRANSACTION : ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const updateParams = useMoneyRequestUpdateParams(transactionID, report);
    const {updateAttendees} = useUpdateTransactionAttendees({transactionID, updateParams, isEditing});
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(transaction);
    const originalAttendees = getOriginalAttendees(transaction, reportOwnerAsAttendee);

    // The list starts from the expense's attendees, the creator when it has none, as the full page does. The row keeps this
    // dropdown mounted once it has been opened, so the selection is dropped each time it opens or closes: a selection
    // dismissed without Apply must not come back on the next open.
    const [pickedAttendees, setPickedAttendees] = useState<Attendee[]>();
    const [wasVisible, setWasVisible] = useState(isVisible);
    if (wasVisible !== isVisible) {
        setWasVisible(isVisible);
        setPickedAttendees(undefined);
    }
    const attendees = pickedAttendees ?? originalAttendees;

    const applyAttendees = () => {
        // An expense needs at least one attendee, which the full page enforces at save. The list shows the same error, and
        // the Apply button is disabled, so this only guards the Enter key.
        if (attendees.length === 0) {
            return;
        }
        if (!deepEqual(originalAttendees, attendees)) {
            updateAttendees(attendees);
        }
        onClose();
    };

    return (
        <AttendeePickerModal
            {...popoverProps}
            isVisible={isVisible}
            onClose={onClose}
            shouldShowHeader
            attendees={attendees}
            onAttendeesChanged={setPickedAttendees}
            onApply={applyAttendees}
            iouType={iouType}
        />
    );
}

export default AttendeeFieldDropdown;
