import AttendeePickerModal from '@components/AttendeePicker/AttendeePickerModal';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';

import CONST from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';

import {deepEqual} from 'fast-equals';
import React, {useState} from 'react';

type SearchEditMultipleAttendeesDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Attendees the draft already holds when the list opens */
    draftAttendees: Attendee[];
};

/**
 * The attendee list, in the container anchored to the bulk edit form's attendees row. Mounted only once the row is
 * opened. The selection is kept here while the user picks and written to the draft when applied, as the full page
 * writes it on save; dismissing the container drops the unapplied selection.
 */
function SearchEditMultipleAttendeesDropdown({draftAttendees, isVisible, onClose, ...popoverProps}: SearchEditMultipleAttendeesDropdownProps) {
    // The row keeps this dropdown mounted once it has been opened, so the selection is dropped each time it opens or
    // closes: a selection dismissed without Apply must not come back on the next open.
    const [pickedAttendees, setPickedAttendees] = useState<Attendee[]>();
    const [wasVisible, setWasVisible] = useState(isVisible);
    if (wasVisible !== isVisible) {
        setWasVisible(isVisible);
        setPickedAttendees(undefined);
    }
    const attendees = pickedAttendees ?? draftAttendees;

    const applyAttendees = () => {
        // The list shows an error and disables Apply for an empty selection, so this only guards the Enter key.
        if (attendees.length === 0) {
            return;
        }
        if (!deepEqual(draftAttendees, attendees)) {
            updateBulkEditDraftTransaction({comment: {attendees}});
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
            iouType={CONST.IOU.TYPE.SUBMIT}
            // The list opens empty, as nothing is pending, so the error waits for an apply attempt as on the full page.
            shouldDeferEmptySelectionError
        />
    );
}

export default SearchEditMultipleAttendeesDropdown;
