import {renderHook} from '@testing-library/react-native';

import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: () => 2}),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    convertToBackendAmount: (n: number) => Math.round(n * 100),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getDistanceRateCustomUnit: jest.fn(),
}));

jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {
        convertToDistanceInMeters: jest.fn(),
        getCommuterExclusionDisplayData: jest.fn(),
        getTaxableAmount: jest.fn(),
    },
}));

let mockCategoryTaxCode: string | undefined;
let mockHasTaxRateWithMatchingValue: boolean;

jest.mock('@libs/TransactionUtils', () => ({
    calculateTaxAmount: (taxPercentage: string, taxableAmount: number) => {
        const pct = Number.parseFloat(String(taxPercentage).replace('%', '')) || 0;
        return (taxableAmount * pct) / 100;
    },
    getCategoryTaxCode: (category: string) => (category ? mockCategoryTaxCode : undefined),
    getDefaultTaxCode: (_policy: unknown, transaction: {currency?: string} | undefined, currency?: string) => ((currency ?? transaction?.currency) === 'EUR' ? 'tax_foreign' : 'tax_default'),
    getTaxValue: () => '10%',
    hasTaxRateWithMatchingValue: () => mockHasTaxRateWithMatchingValue,
}));

type Params = Parameters<typeof useTaxAmount>[0];

const mockConvertToDistanceInMeters = jest.mocked(DistanceRequestUtils.convertToDistanceInMeters);
const mockGetCommuterExclusionDisplayData = jest.mocked(DistanceRequestUtils.getCommuterExclusionDisplayData);
const mockGetTaxableAmount = jest.mocked(DistanceRequestUtils.getTaxableAmount);
const mockGetDistanceRateCustomUnit = jest.mocked(getDistanceRateCustomUnit);

const baseTransaction = {
    transactionID: 'txn1',
    amount: 1000,
    created: '2026-07-22',
    currency: 'USD',
    merchant: 'Merchant',
    reportID: 'report1',
} satisfies Params['transaction'];

const baseParams: Params = {
    transaction: baseTransaction,
    policy: undefined,
    policyForMovingExpenses: undefined,
    isDistanceRequest: false,
    isMovingTransactionFromTrackExpense: false,
    customUnitRateID: '',
    distance: 0,
    distanceUnit: undefined,
    previousTransactionCurrency: 'USD',
};

