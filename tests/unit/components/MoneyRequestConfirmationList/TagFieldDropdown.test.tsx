import {act, render} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import TagFieldDropdown from '@components/MoneyRequestConfirmationList/sections/TagFieldDropdown';

import {setMoneyRequestTag} from '@libs/actions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// Only the write matters here, so the action is stubbed to record what it is asked to save.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/IOU/MoneyRequest'),
    setMoneyRequestTag: jest.fn(),
}));

// The list itself is covered by the TagPickerModal tests; here only what the dropdown hands it, and what it does with a pick, matter.
type MockTagPickerModalProps = {selectedTag?: string; tagListIndex?: number; onSelected?: (tag: string) => void};
let mockTagPickerModalProps: MockTagPickerModalProps | undefined;
jest.mock('@components/TagPicker/TagPickerModal', () => (props: MockTagPickerModalProps) => {
    mockTagPickerModalProps = props;
    return null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';

const policy: Policy = {...createRandomPolicy(1), hasMultipleTagLists: true};

const policyTags: PolicyTagLists = {
    Department: {name: 'Department', orderWeight: 0, required: false, tags: {Engineering: {name: 'Engineering', enabled: true}}},
    Project: {
        name: 'Project',
        orderWeight: 1,
        required: false,
        tags: {Alpha: {name: 'Alpha', enabled: true}, Beta: {name: 'Beta', enabled: true}},
    },
};

describe('TagFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockTagPickerModalProps = undefined;
        jest.mocked(setMoneyRequestTag).mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('writes the pick into its own slot of the draft expense, keeping the tag in the other list', async () => {
        // Given a draft expense tagged `Engineering` in the first list and `Alpha` in the second, on a workspace with two independent lists
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, policyTags);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID, reportID: REPORT_ID, tag: 'Engineering:Alpha'});
        await waitForBatchedUpdates();

        // When the second list's dropdown opens on the create form and the user picks `Beta`
        render(
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <TagFieldDropdown
                    isVisible
                    onClose={jest.fn()}
                    anchorPosition={{horizontal: 0, vertical: 0}}
                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                    shouldMeasureAnchorPositionFromTop
                    shouldSwitchPositionIfOverflow={false}
                    popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
                    popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
                    transactionID={TRANSACTION_ID}
                    policy={policy}
                    tagListIndex={1}
                />
            </ConfirmationFieldsProvider>,
        );
        await waitForBatchedUpdates();
        expect(mockTagPickerModalProps?.tagListIndex).toBe(1);
        expect(mockTagPickerModalProps?.selectedTag).toBe('Alpha');
        act(() => mockTagPickerModalProps?.onSelected?.('Beta'));

        // Then the draft is saved with `Beta` in the second slot and `Engineering` untouched in the first, so a row never
        // writes over another list's tag
        expect(setMoneyRequestTag).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestTag).toHaveBeenCalledWith(TRANSACTION_ID, 'Engineering:Beta');
    });
});
