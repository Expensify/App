import {renderHook} from '@testing-library/react-native';

import useUpdateTransactionTag from '@hooks/useUpdateTransactionTag';

import {setMoneyRequestTag} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTag} from '@libs/actions/IOU/UpdateMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The three writes are the assertions: each branch must reach exactly one of them.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({setMoneyRequestTag: jest.fn()}));
jest.mock('@libs/actions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));
jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({updateMoneyRequestTag: jest.fn()}));

// Peripheral data the writes are handed. None of it decides which branch runs.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'me@example.com'})));
jest.mock('@hooks/useDelegateAccountID', () => jest.fn(() => undefined));
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

    it('writes only the picked list to an expense still being created', () => {
        // Given an expense being created, tagged in both of the workspace's tag lists
        const {result} = renderUpdater();

        // When a different tag is picked in the second list
        result.current.updateTag('Beta');

        // Then the draft gets the new tag in that list's slot, and the first list's tag is kept
        expect(setMoneyRequestTag).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestTag).toHaveBeenCalledWith(TRANSACTION_ID, 'Engineering:Beta');
        expect(updateMoneyRequestTag).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('clears the list when its current tag is picked again', () => {
        // Given an expense being created, tagged in both lists
        const {result} = renderUpdater();

        // When the second list's current tag is picked again
        result.current.updateTag('Alpha');

        // Then that list's tag is cleared, the same as re-picking it on the full-page selector
        expect(setMoneyRequestTag).toHaveBeenCalledWith(TRANSACTION_ID, 'Engineering');
    });

    it('writes a saved expense through the money request update', () => {
        // Given an existing expense being edited
        const {result} = renderUpdater({isEditing: true});

        // When a tag is picked
        result.current.updateTag('Beta');

        // Then it saves to the expense itself, with the list it belongs to and the report violations are recomputed against
        expect(updateMoneyRequestTag).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestTag).toHaveBeenCalledWith(
            expect.objectContaining({transactionID: TRANSACTION_ID, tag: 'Engineering:Beta', tagListIndex: 1, transactionThreadReport: report}),
        );
        expect(setMoneyRequestTag).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('writes a split being edited to its own draft', () => {
        // Given a split expense being edited, whose source of truth is the split draft
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When a tag is picked
        result.current.updateTag('Beta');

        // Then only the split draft is written
        expect(setDraftSplitTransaction).toHaveBeenCalledTimes(1);
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(TRANSACTION_ID, transaction, {tag: 'Engineering:Beta'}, expect.any(Function), expect.any(Function));
        expect(updateMoneyRequestTag).not.toHaveBeenCalled();
        expect(setMoneyRequestTag).not.toHaveBeenCalled();
    });
});
