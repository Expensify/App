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

// The list is covered by the AttendeePickerModal tests; here only what the dropdown hands it, and what it does with each toggle, matter.
type MockModalProps = Pick<AttendeePickerModalProps, 'attendees' | 'onAttendeesChanged' | 'iouType' | 'shouldShowHeader'>;
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

const renderDropdown = () =>
    render(
        <OnyxListItemProvider>
            <AttendeeFieldDropdown
                isVisible
                onClose={jest.fn()}
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

    it('writes each toggle to the draft expense at once and keeps the list open', async () => {
        // Given a draft expense with the creator as its only attendee
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {attendees: [creator]},
        });
        await waitForBatchedUpdates();

        // When the attendees row's dropdown opens on the create form and the user adds a guest
        renderDropdown();
        await waitForBatchedUpdates();
        expect(mockModalProps?.attendees).toEqual([creator]);
        expect(mockModalProps?.iouType).toBe(CONST.IOU.TYPE.SUBMIT);
        expect(mockModalProps?.shouldShowHeader).toBe(true);
        act(() => mockModalProps?.onAttendeesChanged([creator, guest]));

        // Then the draft is saved with both at once, where the full page waits for its Save button, and the list is handed the
        // new selection rather than closed
        expect(setMoneyRequestAttendees).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestAttendees).toHaveBeenCalledWith(TRANSACTION_ID, [creator, guest], true);
        expect(mockModalProps?.attendees).toEqual([creator, guest]);
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

    it('leaves the draft alone when every attendee is deselected', async () => {
        // Given a draft expense with the creator as its attendee
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {attendees: [creator]},
        });
        await waitForBatchedUpdates();

        // When the user deselects the creator too, which the list flags as needing at least one attendee
        renderDropdown();
        await waitForBatchedUpdates();
        act(() => mockModalProps?.onAttendeesChanged([]));

        // Then nothing is written, since an expense needs an attendee and the full page never saves none; the list shows the empty selection
        expect(setMoneyRequestAttendees).not.toHaveBeenCalled();
        expect(mockModalProps?.attendees).toEqual([]);
    });
});
