import {act, render} from '@testing-library/react-native';

import CategoryPicker from '@components/CategoryPicker';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';

import useCreateAndApplyCategory from '@hooks/useCreateAndApplyCategory';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import {WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import getOnyxValue from '../../utils/getOnyxValue';
import {expectAPICommandToHaveBeenCalled, getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// The list itself is replaced so the test can tap a row by calling `onSelectRow` with the row the picker built.
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn()})));
// The hook sends GetPolicyCategories on mount, which the test does not need: the categories are already in Onyx.
jest.mock('@hooks/useLoadPolicyCategories', () => jest.fn(() => ({isLoadingPolicyCategories: false})));
// Returns [searchValue, debouncedSearchValue, setter], so a test can stand the picker up mid-search.
let mockSearchValue = '';
jest.mock('@hooks/useDebouncedState', () => jest.fn(() => [mockSearchValue, mockSearchValue, jest.fn()]));

const ACCOUNT_ID = 1;
const POLICY_ID = '1';
const TRANSACTION_ID = 'txn1';

const makeCategory = (name: string, enabled: boolean): PolicyCategories[string] => ({
    name,
    enabled,
    unencodedName: name,
    areCommentsRequired: false,
    externalID: '',
    origin: '',
    pendingAction: undefined,
});

/** Wires the picker to the same two hooks the expense category pickers use, for an expense that is still being created. */
function ExpenseCategoryPicker() {
    const policy = usePolicy(POLICY_ID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`);
    const {updateCategory} = useUpdateTransactionCategory({
        transactionID: TRANSACTION_ID,
        transaction: undefined,
        report: undefined,
        policy,
        policyCategories,
        isEditing: false,
        isEditingSplit: false,
    });
    const createAndApplyCategory = useCreateAndApplyCategory({policyID: POLICY_ID, updateCategory});

    return (
        <CategoryPicker
            policyID={POLICY_ID}
            onSubmit={jest.fn()}
            onCreateCategory={createAndApplyCategory}
        />
    );
}

const getVisibleRows = (): ListItem[] => jest.mocked(SelectionListWithSections).mock.lastCall?.[0].sections.flatMap((section) => section.data) ?? [];

const tapRow = (row: ListItem | undefined) => {
    const onSelectRow = jest.mocked(SelectionListWithSections).mock.lastCall?.[0].onSelectRow;
    if (!row || !onSelectRow) {
        throw new Error('Expected the picker to render a row to tap');
    }
    act(() => {
        onSelectRow(row);
    });
};

describe('useCreateAndApplyCategory', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        mockSearchValue = '';
        jest.mocked(SelectionListWithSections).mockClear();
        global.fetch = getGlobalFetchMock();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'admin@example.com'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {...createRandomPolicy(Number(POLICY_ID)), id: POLICY_ID, areCategoriesEnabled: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID});
    });

    it('turns a disabled category with the same name back on instead of creating it again', async () => {
        // Given a workspace where `Training` exists but is disabled, so the picker hides it and a search for it comes up empty
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {
            Meals: makeCategory('Meals', true),
            Training: makeCategory('Training', false),
        });
        mockSearchValue = 'Training';
        render(<ExpenseCategoryPicker />, {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // When the admin taps the create row
        const rows = getVisibleRows();
        expect(rows).toHaveLength(1);
        tapRow(rows.at(0));
        await waitForBatchedUpdatesWithAct();

        // Then the existing category is enabled rather than created, since creating it would fail as a duplicate
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED, 1);
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, 0);
        const policyCategories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`);
        expect(Object.keys(policyCategories ?? {})).toEqual(['Meals', 'Training']);
        expect(policyCategories?.Training?.enabled).toBe(true);

        // And the expense gets the category
        const transactionDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
        expect(transactionDraft?.category).toBe('Training');
    });

    it('creates a new enabled category from the trimmed search text and puts it on the expense', async () => {
        // Given a workspace with no `Training` category, and a search with stray spaces around the name
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Meals: makeCategory('Meals', true)});
        mockSearchValue = '  Training ';
        render(<ExpenseCategoryPicker />, {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // When the admin taps the create row
        tapRow(getVisibleRows().at(0));
        await waitForBatchedUpdatesWithAct();

        // Then the category is created once, under the name without the spaces, the same way the new-category page saves it
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, 1);
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED, 0);
        const policyCategories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`);
        expect(policyCategories?.Training?.enabled).toBe(true);

        // And the expense gets the category
        const transactionDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
        expect(transactionDraft?.category).toBe('Training');
    });
});
