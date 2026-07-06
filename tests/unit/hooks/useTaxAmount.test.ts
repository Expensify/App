import {renderHook} from '@testing-library/react-native';
import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';
import {getDefaultTaxCode as getDefaultTaxCodeMock, hasTaxRateWithMatchingValue as hasTaxRateWithMatchingValueMock} from '@libs/TransactionUtils';
import type * as OnyxTypes from '@src/types/onyx';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: () => 2}),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    convertToBackendAmount: (n: number) => Math.round(n * 100),
}));

jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {
        getTaxableAmount: () => 100,
    },
}));

jest.mock('@libs/TransactionUtils', () => ({
    calculateTaxAmount: (taxPercentage: string, taxableAmount: number) => {
        const pct = Number.parseFloat(String(taxPercentage).replace('%', '')) || 0;
        return (taxableAmount * pct) / 100;
    },
    getDefaultTaxCode: jest.fn(() => 'tax_default'),
    getTaxValue: () => '10%',
    hasTaxRateWithMatchingValue: jest.fn(() => false),
}));

const mockGetDefaultTaxCode = getDefaultTaxCodeMock as jest.Mock;
const mockHasTaxRateWithMatchingValue = hasTaxRateWithMatchingValueMock as jest.Mock;

type Params = Parameters<typeof useTaxAmount>[0];

const baseParams: Params = {
    transaction: {transactionID: 'txn1', amount: 1000, currency: 'USD'} as unknown as OnyxTypes.Transaction,
    policy: undefined,
    policyForMovingExpenses: undefined,
    isDistanceRequest: false,
    isMovingTransactionFromTrackExpense: false,
    customUnitRateID: '',
    distance: 0,
    previousTransactionCurrency: 'USD',
};

// Mirrors the real getDefaultTaxCode for the non-distance path: workspace-currency default when the
// (optionally overridden) currency matches the policy output currency, otherwise the foreign default.
const currencyAwareDefaultTaxCode = (policy: OnyxTypes.Policy | undefined, transaction: OnyxTypes.Transaction | undefined, currency?: string) => {
    const resolvedCurrency = currency ?? transaction?.currency;
    return policy?.outputCurrency === resolvedCurrency ? policy?.taxRates?.defaultExternalID : policy?.taxRates?.foreignTaxDefault;
};

beforeEach(() => {
    mockGetDefaultTaxCode.mockReset();
    mockGetDefaultTaxCode.mockReturnValue('tax_default');
    mockHasTaxRateWithMatchingValue.mockReset();
    mockHasTaxRateWithMatchingValue.mockReturnValue(false);
});

describe('useTaxAmount', () => {
    it('returns the default tax code and value from policy resolution', () => {
        const {result} = renderHook(() => useTaxAmount(baseParams));
        expect(result.current.defaultTaxCode).toBe('tax_default');
        expect(result.current.defaultTaxValue).toBe('10%');
    });

    it('computes taxAmountInSmallestCurrencyUnits from amount * tax rate', () => {
        // amount = 1000 (in smallest units = $10.00 since |amount|=1000 → 10% of 1000 = 100; convertToBackendAmount(100) = 10000)
        const {result} = renderHook(() => useTaxAmount(baseParams));
        expect(result.current.taxAmountInSmallestCurrencyUnits).toBe(10000);
    });

    it('uses distance taxable amount for distance requests', () => {
        const {result} = renderHook(() => useTaxAmount({...baseParams, isDistanceRequest: true}));
        // taxableAmount=100 from mocked getTaxableAmount, 10% = 10, convertToBackendAmount(10) = 1000
        expect(result.current.taxAmountInSmallestCurrencyUnits).toBe(1000);
    });

    it('shouldKeepCurrentTaxSelection is false when policy has no matching tax rate', () => {
        const {result} = renderHook(() => useTaxAmount(baseParams));
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(false);
    });

    describe('stale auto-applied default after a currency change (e.g. FAB flow)', () => {
        const policy = {
            outputCurrency: 'USD',
            taxRates: {defaultExternalID: 'CODE_DEFAULT', foreignTaxDefault: 'CODE_FOREIGN'},
        } as unknown as OnyxTypes.Policy;

        beforeEach(() => {
            mockGetDefaultTaxCode.mockImplementation(currencyAwareDefaultTaxCode);
            // The stale code still maps to a valid rate for the policy, so the old heuristic would keep it.
            mockHasTaxRateWithMatchingValue.mockReturnValue(true);
        });

        it('does not keep the workspace-currency default once the currency is switched to a foreign one', () => {
            const transaction = {transactionID: 'txn1', amount: 1000, currency: 'EUR', taxCode: 'CODE_DEFAULT'} as unknown as OnyxTypes.Transaction;
            const {result} = renderHook(() =>
                useTaxAmount({
                    ...baseParams,
                    transaction,
                    policy,
                    // A fresh confirmation-page mount seeds usePrevious with the already-updated currency.
                    previousTransactionCurrency: 'EUR',
                }),
            );

            // Stale default detected → let TaxController re-apply the foreign-currency default.
            expect(result.current.shouldKeepCurrentTaxSelection).toBe(false);
            expect(result.current.defaultTaxCode).toBe('CODE_FOREIGN');
        });

        it('preserves a manually selected non-default tax rate across a currency change', () => {
            const transaction = {transactionID: 'txn1', amount: 1000, currency: 'EUR', taxCode: 'CODE_MANUAL'} as unknown as OnyxTypes.Transaction;
            const {result} = renderHook(() =>
                useTaxAmount({
                    ...baseParams,
                    transaction,
                    policy,
                    previousTransactionCurrency: 'EUR',
                }),
            );

            // A non-default code is a real user choice → keep it.
            expect(result.current.shouldKeepCurrentTaxSelection).toBe(true);
        });

        it('returns false (no-op) when taxCode already equals the current currency default', () => {
            const transaction = {transactionID: 'txn1', amount: 1000, currency: 'EUR', taxCode: 'CODE_FOREIGN'} as unknown as OnyxTypes.Transaction;
            const {result} = renderHook(() =>
                useTaxAmount({
                    ...baseParams,
                    transaction,
                    policy,
                    previousTransactionCurrency: 'EUR',
                }),
            );

            // taxCode already equals the current-currency default → not stale, nothing to re-apply.
            expect(result.current.shouldKeepCurrentTaxSelection).toBe(false);
        });
    });
});
