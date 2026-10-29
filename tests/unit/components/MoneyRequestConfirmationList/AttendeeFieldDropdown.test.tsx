import {act, render} from '@testing-library/react-native';

import type {AttendeePickerModalProps} from '@components/AttendeePicker/AttendeePickerModal';
import AttendeeFieldDropdown from '@components/MoneyRequestConfirmationList/sections/AttendeeFieldDropdown';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {setMoneyRequestAttendees} from '@libs/actions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// Only the write matters here, so the action is stubbed to record what it is asked to save.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/IOU/MoneyRequest'),
    setMoneyRequestAttendees: jest.fn(),
}));

// The list is covered by the AttendeePickerModal tests; here only what the dropdown hands it, and what it does when the selection is applied, matter.
type MockModalProps = Pick<AttendeePickerModalProps, 'attendees' | 'onAttendeesChanged' | 'onApply' | 'onClose' | 'iouType' | 'shouldShowHeader'>;
let mockModalProps: MockModalProps | undefined;
jest.mock('@components/AttendeePicker/AttendeePickerModal', () => (props: MockModalProps) => {
    mockModalProps = props;
    return null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'report1';
const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'creator@example.com';
const creator: Attendee = {email: CURRENT_USER_LOGIN, displayName: 'Creator', avatarUrl: ''};
const guest: Attendee = {email: 'guest@example.com', displayName: 'Guest', avatarUrl: ''};

const renderDropdown = (onClose = jest.fn()) =>
    render(
        <OnyxListItemProvider>
            <AttendeeFieldDropdown
                isVisible
                onClose={onClose}
                anchorPosition={{horizontal: 0, vertical: 0}}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                shouldMeasureAnchorPositionFromTop
                shouldSwitchPositionIfOverflow={false}
                popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
                popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
                transactionID={TRANSACTION_ID}
                iouType={CONST.IOU.TYPE.SUBMIT}
            />
        </OnyxListItemProvider>,
    );

describe('AttendeeFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockModalProps = undefined;
        jest.mocked(setMoneyRequestAttendees).mockClear();
        await Onyx.clear();
        // The expense sits on a report the creator owns, which is where the list finds the creator to start from.
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_LOGIN},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Creator'}},
            [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}` as const]: {reportID: REPORT_ID, ownerAccountID: CURRENT_USER_ACCOUNT_ID},
        });
        await waitForBatchedUpdates();
    });

    it('writes the selection to the draft expense when applied, and closes', async () => {
        // Given a draft expense with the creator as its only attendee
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {attendees: [creator]},
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the attendees row's dropdown opens on the create form and the user adds a guest
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        expect(mockModalProps?.attendees).toEqual([creator]);
        expect(mockModalProps?.iouType).toBe(CONST.IOU.TYPE.SUBMIT);
        expect(mockModalProps?.shouldShowHeader).toBe(true);
        act(() => mockModalProps?.onAttendeesChanged([creator, guest]));

        // Then the list is handed the new selection and stays open, and nothing is written yet
        expect(mockModalProps?.attendees).toEqual([creator, guest]);
        expect(setMoneyRequestAttendees).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        // When the user applies the selection
        act(() => mockModalProps?.onApply());

        // Then the draft is saved with both, as the full page does on Save, and the list closes
        expect(setMoneyRequestAttendees).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestAttendees).toHaveBeenCalledWith(TRANSACTION_ID, [creator, guest], true);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes without writing when the applied selection is unchanged', async () => {
        // Given a draft expense with the creator as its only attendee
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {attendees: [creator]},
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the dropdown opens and the user applies the selection as it is
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.onApply());

        // Then the list closes and the draft is left alone, as the full page skips the write when nothing changed
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestAttendees).not.toHaveBeenCalled();
    });

    it('starts from the creator when the draft has no attendees yet', async () => {
        // Given a draft expense that has not had its attendees touched
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID, reportID: REPORT_ID});
        await waitForBatchedUpdates();

        // When the dropdown opens
        renderDropdown();
        await waitForBatchedUpdates();

        // Then the list starts with the creator selected, as the full page does, since the creator always attends
        expect(mockModalProps?.attendees).toEqual([expect.objectContaining({email: CURRENT_USER_LOGIN, displayName: 'Creator'})]);
    });

    it('stays open and leaves the draft alone when an empty selection is applied', async () => {
        // Given a draft expense with the creator as its attendee
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {attendees: [creator]},
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the user deselects the creator too, which the list flags as needing at least one attendee, and confirms with Enter
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.onAttendeesChanged([]));
        act(() => mockModalProps?.onApply());

        // Then nothing is written and the list stays open showing the empty selection, since an expense needs an attendee and
        // the full page never saves none
        expect(setMoneyRequestAttendees).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(mockModalProps?.attendees).toEqual([]);
    });
});
