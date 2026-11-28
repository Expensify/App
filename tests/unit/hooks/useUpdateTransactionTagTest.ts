import {act, renderHook} from '@testing-library/react-native';

import useUpdateTransactionTag from '@hooks/useUpdateTransactionTag';

import {setMoneyRequestTag} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTag} from '@libs/actions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn(() => 'Translated tag');

// The three writes are the assertions: each branch must reach exactly one of them.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({setMoneyRequestTag: jest.fn()}));
jest.mock('@libs/actions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));
jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({updateMoneyRequestTag: jest.fn()}));

// Peripheral data the writes are handed. None of it decides which branch runs.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'me@example.com'})));
jest.mock('@hooks/useDelegateAccountID', () => jest.fn(() => undefined));
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate}));
jest.mock('@hooks/useAllTransactionViolations', () => jest.fn(() => undefined));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [undefined])}));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: jest.fn(() => false), isBetaEnabledOrUnknown: jest.fn(() => false)})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

const TRANSACTION_ID = 'txn1';

// Two independent tag lists, so a pick in one list must leave the other list's tag alone.
const policyTags = createMock<OnyxTypes.PolicyTagLists>({
    Department: {name: 'Department', orderWeight: 0, required: false, tags: {Engineering: {name: 'Engineering', enabled: true}, Sales: {name: 'Sales', enabled: true}}},
    Project: {name: 'Project', orderWeight: 1, required: false, tags: {Alpha: {name: 'Alpha', enabled: true}, Beta: {name: 'Beta', enabled: true}}},
});
const transaction = createMock<OnyxTypes.Transaction>({transactionID: TRANSACTION_ID, tag: 'Engineering:Alpha'});
const report = createMock<OnyxTypes.Report>({reportID: 'report1', parentReportID: 'parent1'});
const policy = createMock<OnyxTypes.Policy>({id: 'policy1', hasMultipleTagLists: true});

type Params = Parameters<typeof useUpdateTransactionTag>[0];

const baseParams: Params = {
    transactionID: TRANSACTION_ID,
    transaction,
    report,
    policy,
    policyTags,
    tagListIndex: 1,
    isEditing: false,
    isEditingSplit: false,
};

const renderUpdater = (overrides: Partial<Params> = {}) => renderHook(() => useUpdateTransactionTag({...baseParams, ...overrides}));

describe('useUpdateTransactionTag', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        // The picker beside the updater has finished reading the workspace's tags.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${policy.id}`, {hasOnceLoaded: true});
        await waitForBatchedUpdates();
    });

    it('writes only the picked list to an expense still being created', async () => {
        // Given an expense being created, tagged in both of the workspace's tag lists
        const {result} = renderUpdater();

        // When a different tag is picked in the second list
        await act(async () => {
            await result.current.updateTag('Beta');
        });

        // Then the draft gets the new tag in that list's slot, and the first list's tag is kept
        expect(setMoneyRequestTag).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestTag).toHaveBeenCalledWith(TRANSACTION_ID, 'Engineering:Beta');
        expect(updateMoneyRequestTag).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('clears the list when its current tag is picked again', async () => {
        // Given an expense being created, tagged in both lists
        const {result} = renderUpdater();

        // When the second list's current tag is picked again
        await act(async () => {
            await result.current.updateTag('Alpha');
        });

        // Then that list's tag is cleared, the same as re-picking it on the full-page selector
        expect(setMoneyRequestTag).toHaveBeenCalledWith(TRANSACTION_ID, 'Engineering');
    });

    it('writes a saved expense through the money request update', async () => {
        // Given an existing expense being edited
        const {result} = renderUpdater({isEditing: true});

        // When a tag is picked
        await act(async () => {
            await result.current.updateTag('Beta');
        });

        // Then it saves to the expense itself, with the list it belongs to and the report violations are recomputed against
        expect(updateMoneyRequestTag).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestTag).toHaveBeenCalledWith(
            expect.objectContaining({translate: mockTranslate, transactionID: TRANSACTION_ID, tag: 'Engineering:Beta', tagListIndex: 1, transactionThreadReport: report}),
        );
        expect(setMoneyRequestTag).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('writes a split being edited to its own draft', async () => {
        // Given a split expense being edited, whose source of truth is the split draft
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When a tag is picked
        await act(async () => {
            await result.current.updateTag('Beta');
        });

        // Then only the split draft is written
        expect(setDraftSplitTransaction).toHaveBeenCalledTimes(1);
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(mockTranslate, TRANSACTION_ID, transaction, {tag: 'Engineering:Beta'}, expect.any(Function), expect.any(Function));
        expect(updateMoneyRequestTag).not.toHaveBeenCalled();
        expect(setMoneyRequestTag).not.toHaveBeenCalled();
    });

    it('passes the stored categories, recently used tags, rules and track intent to a saved expense update', async () => {
        // Given the workspace's categories, recently used tags and a rule, and a user who picked a track intent during onboarding
        const policyCategories = createMock<OnyxTypes.PolicyCategories>({Travel: {name: 'Travel', enabled: true}});
        const recentlyUsedTags = {Project: ['Alpha']};
        const rule = createMock<OnyxTypes.Rule>({scope: CONST.RULES.SCOPE.POLICY, scopeID: policy.id});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}rule1`, rule);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, policyCategories);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policy.id}`, recentlyUsedTags);
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        const {result} = renderUpdater({isEditing: true});

        // When a tag is picked on an existing expense
        await act(async () => {
            await result.current.updateTag('Beta');
        });

        // Then the stored values still reach the update, so violations and the recently used list are computed from them
        expect(updateMoneyRequestTag).toHaveBeenCalledWith(
            expect.objectContaining({policyCategories, policyRecentlyUsedTags: recentlyUsedTags, isTrackIntentUser: true, rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: rule}}),
        );
    });

    it('drops the value of a removed tag list once the picker has read the lists', async () => {
        // Given an expense that still holds a value for a third tag list the workspace removed, and the picker has read the lists
        const {result} = renderUpdater({transaction: createMock<OnyxTypes.Transaction>({transactionID: TRANSACTION_ID, tag: 'Engineering:Alpha:Removed'})});

        // When a tag is picked in the second list
        await act(async () => {
            await result.current.updateTag('Beta');
        });

        // Then the removed list's value is dropped, because the stored loading state says both remaining lists are known
        expect(setMoneyRequestTag).toHaveBeenCalledWith(TRANSACTION_ID, 'Engineering:Beta');
    });

    it('builds the tag of a split being edited from its existing draft', async () => {
        // Given a split draft whose tag already differs from the saved expense
        const splitDraft = {transactionID: TRANSACTION_ID, tag: 'Sales:Alpha'};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${TRANSACTION_ID}`, splitDraft);
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When a tag is picked in the second list
        await act(async () => {
            await result.current.updateTag('Beta');
        });

        // Then the draft's own tag is the base, so the first list keeps the draft's value rather than the saved expense's
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(
            mockTranslate,
            TRANSACTION_ID,
            expect.objectContaining(splitDraft),
            {tag: 'Sales:Beta'},
            expect.any(Function),
            expect.any(Function),
        );
    });
});