describe('useTaxAmount', () => {
    beforeEach(() => {
        mockConvertToDistanceInMeters.mockImplementation((distance: number) => distance);
        mockGetCommuterExclusionDisplayData.mockReturnValue(null);
        mockGetTaxableAmount.mockReturnValue(100);
        mockGetDistanceRateCustomUnit.mockReturnValue(undefined);
        mockCategoryTaxCode = undefined;
        mockHasTaxRateWithMatchingValue = false;
    });

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

    it('uses reimbursable distance for distance tax when commuter exclusion applies', () => {
        const transaction = {
            ...baseTransaction,
            comment: {
                customUnit: {
                    commuterExclusion: 1,
                    reimbursableDistance: 3,
                    distanceUnit: 'mi',
                },
            },
        } satisfies Params['transaction'];

        mockGetCommuterExclusionDisplayData.mockReturnValue({
            commuterExclusion: 1,
            reimbursableDistance: 3,
            distanceUnit: 'mi',
        });

        renderHook(() =>
            useTaxAmount({
                ...baseParams,
                transaction,
                isDistanceRequest: true,
                distance: 4,
            }),
        );

        expect(mockGetTaxableAmount).toHaveBeenCalledWith(undefined, '', 3);
    });

    it('falls back to the active mileage unit for commuter exclusion tax', () => {
        const transaction = {
            ...baseTransaction,
            comment: {
                customUnit: {
                    commuterExclusion: 1,
                    reimbursableDistance: 3,
                },
            },
        } satisfies Params['transaction'];

        mockGetCommuterExclusionDisplayData.mockReturnValue({
            commuterExclusion: 1,
            reimbursableDistance: 3,
            distanceUnit: 'km',
        });

        renderHook(() =>
            useTaxAmount({
                ...baseParams,
                transaction,
                isDistanceRequest: true,
                distance: 4,
                distanceUnit: 'km',
            }),
        );

        expect(mockGetCommuterExclusionDisplayData).toHaveBeenCalledWith(
            {
                commuterExclusion: 1,
                reimbursableDistance: 3,
            },
            'km',
        );
        expect(mockConvertToDistanceInMeters).toHaveBeenCalledWith(3, 'km');
        expect(mockGetTaxableAmount).toHaveBeenCalledWith(undefined, '', 3);
    });

    it('shouldKeepCurrentTaxSelection is false when policy has no matching tax rate', () => {
        const {result} = renderHook(() => useTaxAmount(baseParams));
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(false);
    });

    it('prefers the tax rate from the category rule over the workspace default', () => {
        // Given a category whose tax rule resolves to a tax code of its own
        mockCategoryTaxCode = 'tax_category';
        const transaction = {...baseTransaction, category: 'Car'};

        // When the hook resolves the default tax code
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction}));

        // Then the category rule outranks the workspace default, so the confirmation page opens on the rule's rate
        expect(result.current.defaultTaxCode).toBe('tax_category');
    });

    it('resolves the tax again when the currency changes and the user had picked the old default', () => {
        // Given a category rule, and a user who picked the workspace default before switching to a foreign currency
        mockCategoryTaxCode = 'tax_category';
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', currency: 'EUR', taxCode: 'tax_default'};

        // When the hook decides whether that selection survives the currency change
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, previousTransactionCurrency: 'USD'}));

        // Then it does not, because the workspace default follows the currency, so the rate is resolved from scratch
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(false);
    });

    it('keeps the workspace default when the user picks it over the category rule rate', () => {
        // Given a category rule that resolves to its own tax code, and a user who picked the workspace default instead
        mockCategoryTaxCode = 'tax_category';
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', taxCode: 'tax_default'};

        // When the hook decides whether that selection survives
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction}));

        // Then it is kept, because the selection is compared against the rule's rate rather than the workspace default
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(true);
    });

    it('writes the new workspace default when the user had picked the old one before a currency change', () => {
        // Given a category rule, and a user who picked the workspace default before switching to a foreign currency
        mockCategoryTaxCode = 'tax_category';
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', currency: 'EUR', taxCode: 'tax_default'};

        // When the hook resolves the tax code to write after the currency change
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, previousTransactionCurrency: 'USD'}));

        // Then the foreign default is written, because that selection was following the workspace default
        expect(result.current.defaultTaxCode).toBe('tax_foreign');
    });

    it('keeps the rule rate across a currency change when the user had picked the rule rate', () => {
        // Given a user sitting on the category rule's rate when the currency changes
        mockCategoryTaxCode = 'tax_category';
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', currency: 'EUR', taxCode: 'tax_category'};

        // When the hook decides whether that selection survives
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, previousTransactionCurrency: 'USD'}));

        // Then it is kept, because only the workspace default follows the currency
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(true);
    });

    it('applies the category rule to the distance rate default category', () => {
        // Given a distance rate whose default category carries a tax rule, on an expense with no category yet
        mockCategoryTaxCode = 'tax_category';
        mockGetDistanceRateCustomUnit.mockReturnValue({name: 'Distance', customUnitID: 'unit1', rates: {}, defaultCategory: 'Car'});

        // When the hook resolves the default tax code before that category is written to the transaction
        const {result} = renderHook(() => useTaxAmount({...baseParams, isDistanceRequest: true}));

        // Then the rule's rate is used, so this write and the one the category default triggers agree
        expect(result.current.defaultTaxCode).toBe('tax_category');
    });
});
