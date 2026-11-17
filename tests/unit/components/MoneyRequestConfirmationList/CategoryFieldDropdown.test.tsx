import {fireEvent, render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import CategoryFieldDropdown from '@components/MoneyRequestConfirmationList/sections/CategoryFieldDropdown';
import type PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type TextComponent from '@components/Text';

import type usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';

import Navigation from '@libs/Navigation/Navigation';
import type TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
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

// Records the expense each render hands the hook, which is what a pick writes from.
const mockUseUpdateTransactionCategory = jest.fn<{updateCategory: jest.Mock}, [unknown]>(() => ({updateCategory: jest.fn()}));
jest.mock('@hooks/useUpdateTransactionCategory', () => (params: unknown) => mockUseUpdateTransactionCategory(params));

const mockCreateAndApplyCategory = jest.fn();
jest.mock('@hooks/useCreateAndApplyCategory', () => () => mockCreateAndApplyCategory);

jest.mock('@hooks/usePolicyData', () => {
    const {default: useRealPolicy} = jest.requireActual<{default: typeof usePolicy}>('@hooks/usePolicy');
    return jest.fn((policyID?: string) => ({policy: useRealPolicy(policyID)}));
});

const mockSentryLabel = CONST.SENTRY_LABEL.TEST.LABEL;

jest.mock('@components/CategoryPicker/CategoryPickerModal', () => {
    const {default: Pressable} = jest.requireActual<{default: typeof PressableWithoutFeedback}>('@components/Pressable/PressableWithoutFeedback');
    const {default: Text} = jest.requireActual<{default: typeof TextComponent}>('@components/Text');
    return ({onAddCategory, onCreateCategory}: {onAddCategory?: () => void; onCreateCategory?: (categoryName: string) => void}) => (
        <>
            {!!onAddCategory && (
                <Pressable
                    accessibilityLabel="addCategory"
                    onPress={onAddCategory}
                    sentryLabel={mockSentryLabel}
                >
                    <Text>addCategory</Text>
                </Pressable>
            )}
            {!!onCreateCategory && (
                <Pressable
                    accessibilityLabel="createCategory"
                    onPress={() => onCreateCategory('Training')}
                    sentryLabel={mockSentryLabel}
                >
                    <Text>createCategory</Text>
                </Pressable>
            )}
        </>
    );
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';
const POLICY = createRandomPolicy(1);

const renderDropdown = (onClose: () => void, canAddCategory = true, action: IOUAction = CONST.IOU.ACTION.CREATE) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={action}
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
                policy={POLICY}
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY.id}`, POLICY);
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

    it('lets a user who can add a category create the one they searched for', async () => {
        // Given an admin with the category pop-over open
        renderDropdown(jest.fn());
        await waitForBatchedUpdatesWithAct();

        // When they tap the create row for a search that matched nothing
        fireEvent.press(screen.getByLabelText('createCategory'));

        // Then the searched-for name is created and applied to the expense
        expect(mockCreateAndApplyCategory).toHaveBeenCalledWith('Training');
    });

    it('offers no create row when the user cannot add a category', async () => {
        // Given a user who cannot add categories to the workspace
        // When the pop-over opens
        renderDropdown(jest.fn(), false);
        await waitForBatchedUpdatesWithAct();

        // Then a search with no results offers no create row, matching the missing add button
        expect(screen.queryByLabelText('createCategory')).toBeNull();

        // And the workspace's reports aren't scanned, since only the create row's re-enable path needs them
        expect(usePolicyData).toHaveBeenCalledWith(undefined);
    });

    it('hides only the create row for a draft-only workspace', async () => {
        // Given a workspace that exists only as a draft
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY.id}`, null);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${POLICY.id}`, {...POLICY, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When its category dropdown opens
        renderDropdown(jest.fn());
        await waitForBatchedUpdatesWithAct();

        // Then inline creation is hidden without changing the existing plus button
        expect(screen.queryByLabelText('createCategory')).toBeNull();
        expect(screen.getByLabelText('addCategory')).toBeTruthy();
        expect(mockCreateAndApplyCategory).not.toHaveBeenCalled();
    });

    it('keeps the create row for a real workspace created optimistically while offline', async () => {
        // Given a real workspace whose creation is still pending while offline
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY.id}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When the user creates the searched-for category
        renderDropdown(jest.fn());
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('createCategory'));

        // Then pending workspace creation does not block inline category creation
        expect(mockCreateAndApplyCategory).toHaveBeenCalledWith('Training');
        expect(screen.getByLabelText('addCategory')).toBeTruthy();
    });

    it.each([
        {action: CONST.IOU.ACTION.CREATE, form: 'create form', source: 'draft', expectedCategory: 'Meals'},
        {action: CONST.IOU.ACTION.EDIT, form: 'expense view', source: 'saved expense', expectedCategory: 'Travel'},
    ])('writes from the $source on the $form', async ({action, expectedCategory}) => {
        // Given a saved expense in `Travel`, and a draft with its ID in `Meals`, as a Submit flow the user backed out of leaves it
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID, reportID: REPORT_ID, category: 'Travel'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID, reportID: REPORT_ID, category: 'Meals'});
        await waitForBatchedUpdates();

        // When the category dropdown opens
        renderDropdown(jest.fn(), true, action);
        await waitForBatchedUpdatesWithAct();

        // Then a pick is written from the expense this form edits: the draft while creating, the saved copy once saved
        expect(mockUseUpdateTransactionCategory).toHaveBeenLastCalledWith(expect.objectContaining({transaction: expect.objectContaining({category: expectedCategory})}));
    });
});
