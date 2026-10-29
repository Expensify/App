import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import useLocalize from '@hooks/useLocalize';

import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';

import React from 'react';

/**
 * The list builds its options once the screen it is on has finished its transition, which it reads off the screen
 * wrapper. A container anchored to a row has no screen transition, so the list is told the screen has settled, and that
 * no safe area padding was applied around it, which is what it would read outside any screen wrapper.
 */
const SETTLED_SCREEN_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false};

type AttendeePickerModalProps = {
    /** The expense's attendees when the list opens. The list keeps its own selection from there */
    attendees: Attendee[];

    /** Called with the whole selection each time an attendee is toggled */
    onAttendeesChanged: (attendees: Attendee[]) => void;

    /** Type of the expense, which the list's empty state is worded for */
    iouType: IOUType;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'children'>;

/**
 * The attendee list in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a narrow one.
 * Unlike the single-select lists, toggling an attendee hands the new selection to `onAttendeesChanged` and keeps the
 * container open, so the user can keep picking; it closes when dismissed, or when the user confirms the selection.
 */
function AttendeePickerModal({attendees, onAttendeesChanged, iouType, onClose, ...popoverProps}: AttendeePickerModalProps) {
    const {translate} = useLocalize();

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            onClose={onClose}
            // The list always has a search input and, between recents and contacts, more rows than the container shows at
            // once, so the container opens at its full height rather than fitting a count.
            optionCount={CONST.STANDARD_LIST_ITEM_LIMIT}
            isSearchable
            title={translate('iou.attendees')}
            backButtonSentryLabel={CONST.SENTRY_LABEL.ATTENDEE_PICKER_MODAL.BACK_BUTTON}
        >
            <ScreenWrapperStatusContext.Provider value={SETTLED_SCREEN_STATUS}>
                <MoneyRequestAttendeeSelector
                    attendees={attendees}
                    onAttendeesAdded={onAttendeesChanged}
                    // Each toggle is already saved, so confirming only closes the container.
                    onFinish={onClose}
                    iouType={iouType}
                    shouldShowSaveButton={false}
                />
            </ScreenWrapperStatusContext.Provider>
        </AnchoredSelectionListPopover>
    );
}

export default AttendeePickerModal;
export type {AttendeePickerModalProps};
