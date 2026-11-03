import {renderHook} from '@testing-library/react-native';

import useUpdateTransactionTaxRate from '@hooks/useUpdateTransactionTaxRate';

import {setMoneyRequestTaxRateValues} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTaxRate} from '@libs/actions/IOU/UpdateMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The three writes are the assertions: each branch must reach exactly one of them.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({setMoneyRequestTaxRateValues: jest.fn()}));
jest.mock('@libs/actions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));
jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({updateMoneyRequestTaxRate: jest.fn()}));

// Peripheral data the writes are handed. None of it decides which branch runs.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'me@example.com'})));
jest.mock('@hooks/useDelegateAccountID', () => jest.fn(() => undefined));
jest.mock('@hooks/useAllTransactionViolations', () => jest.fn(() => undefined));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [undefined])}));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: jest.fn(() => false), isBetaEnabledOrUnknown: jest.fn(() => false)})));

const TRANSACTION_ID = 'txn1';
const STANDARD_TAX_CODE = 'id_TAX_RATE_1';
const REDUCED_TAX_CODE = 'id_TAX_RATE_2';
const VALUELESS_TAX_CODE = 'id_TAX_RATE_3';

// A $100 expense, stored negative as the expense-report amounts the tax is worked out from are. At the reduced
// rate of 10% the tax included in $100 is $9.09, which is 909 in the smallest unit the stores keep.
const EXPENSE_AMOUNT = -10000;
const REDUCED_TAX_AMOUNT = 909;

const policy = createMock<OnyxTypes.Policy>({
    id: 'policy1',
    outputCurrency: 'USD',
    taxRates: {
        name: 'VAT',
        defaultExternalID: STANDARD_TAX_CODE,
        defaultValue: '5%',
        foreignTaxDefault: STANDARD_TAX_CODE,
        taxes: {
            [STANDARD_TAX_CODE]: {name: 'Standard', value: '5%'},
            [REDUCED_TAX_CODE]: {name: 'Reduced', value: '10%'},
            [VALUELESS_TAX_CODE]: {name: 'Unset', value: ''},
        },
    },
});
const transaction = createMock<OnyxTypes.Transaction>({transactionID: TRANSACTION_ID, amount: EXPENSE_AMOUNT, currency: 'USD', taxCode: STANDARD_TAX_CODE, taxValue: '5%'});
const report = createMock<OnyxTypes.Report>({reportID: 'report1', parentReportID: 'parent1'});

const reducedRateOption = {code: REDUCED_TAX_CODE, keyForList: 'Reduced (10%)-1', text: 'Reduced (10%)'};

type Params = Parameters<typeof useUpdateTransactionTaxRate>[0];

const baseParams: Params = {
    transactionID: TRANSACTION_ID,
    transaction,
    report,
    policy,
    isEditing: false,
    isEditingSplit: false,
};

const renderUpdater = (overrides: Partial<Params> = {}) => renderHook(() => useUpdateTransactionTaxRate({...baseParams, ...overrides}));

