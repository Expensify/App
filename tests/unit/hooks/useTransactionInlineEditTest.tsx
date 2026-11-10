import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';

import {editTransactionCategoryInline} from '@libs/actions/TransactionInlineEdit';
import type * as TransactionInlineEditActions from '@libs/actions/TransactionInlineEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

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

function renderInlineEditHook() {
    let renderCount = 0;
    const hook = renderHook(
        () => {
            renderCount++;
            return useTransactionInlineEdit({transactionID: TRANSACTION_ID});
        },
        {wrapper},
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
});
