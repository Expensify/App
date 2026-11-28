import {act, renderHook} from '@testing-library/react-native';

import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import {setMoneyRequestCategory} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestCategory} from '@libs/actions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn(() => 'Translated category');

// The three writes are the assertions: each branch must reach exactly one of them.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({setMoneyRequestCategory: jest.fn()}));
jest.mock('@libs/actions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));
jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({updateMoneyRequestCategory: jest.fn()}));

// Peripheral data the writes are handed. None of it decides which branch runs.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'me@example.com'})));
jest.mock('@hooks/useDelegateAccountID', () => jest.fn(() => undefined));
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate}));
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

    it('seeds the split draft from the saved transaction when the split draft does not exist yet', async () => {
        // Given a split expense being edited that has no split draft yet, so the saved transaction is the base
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When a category is picked
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then the split draft is seeded from the transaction, and the caller is told this is not a money request draft write
        expect(setDraftSplitTransaction).toHaveBeenCalledTimes(1);
        // The rules collection goes along, since a split draft has to resolve the category's tax rate itself
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(
            mockTranslate,
            TRANSACTION_ID,
            transaction,
            {category: CATEGORY},
            expect.any(Function),
            expect.any(Function),
            policy,
            undefined,
            undefined,
            {},
        );
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(setMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(false);
    });

    it('uses an existing split draft as the base when there is one', async () => {
        // Given a split expense being edited that already has a split draft
        const splitDraft = createMock<OnyxTypes.Transaction>({transactionID: TRANSACTION_ID, category: 'Existing'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${TRANSACTION_ID}`, splitDraft);
        await waitForBatchedUpdates();
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When a category is picked
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then the existing split draft is the base, so its other fields are preserved
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(
            mockTranslate,
            TRANSACTION_ID,
            splitDraft,
            {category: CATEGORY},
            expect.any(Function),
            expect.any(Function),
            policy,
            undefined,
            undefined,
            {},
        );
    });

    it('writes a saved expense through the money request update', async () => {
        // Given an existing expense being edited, which has a report to write through
        const {result} = renderUpdater({isEditing: true});

        // When a category is picked
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then it saves to the expense itself, carrying the report the violations are recomputed against
        expect(updateMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestCategory).toHaveBeenCalledWith(
            expect.objectContaining({translate: mockTranslate, transactionID: TRANSACTION_ID, category: CATEGORY, transactionThreadReport: report}),
        );
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
        expect(setMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(false);
    });

    it('recomputes violations against categories passed with the write', async () => {
        // Given an existing expense being edited, whose hook still holds the categories from before a new one was created
        const staleCategories = createMock<OnyxTypes.PolicyCategories>({Meals: {name: 'Meals', enabled: true}});
        const updatedCategories = createMock<OnyxTypes.PolicyCategories>({Meals: {name: 'Meals', enabled: true}, [CATEGORY]: {name: CATEGORY, enabled: true}});
        const {result} = renderUpdater({isEditing: true, policyCategories: staleCategories});

        // When the just-created category is written along with the categories that include it
        await act(async () => {
            await result.current.updateCategory(CATEGORY, updatedCategories);
        });

        // Then the update uses those categories, so the new category isn't flagged as out of policy
        expect(updateMoneyRequestCategory).toHaveBeenCalledWith(expect.objectContaining({category: CATEGORY, policyCategories: updatedCategories}));
    });

    it('recomputes violations against the hook categories when none are passed with the write', async () => {
        // Given an existing expense being edited
        const policyCategories = createMock<OnyxTypes.PolicyCategories>({[CATEGORY]: {name: CATEGORY, enabled: true}});
        const {result} = renderUpdater({isEditing: true, policyCategories});

        // When an existing category is picked
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then the update uses the categories the hook was given
        expect(updateMoneyRequestCategory).toHaveBeenCalledWith(expect.objectContaining({policyCategories}));
    });

    it('writes an expense that is still being created to the money request draft', async () => {
        // Given an expense that is not being edited at all, i.e. one still being filled in
        const {result} = renderUpdater();

        // When a category is picked, without waiting for the update to finish
        act(() => {
            result.current.updateCategory(CATEGORY);
        });

        // Then it lands on the money request draft before the update returns, so it is queued before the caller navigates.
        // It also says so: the category step reads this to decide whether it may carry forward into confirmation.
        expect(setMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, CATEGORY, policy);
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(true);
    });

    it('falls back to the draft when an edit has no report to write through', async () => {
        // Given an edit of a saved expense whose report has not resolved
        const {result} = renderUpdater({isEditing: true, report: undefined});

        // When a category is picked
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then it writes the draft rather than updating with no report to recompute violations against
        expect(setMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(result.current.isDraftUpdate).toBe(true);
    });

    it('falls back to the draft when there is no transaction yet', async () => {
        // Given a split edit before the transaction has resolved
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true, transaction: undefined});

        // When a category is picked
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then nothing is written to a transaction that isn't there
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
        expect(updateMoneyRequestCategory).not.toHaveBeenCalled();
        expect(setMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(result.current.isDraftUpdate).toBe(true);
    });

    it('clears the category when an empty one is picked', async () => {
        // Given an expense still being created
        const {result} = renderUpdater();

        // When the selected category is picked again, which the callers turn into an empty category
        await act(async () => {
            await result.current.updateCategory('');
        });

        // Then the empty value is written through rather than dropped
        expect(setMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, '', policy);
    });

    it('passes the stored tags, recently used categories, rules and track intent to a saved expense update', async () => {
        // Given the workspace's tags, recently used categories and a rule, and a user who picked a track intent during onboarding
        const policyTags = createMock<OnyxTypes.PolicyTagLists>({Department: {name: 'Department', orderWeight: 0, required: false, tags: {}}});
        const recentlyUsedCategories = ['Meals'];
        const rule = createMock<OnyxTypes.Rule>({scope: CONST.RULES.SCOPE.POLICY, scopeID: policy.id});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}rule1`, rule);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, policyTags);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policy.id}`, recentlyUsedCategories);
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        const {result} = renderUpdater({isEditing: true});

        // When a category is picked on an existing expense
        await act(async () => {
            await result.current.updateCategory(CATEGORY);
        });

        // Then the stored values still reach the update, so violations and the recently used list are computed from them
        expect(updateMoneyRequestCategory).toHaveBeenCalledWith(
            expect.objectContaining({
                policyTagList: policyTags,
                policyRecentlyUsedCategories: recentlyUsedCategories,
                isTrackIntentUser: true,
                rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: rule},
            }),
        );
    });
});
