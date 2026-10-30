import {fireEvent, render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import CategoryFieldDropdown from '@components/MoneyRequestConfirmationList/sections/CategoryFieldDropdown';
import type PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type TextComponent from '@components/Text';

import Navigation from '@libs/Navigation/Navigation';
import type TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

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

jest.mock('@hooks/useUpdateTransactionCategory', () => () => ({updateCategory: jest.fn()}));

jest.mock('@components/CategoryPicker/CategoryPickerModal', () => {
    const {default: Pressable} = jest.requireActual<{default: typeof PressableWithoutFeedback}>('@components/Pressable/PressableWithoutFeedback');
    const {default: Text} = jest.requireActual<{default: typeof TextComponent}>('@components/Text');
    return ({onAddCategory}: {onAddCategory?: () => void}) =>
        onAddCategory ? (
            <Pressable
                accessibilityLabel="addCategory"
                onPress={onAddCategory}
            >
                <Text>addCategory</Text>
            </Pressable>
        ) : null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';

const renderDropdown = (onClose: () => void, canAddCategory = true) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <CategoryFieldDropdown
                isVisible
                onClose={onClose}
                anchorPosition={{horizontal: 0, vertical: 0}}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                shouldMeasureAnchorPositionFromTop
                shouldSwitchPositionIfOverflow={false}
                popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
                popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
                transactionID={TRANSACTION_ID}
                policy={createRandomPolicy(1)}
                selectedCategory=""
                canAddCategory={canAddCategory}
            />
        </ConfirmationFieldsProvider>,
    );

describe('CategoryFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockCallOrder.length = 0;
        mockRunPendingTransition = undefined;
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('closes the pop-over before opening the add-category page', async () => {
        // Given an admin with the category pop-over open
        const onClose = jest.fn(() => mockCallOrder.push('close'));
        renderDropdown(onClose);
        await waitForBatchedUpdatesWithAct();

        // When they press the add button
        fireEvent.press(screen.getByLabelText('addCategory'));

        // Then the pop-over closes and nothing navigates until its close transition ends, since navigating while the
        // modal is still up gets dropped on iOS
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();

        mockRunPendingTransition?.();

        // And only then the add-category page opens, carrying the expense it belongs to
        expect(mockCallOrder).toEqual(['close', 'navigate']);
        const route = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0);
        expect(route).toContain('add-category');
        expect(route).toContain(`transactionID=${TRANSACTION_ID}`);
        expect(route).toContain(`reportID=${REPORT_ID}`);
    });

    it('offers no add button when the user cannot add a category', async () => {
        // Given a user who cannot add categories to the workspace
        // When the pop-over opens
        renderDropdown(jest.fn(), false);
        await waitForBatchedUpdatesWithAct();

        // Then it has no add button, so the user can only pick from the existing categories
        expect(screen.queryByLabelText('addCategory')).toBeNull();
    });
});
