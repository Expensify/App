import AttendeePickerModal from '@components/AttendeePicker/AttendeePickerModal';

import useOnyx from '@hooks/useOnyx';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';

import {setMoneyRequestAttendees} from '@libs/actions/IOU/MoneyRequest';
import {getOriginalAttendees} from '@libs/TransactionUtils';

import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

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
 * opened. Each toggle is written to the draft at once, so the row's pills follow while the list stays open, where the
 * full page writes once on save.
 */
function AttendeeFieldDropdown({transactionID, iouType, onClose, ...popoverProps}: AttendeeFieldDropdownProps) {
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(draftTransaction);

    // Until the user toggles someone the list starts from the draft's attendees, the creator when it has none, as the full
    // page does. From the first toggle it keeps its own selection, which need not be rebuilt from what it just wrote.
    const [pickedAttendees, setPickedAttendees] = useState<Attendee[]>();
    const attendees = pickedAttendees ?? getOriginalAttendees(draftTransaction, reportOwnerAsAttendee);

    const updateAttendees = (newAttendees: Attendee[]) => {
        setPickedAttendees(newAttendees);
        // An expense needs at least one attendee, which the full page enforces at save. Here the list shows the same error
        // and the draft keeps its last attendees until one is picked again.
        if (newAttendees.length === 0) {
            return;
        }
        setMoneyRequestAttendees(transactionID, newAttendees, true);
    };

    return (
        <AttendeePickerModal
            {...popoverProps}
            onClose={onClose}
            shouldShowHeader
            attendees={attendees}
            onAttendeesChanged={updateAttendees}
            iouType={iouType}
        />
    );
}

export default AttendeeFieldDropdown;
