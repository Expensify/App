import {act, render, screen} from '@testing-library/react-native';

import type {AttendeePickerModalProps} from '@components/AttendeePicker/AttendeePickerModal';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type TagPickerModal from '@components/TagPicker/TagPickerModal';
import type {TaxPickerModalProps} from '@components/TaxPicker/TaxPickerModal';

import SearchEditMultipleAttendeePills from '@pages/Search/SearchEditMultiple/SearchEditMultipleAttendeePills';
import SearchEditMultipleAttendeesDropdown from '@pages/Search/SearchEditMultiple/SearchEditMultipleAttendeesDropdown';
import SearchEditMultipleTagDropdown from '@pages/Search/SearchEditMultiple/SearchEditMultipleTagDropdown';
import SearchEditMultipleTaxDropdown from '@pages/Search/SearchEditMultiple/SearchEditMultipleTaxDropdown';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import type {ComponentProps} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The lists themselves are covered by their own tests; here only what each dropdown hands its list, and what a pick
// writes to the bulk edit draft, matter.
type TagPickerModalProps = ComponentProps<typeof TagPickerModal>;
let mockTagModalProps: TagPickerModalProps | undefined;
jest.mock('@components/TagPicker/TagPickerModal', () => (props: TagPickerModalProps) => {
    mockTagModalProps = props;
    return null;
});

let mockTaxModalProps: TaxPickerModalProps | undefined;
jest.mock('@components/TaxPicker/TaxPickerModal', () => (props: TaxPickerModalProps) => {
    mockTaxModalProps = props;
    return null;
});

let mockAttendeeModalProps: AttendeePickerModalProps | undefined;
jest.mock('@components/AttendeePicker/AttendeePickerModal', () => (props: AttendeePickerModalProps) => {
    mockAttendeeModalProps = props;
    return null;
});

