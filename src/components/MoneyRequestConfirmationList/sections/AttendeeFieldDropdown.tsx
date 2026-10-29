import AttendeePickerModal from '@components/AttendeePicker/AttendeePickerModal';

import useOnyx from '@hooks/useOnyx';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';

import {setMoneyRequestAttendees} from '@libs/actions/IOU/MoneyRequest';
import {getOriginalAttendees} from '@libs/TransactionUtils';

import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import {deepEqual} from 'fast-equals';
import React, {useState} from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type AttendeeFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the draft expense the attendees are written to */
    transactionID: string;

    /** Type of the expense, which the list's empty state is worded for */
    iouType: IOUType;
};

/**
 * The attendee list, in the container anchored to the expense form's attendees row. Mounted only once the row is
 * opened. The selection is kept here while the user picks and written to the draft when applied, as the full page
 * writes it on save; dismissing the container drops the unapplied selection.
 */
function AttendeeFieldDropdown({transactionID, iouType, onClose, ...popoverProps}: AttendeeFieldDropdownProps) {
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(draftTransaction);
    const originalAttendees = getOriginalAttendees(draftTransaction, reportOwnerAsAttendee);

    // The list starts from the draft's attendees, the creator when it has none, as the full page does.
    const [attendees, setAttendees] = useState<Attendee[]>(originalAttendees);

    const applyAttendees = () => {
        // An expense needs at least one attendee, which the full page enforces at save. The list shows the same error, and
        // the Apply button is disabled, so this only guards the Enter key.
        if (attendees.length === 0) {
            return;
        }
        if (!deepEqual(originalAttendees, attendees)) {
            setMoneyRequestAttendees(transactionID, attendees, true);
        }
        onClose();
    };

    return (
        <AttendeePickerModal
            {...popoverProps}
            onClose={onClose}
            shouldShowHeader
            attendees={attendees}
            onAttendeesChanged={setAttendees}
            onApply={applyAttendees}
            iouType={iouType}
        />
    );
}

export default AttendeeFieldDropdown;
