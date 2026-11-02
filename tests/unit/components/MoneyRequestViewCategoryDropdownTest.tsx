import {fireEvent, render, screen} from '@testing-library/react-native';

import type CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import MoneyRequestViewCategoryDropdown from '@components/ReportActionItem/MoneyRequestViewCategoryDropdown';
import type {MoneyRequestViewCategoryDropdownProps} from '@components/ReportActionItem/MoneyRequestViewCategoryDropdown';
import type TextComponent from '@components/Text';

import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import Navigation from '@libs/Navigation/Navigation';
import type TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentProps} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockCallOrder: string[] = [];

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(() => mockCallOrder.push('navigate')),
}));

// Holds the post-transition work until the test runs it, standing in for the pop-over finishing its close.
let mockRunPendingTransition: Parameters<typeof TransitionTracker.runAfterTransitions>[0]['callback'] | undefined;
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: Parameters<typeof TransitionTracker.runAfterTransitions>[0]): ReturnType<typeof TransitionTracker.runAfterTransitions> => {
        mockRunPendingTransition = callback;
        return {cancel: () => {}};
    },
}));

// The write itself is covered by the hook's own tests; here only what the dropdown asks it to write matters.
const mockUpdateCategory = jest.fn();
jest.mock('@hooks/useUpdateTransactionCategory', () => jest.fn(() => ({updateCategory: mockUpdateCategory, isDraftUpdate: false})));

// The list is covered by the CategoryPickerModal tests; here only what the dropdown hands it matters.
type CategoryPickerModalProps = ComponentProps<typeof CategoryPickerModal>;
let mockPickerProps: CategoryPickerModalProps | undefined;
jest.mock('@components/CategoryPicker/CategoryPickerModal', () => {
    const {default: Pressable} = jest.requireActual<{default: typeof PressableWithoutFeedback}>('@components/Pressable/PressableWithoutFeedback');
    const {default: Text} = jest.requireActual<{default: typeof TextComponent}>('@components/Text');
    return (props: CategoryPickerModalProps) => {
        mockPickerProps = props;
        return props.onAddCategory ? (
            <Pressable
                accessibilityLabel="addCategory"
                onPress={props.onAddCategory}
            >
                <Text>addCategory</Text>
            </Pressable>
        ) : null;
    };
});

const TRANSACTION_ID = 'txn1';
const THREAD_REPORT_ID = 'thread1';
const policy = createRandomPolicy(1);
const transaction = {...createRandomTransaction(1), transactionID: TRANSACTION_ID, category: 'Travel'};
const transactionThreadReport = {...createRandomReport(1, undefined), reportID: THREAD_REPORT_ID};

const renderDropdown = (props: Partial<MoneyRequestViewCategoryDropdownProps> = {}) =>
    render(
        <MoneyRequestViewCategoryDropdown
            isVisible
            onClose={jest.fn()}
            anchorPosition={{horizontal: 0, vertical: 0}}
            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
            shouldMeasureAnchorPositionFromTop
            shouldSwitchPositionIfOverflow={false}
            popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
            popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
            transaction={transaction}
            transactionThreadReport={transactionThreadReport}
            policy={policy}
            selectedCategory="Travel"
            iouType={CONST.IOU.TYPE.SUBMIT}
            canAddCategory={false}
            {...props}
        />,
    );

describe('MoneyRequestViewCategoryDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockCallOrder.length = 0;
        mockRunPendingTransition = undefined;
        mockPickerProps = undefined;
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('saves a pick straight to the expense, as the full page does', async () => {
        // Given the category list open on a saved expense's detail view
        renderDropdown();
        await waitForBatchedUpdatesWithAct();

        // Then it edits the saved expense against its own thread, not a draft, and marks the expense's category
        expect(jest.mocked(useUpdateTransactionCategory)).toHaveBeenCalledWith(
            expect.objectContaining({transactionID: TRANSACTION_ID, transaction, report: transactionThreadReport, policy, isEditing: true, isEditingSplit: false}),
        );
        expect(mockPickerProps?.selectedCategory).toBe('Travel');
        expect(mockPickerProps?.policyID).toBe(policy.id);

        // When the user picks another category
        mockPickerProps?.onSelected?.({keyForList: 'Meals', searchText: 'Meals', text: 'Meals'});

        // Then that category is written to the expense
        expect(mockUpdateCategory).toHaveBeenCalledWith('Meals');
    });

    it('clears the category when the picked one is tapped again', async () => {
        // Given the category list open on an expense that has a category
        renderDropdown();
        await waitForBatchedUpdatesWithAct();

        // When the list hands back the empty item it sends for a tap on the selected category
        mockPickerProps?.onSelected?.({keyForList: '', searchText: ''});

        // Then the expense's category is cleared, as tapping it again does on the full page
        expect(mockUpdateCategory).toHaveBeenCalledWith('');
    });

    it('closes the pop-over before opening the add-category page for this expense', async () => {
        // Given an admin with the category list open on the detail view
        const onClose = jest.fn(() => mockCallOrder.push('close'));
        renderDropdown({onClose, canAddCategory: true});
        await waitForBatchedUpdatesWithAct();

        // When they press the add button
        fireEvent.press(screen.getByLabelText('addCategory'));

        // Then the pop-over closes and nothing navigates until its close transition ends, since navigating while the
        // modal is still up gets dropped on iOS
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();

        mockRunPendingTransition?.();

        // And only then the add-category page opens, editing this saved expense through its thread
        expect(mockCallOrder).toEqual(['close', 'navigate']);
        const route = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0);
        expect(route).toContain('add-category');
        expect(route).toContain(`action=${CONST.IOU.ACTION.EDIT}`);
        expect(route).toContain(`transactionID=${TRANSACTION_ID}`);
        expect(route).toContain(`reportID=${THREAD_REPORT_ID}`);
    });

    it('offers no add button when the user cannot add a category', async () => {
        // Given a user who cannot add categories to the workspace
        // When the list opens
        renderDropdown({canAddCategory: false});
        await waitForBatchedUpdatesWithAct();

        // Then it has no add button, so the user can only pick from the existing categories
        expect(screen.queryByLabelText('addCategory')).toBeNull();
        expect(mockPickerProps?.onAddCategory).toBeUndefined();
    });
});
