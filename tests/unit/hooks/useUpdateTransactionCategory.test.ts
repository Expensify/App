import {renderHook} from '@testing-library/react-native';

import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import {setMoneyRequestCategory} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestCategory} from '@libs/actions/IOU/UpdateMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The three writes are the assertions: each branch must reach exactly one of them.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({setMoneyRequestCategory: jest.fn()}));
jest.mock('@libs/actions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));
jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({updateMoneyRequestCategory: jest.fn()}));

// Peripheral data the writes are handed. None of it decides which branch runs, and all of it needs providers
// this hook is never rendered inside here.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'me@example.com'})));
jest.mock('@hooks/useDelegateAccountID', () => jest.fn(() => undefined));
jest.mock('@hooks/useAllTransactionViolations', () => jest.fn(() => undefined));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [undefined])}));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: jest.fn(() => false), isBetaEnabledOrUnknown: jest.fn(() => false)})));

const TRANSACTION_ID = 'txn1';
const CATEGORY = 'Travel';

const transaction = createMock<OnyxTypes.Transaction>({transactionID: TRANSACTION_ID});
const report = createMock<OnyxTypes.Report>({reportID: 'report1', parentReportID: 'parent1'});
const policy = createMock<OnyxTypes.Policy>({id: 'policy1'});

type Params = Parameters<typeof useUpdateTransactionCategory>[0];

const baseParams: Params = {
    transactionID: TRANSACTION_ID,
    transaction,
    report,
    policy,
    policyCategories: undefined,
    isEditing: false,
    isEditingSplit: false,
};

const renderUpdater = (overrides: Partial<Params> = {}) => renderHook(() => useUpdateTransactionCategory({...baseParams, ...overrides}));

describe('useUpdateTransactionCategory', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('writes a split being edited to its own draft', () => {
        // Given a split expense being edited, whose source of truth is the split draft
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When a category is picked
        result.current.updateCategory(CATEGORY);

        // Then only the split draft is written, and the caller is told this is not a money request draft write
        expect(setDraftSplitTransaction).toHaveBeenCalledTimes(1);
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(TRANSACTION_ID, undefined, {category: CATEGORY}, expect.any(Function), expect.any(Function), policy);
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(setMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(false);
    });

    it('writes a saved expense through the money request update', () => {
        // Given an existing expense being edited, which has a report to write through
        const {result} = renderUpdater({isEditing: true});

        // When a category is picked
        result.current.updateCategory(CATEGORY);

        // Then it saves to the expense itself, carrying the report the violations are recomputed against
        expect(updateMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestCategory).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRANSACTION_ID, category: CATEGORY, transactionThreadReport: report}));
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
        expect(setMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(false);
    });

    it('writes an expense that is still being created to the money request draft', () => {
        // Given an expense that is not being edited at all, i.e. one still being filled in
        const {result} = renderUpdater();

        // When a category is picked
        result.current.updateCategory(CATEGORY);

        // Then it lands on the money request draft, and the caller is told so: the category step reads this to
        // decide whether it may carry on forward into confirmation.
        expect(setMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, CATEGORY, policy, expect.any(Function));
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(true);
    });

    it('falls back to the draft when an edit has no report to write through', () => {
        // Given an edit of a saved expense whose report has not resolved
        const {result} = renderUpdater({isEditing: true, report: undefined});

        // When a category is picked
        result.current.updateCategory(CATEGORY);

        // Then it writes the draft rather than calling the update with no report, which would have nothing to
        // recompute the expense's violations against
        expect(setMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(true);
    });

    it('falls back to the draft when there is no transaction yet', () => {
        // Given a split edit before the transaction has resolved
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true, transaction: undefined});

        // When a category is picked
        result.current.updateCategory(CATEGORY);

        // Then nothing is written to a transaction that isn't there
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(setMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(result.current.isDraftUpdate).toBe(true);
    });

    it('clears the category when an empty one is picked', () => {
        // Given an expense still being created
        const {result} = renderUpdater();

        // When the selected category is picked again, which the callers turn into an empty category
        result.current.updateCategory('');

        // Then the empty value is written through rather than dropped
        expect(setMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, '', policy, expect.any(Function));
    });
});