const POLICY_ID = 'policy1';
const DRAFT_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}` as const;
const TAG_NAME = 'Engineering';
const TAX_CODE = 'id_TAX_RATE_1';
const TAG_LIST_INDEX = 0;

const policyTags: PolicyTagLists = {
    Department: {name: 'Department', required: false, orderWeight: 0, tags: {[TAG_NAME]: {name: TAG_NAME, enabled: true}}},
};

const alice: Attendee = {email: 'alice@test.com', displayName: 'Alice', avatarUrl: ''};
const bob: Attendee = {email: 'bob@test.com', displayName: 'Bob', avatarUrl: ''};

const getPopoverProps = (onClose: jest.Mock, isVisible = true): ExpenseFieldDropdownRenderProps => ({
    isVisible,
    onClose,
    anchorPosition: {horizontal: 0, vertical: 0},
    anchorAlignment: {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP},
    shouldMeasureAnchorPositionFromTop: true,
    shouldSwitchPositionIfOverflow: false,
    popoverWidth: CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
});

const setDraft = async (draftChanges: Partial<Transaction>) => {
    await Onyx.set(DRAFT_KEY, {transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID, ...draftChanges});
    await waitForBatchedUpdates();
};

describe('SearchEditMultiple dropdowns', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockTagModalProps = undefined;
        mockTaxModalProps = undefined;
        mockAttendeeModalProps = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('tag', () => {
        const renderTagDropdown = (transactionTag: string, recordedTagChanges: Record<string, string | null>) =>
            render(
                <SearchEditMultipleTagDropdown
                    {...getPopoverProps(jest.fn())}
                    policyID={POLICY_ID}
                    tagListIndex={TAG_LIST_INDEX}
                    transactionTag={transactionTag}
                    recordedTagChanges={recordedTagChanges}
                    policyTags={policyTags}
                    hasMultipleTagLists={false}
                />,
            );

        it('records a picked tag on the draft', async () => {
            // Given a workspace with one tag list and a draft with no tag picked yet
            await setDraft({});

            // When the tag list opens and a tag is picked
            renderTagDropdown('', {});
            act(() => mockTagModalProps?.onSelected?.(TAG_NAME));
            await waitForBatchedUpdates();

            // Then the draft shows the tag and records it as the change to save for that level
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.tag).toBe(TAG_NAME);
            expect(draft?.bulkEditTagChanges).toEqual({[TAG_LIST_INDEX]: TAG_NAME});
        });

        it('clears a tag picked in this session when it is tapped again', async () => {
            // Given a draft whose tag was picked earlier in this bulk edit
            await setDraft({tag: TAG_NAME, bulkEditTagChanges: {[TAG_LIST_INDEX]: TAG_NAME}});

            // When the tag list opens showing that tag as picked, and it is tapped again, which the list reports as an empty name
            renderTagDropdown(TAG_NAME, {[TAG_LIST_INDEX]: TAG_NAME});
            expect(mockTagModalProps?.selectedTag).toBe(TAG_NAME);
            act(() => mockTagModalProps?.onSelected?.(''));
            await waitForBatchedUpdates();

            // Then the row is empty again and the pending change for that level is dropped rather than saved as a clear
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.tag).toBe('');
            expect(draft?.bulkEditTagChanges?.[TAG_LIST_INDEX]).toBeUndefined();
        });
    });

    describe('tax rate', () => {
        const renderTaxDropdown = (currentTaxCode: string) =>
            render(
                <SearchEditMultipleTaxDropdown
                    {...getPopoverProps(jest.fn())}
                    policyID={POLICY_ID}
                    currentTaxCode={currentTaxCode}
                    selectedTaxRate={currentTaxCode ? 'Tax Rate 1' : ''}
                />,
            );

        it('records a picked tax rate on the draft', async () => {
            // Given a draft with no tax rate picked yet
            await setDraft({});

            // When the tax list opens and a rate is picked
            renderTaxDropdown('');
            act(() => mockTaxModalProps?.onSelected?.({code: TAX_CODE, text: 'Tax Rate 1', keyForList: TAX_CODE}));
            await waitForBatchedUpdates();

            // Then the draft holds that rate as the change to save
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.taxCode).toBe(TAX_CODE);
        });

        it('drops the pending tax rate when the picked rate is tapped again', async () => {
            // Given a draft whose tax rate was picked earlier in this bulk edit
            await setDraft({taxCode: TAX_CODE});

            // When the tax list opens and the picked rate is tapped again, which the list allows and reports as the same rate
            renderTaxDropdown(TAX_CODE);
            expect(mockTaxModalProps?.allowDeselect).toBe(true);
            act(() => mockTaxModalProps?.onSelected?.({code: TAX_CODE, text: 'Tax Rate 1', keyForList: TAX_CODE}));
            await waitForBatchedUpdates();

            // Then the draft no longer holds a tax rate, so saving leaves each expense's rate alone
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.taxCode).toBeUndefined();
        });
    });

    describe('attendees', () => {
        const getAttendeesDropdown = (onClose: jest.Mock, isVisible: boolean, draftAttendees: Attendee[]) => (
            <SearchEditMultipleAttendeesDropdown
                {...getPopoverProps(onClose, isVisible)}
                draftAttendees={draftAttendees}
            />
        );

        it('writes the selection to the draft and closes when it is applied', async () => {
            // Given a draft with one attendee applied earlier
            await setDraft({comment: {attendees: [alice]}});
            const onClose = jest.fn();

            // When the list opens, another attendee is added and the selection is applied
            render(getAttendeesDropdown(onClose, true, [alice]));
            act(() => mockAttendeeModalProps?.onAttendeesChanged([alice, bob]));
            act(() => mockAttendeeModalProps?.onApply());
            await waitForBatchedUpdates();

            // Then the draft holds both attendees and the container closes
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.comment?.attendees).toEqual([alice, bob]);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('keeps the applied selection when the list is dismissed without Apply', async () => {
            // Given a draft with one attendee applied earlier, and the list open
            await setDraft({comment: {attendees: [alice]}});
            const onClose = jest.fn();
            const {rerender} = render(getAttendeesDropdown(onClose, true, [alice]));

            // When another attendee is ticked, the list is dismissed without Apply, and then opened again
            act(() => mockAttendeeModalProps?.onAttendeesChanged([alice, bob]));
            expect(mockAttendeeModalProps?.attendees).toEqual([alice, bob]);
            rerender(getAttendeesDropdown(onClose, false, [alice]));
            rerender(getAttendeesDropdown(onClose, true, [alice]));
            await waitForBatchedUpdates();

            // Then the list starts from the applied selection again and the draft was never touched, as the row stays
            // mounted between opens and would otherwise bring the dismissed pick back
            expect(mockAttendeeModalProps?.attendees).toEqual([alice]);
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.comment?.attendees).toEqual([alice]);
        });

        it('does not apply an empty selection', async () => {
            // Given a draft with no attendees and the list open with nothing ticked
            await setDraft({});
            const onClose = jest.fn();
            render(getAttendeesDropdown(onClose, true, []));

            // When the selection is applied with the Enter key, which the disabled Apply button does not stop
            act(() => mockAttendeeModalProps?.onApply());
            await waitForBatchedUpdates();

            // Then nothing is written and the list stays open so its error can show
            const draft = await getOnyxValue(DRAFT_KEY);
            expect(draft?.comment?.attendees).toBeUndefined();
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('attendee pills', () => {
        it('shows the draft attendees as pills by name, as the expense form does', async () => {
            // Given two attendees the bulk edit draft holds
            // When the attendees row renders its value
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <SearchEditMultipleAttendeePills attendees={[bob, alice]} />
                </ComposeProviders>,
            );
            await waitForBatchedUpdates();

            // Then each attendee shows as a pill with their name, matching the attendees row on the expense form
            expect(screen.getByText('Alice')).toBeOnTheScreen();
            expect(screen.getByText('Bob')).toBeOnTheScreen();
        });
    });
});