describe('useUpdateTransactionTaxRate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('writes the rate and its tax amount to an expense still being created', () => {
        // Given an expense being created at the workspace's standard rate
        const {result} = renderUpdater();

        // When the reduced rate is picked
        result.current.updateTaxRate(reducedRateOption);

        // Then the draft gets the new rate, its value and the tax amount worked out from the expense's amount, and nothing else is written
        expect(setMoneyRequestTaxRateValues).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestTaxRateValues).toHaveBeenCalledWith(TRANSACTION_ID, {taxCode: REDUCED_TAX_CODE, taxValue: '10%', taxAmount: REDUCED_TAX_AMOUNT});
        expect(updateMoneyRequestTaxRate).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('writes a saved expense through the money request update', () => {
        // Given an existing expense being edited
        const {result} = renderUpdater({isEditing: true});

        // When the reduced rate is picked
        result.current.updateTaxRate(reducedRateOption);

        // Then it saves to the expense itself, with the report its violations are recomputed against
        expect(updateMoneyRequestTaxRate).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestTaxRate).toHaveBeenCalledWith(
            expect.objectContaining({transactionID: TRANSACTION_ID, taxCode: REDUCED_TAX_CODE, taxValue: '10%', taxAmount: REDUCED_TAX_AMOUNT, transactionThreadReport: report}),
        );
        expect(setMoneyRequestTaxRateValues).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('writes a split being edited to its own draft', () => {
        // Given a split expense being edited, whose source of truth is the split draft
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When the reduced rate is picked
        result.current.updateTaxRate(reducedRateOption);

        // Then only the split draft is written
        expect(setDraftSplitTransaction).toHaveBeenCalledTimes(1);
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(
            TRANSACTION_ID,
            undefined,
            {taxCode: REDUCED_TAX_CODE, taxValue: '10%', taxAmount: REDUCED_TAX_AMOUNT},
            expect.any(Function),
            expect.any(Function),
        );
        expect(updateMoneyRequestTaxRate).not.toHaveBeenCalled();
        expect(setMoneyRequestTaxRateValues).not.toHaveBeenCalled();
    });

    it('clears the tax from a saved expense whose rate the workspace no longer has', () => {
        // Given an existing expense being edited, whose rate was deleted from the workspace
        const {result} = renderUpdater({isEditing: true});

        // When the list asks to clear the tax instead of picking a rate
        result.current.updateTaxRate({code: undefined, keyForList: STANDARD_TAX_CODE}, true);

        // Then the expense is saved with no rate, value or tax amount
        expect(updateMoneyRequestTaxRate).toHaveBeenCalledTimes(1);
        expect(updateMoneyRequestTaxRate).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRANSACTION_ID, taxCode: '', taxValue: '', taxAmount: 0}));
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('clears the tax from a split being edited in its own draft', () => {
        // Given a split expense being edited, whose rate was deleted from the workspace
        const {result} = renderUpdater({isEditing: true, isEditingSplit: true});

        // When the list asks to clear the tax
        result.current.updateTaxRate({code: undefined, keyForList: STANDARD_TAX_CODE}, true);

        // Then the split draft is cleared, not the saved expense, so the stale tax is not kept on save
        expect(setDraftSplitTransaction).toHaveBeenCalledTimes(1);
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(TRANSACTION_ID, undefined, {taxAmount: 0, taxCode: '', taxValue: ''}, expect.any(Function), expect.any(Function));
        expect(updateMoneyRequestTaxRate).not.toHaveBeenCalled();
    });

    it('leaves the draft alone for a rate without a value', () => {
        // Given a workspace rate with no value, so there is no tax amount to work out
        const {result} = renderUpdater();

        // When it is picked on an expense being created
        result.current.updateTaxRate({code: VALUELESS_TAX_CODE, keyForList: 'Unset ()-2', text: 'Unset ()'});

        // Then nothing is written, as the full-page selector has always done for such a rate
        expect(setMoneyRequestTaxRateValues).not.toHaveBeenCalled();
        expect(updateMoneyRequestTaxRate).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when the workspace has no tax rates', () => {
        // Given a workspace without tax rates, which can happen when the policy is still loading
        const {result} = renderUpdater({policy: createMock<OnyxTypes.Policy>({id: 'policy1'})});

        // When a rate is picked on an expense being created
        result.current.updateTaxRate(reducedRateOption);

        // Then nothing is written
        expect(setMoneyRequestTaxRateValues).not.toHaveBeenCalled();
        expect(updateMoneyRequestTaxRate).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('writes nothing for a pick without a rate code', () => {
        // Given an expense being created
        const {result} = renderUpdater();

        // When the list hands back an option without a code, such as a deleted rate's placeholder row
        result.current.updateTaxRate({code: undefined, keyForList: 'deleted'});

        // Then the draft is left alone
        expect(setMoneyRequestTaxRateValues).not.toHaveBeenCalled();
        expect(updateMoneyRequestTaxRate).not.toHaveBeenCalled();
        expect(setDraftSplitTransaction).not.toHaveBeenCalled();
    });
});
