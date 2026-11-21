import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchQueryContext} from '@components/Search/SearchContext';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {SearchQueryContextValue} from '@components/Search/types';

import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';

import {editTransactionCategoryInline} from '@libs/actions/TransactionInlineEdit';
import type * as TransactionInlineEditActions from '@libs/actions/TransactionInlineEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyCategories, Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/TransactionInlineEdit', () => ({
    ...jest.requireActual<typeof TransactionInlineEditActions>('@libs/actions/TransactionInlineEdit'),
    editTransactionCategoryInline: jest.fn(),
}));

const mockEditTransactionCategoryInline = jest.mocked(editTransactionCategoryInline);

const POLICY_ID = 'policy1';
const TRANSACTION_ID = 'transaction1';
const ACCOUNT_ID = 1;

const policy: Policy = {
    id: POLICY_ID,
    name: 'Workspace',
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.TEAM,
    owner: 'owner@test.com',
    outputCurrency: 'USD',
    areCategoriesEnabled: true,
};

const transaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
    amount: 1000,
    currency: 'USD',
    merchant: 'Merchant',
    created: '2026-01-01',
};

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

const SEARCH_HASH = 12345;
const SNAPSHOT_ONLY_ACCOUNT_ID = 2;
const livePersonalDetails: PersonalDetailsList = {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: 'user@test.com'}};
const snapshotPersonalDetails: SearchResults['data']['personalDetailsList'] = {[SNAPSHOT_ONLY_ACCOUNT_ID]: {accountID: SNAPSHOT_ONLY_ACCOUNT_ID, login: 'snapshot-only@test.com'}};

const searchWrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <SearchQueryContext.Provider value={createMock<SearchQueryContextValue>({currentSearchHash: SEARCH_HASH})}>
            <SearchScopeProvider>{children}</SearchScopeProvider>
        </SearchQueryContext.Provider>
    </OnyxListItemProvider>
);

function renderInlineEditHook(hookWrapper = wrapper) {
    let renderCount = 0;
    const hook = renderHook(
        () => {
            renderCount++;
            return useTransactionInlineEdit({transactionID: TRANSACTION_ID});
        },
        {wrapper: hookWrapper},
    );
    return {...hook, getRenderCount: () => renderCount};
}

describe('useTransactionInlineEdit', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Promise.all([
            Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'user@test.com'}),
            Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID),
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy),
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Food: {name: 'Food', enabled: true}}),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction),
        ]);
        await waitForBatchedUpdates();
        mockEditTransactionCategoryInline.mockClear();
    });

    it('should pass data written after mount to the edit action', async () => {
        // Given a mounted row and recently used categories and a session that change only after it rendered
        const {result} = renderInlineEditHook();
        await waitForBatchedUpdates();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${POLICY_ID}`, ['Travel']);
            await Onyx.merge(ONYXKEYS.SESSION, {email: 'renamed@test.com'});
        });

        // When the user saves an inline category edit
        await act(async () => {
            result.current.onEditCategory('Food');
            await waitForBatchedUpdates();
        });

        // Then the edit action gets the latest stored values, because the handler reads them when the edit is saved
        expect(mockEditTransactionCategoryInline).toHaveBeenCalledTimes(1);
        expect(mockEditTransactionCategoryInline).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionID: TRANSACTION_ID,
                policyRecentlyUsedCategories: ['Travel'],
                currentUserAccountID: ACCOUNT_ID,
                currentUserEmail: 'renamed@test.com',
            }),
            'Food',
        );
    });

    it('should validate a newly created category with the categories supplied by the picker', async () => {
        // Given a mounted row whose subscribed categories do not include the category being created
        const {result} = renderInlineEditHook();
        await waitForBatchedUpdates();
        const updatedPolicyCategories: PolicyCategories = {
            Food: {name: 'Food', enabled: true},
            Training: {name: 'Training', enabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
        };

        // When category creation applies its optimistic collection before the row has rendered it
        await act(async () => {
            await result.current.onEditCategory('Training', updatedPolicyCategories);
        });

        // Then the inline edit action validates against the new collection rather than the stale subscribed categories
        expect(mockEditTransactionCategoryInline).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRANSACTION_ID, policyCategories: updatedPolicyCategories}), 'Training');
    });

    it('should keep the subscribed categories when selecting an existing category', async () => {
        // Given a row with the workspace's existing categories
        const {result} = renderInlineEditHook();
        await waitForBatchedUpdates();

        // When the user selects a category without creating one
        await act(async () => {
            await result.current.onEditCategory('Food');
        });

        // Then ordinary selection still uses the subscribed categories
        expect(mockEditTransactionCategoryInline).toHaveBeenCalledWith(expect.objectContaining({policyCategories: {Food: {name: 'Food', enabled: true}}}), 'Food');
    });

    it('should not re-run when data only the edit actions read changes', async () => {
        // Given a mounted row
        const {getRenderCount} = renderInlineEditHook();
        await waitForBatchedUpdates();
        const rendersBeforeWrites = getRenderCount();

        // When data that only the edit actions read is written, including a rule of another workspace
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`, {Tag: ['Project']});
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}unrelatedReport`, {private_isArchived: ''});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}otherRule`, {scope: CONST.RULES.SCOPE.POLICY, scopeID: 'otherPolicy'});
        });

        // Then the hook doesn't render again, so these writes don't reach any row
        expect(getRenderCount()).toBe(rendersBeforeWrites);
    });

    it('should pass the live personal details to the edit action outside Search without re-rendering when they change', async () => {
        // Given a mounted row outside Search
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, livePersonalDetails);
        const {result, getRenderCount} = renderInlineEditHook();
        await waitForBatchedUpdates();
        const rendersBeforeWrite = getRenderCount();

        // When another user is added to the personal details and the user then saves an inline category edit
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, snapshotPersonalDetails);
        });
        await act(async () => {
            await result.current.onEditCategory('Food');
        });

        // Then the row did not render again, and the edit action still gets the new user, because the list is read when the edit is saved
        expect(getRenderCount()).toBe(rendersBeforeWrite);
        expect(mockEditTransactionCategoryInline).toHaveBeenCalledWith(expect.objectContaining({personalDetailsList: {...livePersonalDetails, ...snapshotPersonalDetails}}), 'Food');
    });

    it('should pass the personal details of the search snapshot to the edit action on Search', async () => {
        // Given a Search row whose snapshot holds a user that the live personal details don't have
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, livePersonalDetails);
        await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${SEARCH_HASH}`, {
            data: createMock<SearchResults['data']>({personalDetailsList: snapshotPersonalDetails}),
            search: createMock<SearchResults['search']>({hash: SEARCH_HASH}),
        });
        const {result} = renderInlineEditHook(searchWrapper);
        await waitForBatchedUpdates();

        // When the user saves an inline category edit
        await act(async () => {
            await result.current.onEditCategory('Food');
        });

        // Then the edit action gets the snapshot's users, because a report owner can be present there and missing from the live list
        expect(mockEditTransactionCategoryInline).toHaveBeenCalledWith(expect.objectContaining({personalDetailsList: snapshotPersonalDetails}), 'Food');
    });
});
