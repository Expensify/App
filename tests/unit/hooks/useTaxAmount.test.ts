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
    arePolicyRulesEnabled: () => false,
    getDistanceRateCustomUnit: jest.fn(),
}));

let mockAreRulesLoading: boolean;

jest.mock('@hooks/useRulesPrefetch', () => ({
    __esModule: true,
    default: () => ({areRulesLoading: mockAreRulesLoading}),
}));

jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {
        convertToDistanceInMeters: jest.fn(),
        getCommuterExclusionDisplayData: jest.fn(),
        getTaxableAmount: jest.fn(),
    },
}));

let mockCategoryTaxCodes: Record<string, string | undefined>;
let mockHasTaxRateWithMatchingValue: boolean;

jest.mock('@libs/TransactionUtils', () => ({
    calculateTaxAmount: (taxPercentage: string, taxableAmount: number) => {
        const pct = Number.parseFloat(String(taxPercentage).replace('%', '')) || 0;
        return (taxableAmount * pct) / 100;
    },
    getCategoryTaxCode: (category: string) => (category ? mockCategoryTaxCodes[category] : undefined),
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

/**
 * Renders the hook and records what every render reported. The rate is written by the render that resolves it, so a
 * later render reporting that rate as settled does not undo the write, and asserting on the last render alone would
 * miss it.
 */
function renderTaxAmountRenders(initialTransaction: Params['transaction']) {
    const renders: Array<{defaultTaxCode: string; shouldKeepCurrentTaxSelection: boolean; areRulesLoading: boolean}> = [];
    const {rerender} = renderHook(
        (props: {transaction: Params['transaction']}) => {
            const taxAmount = useTaxAmount({...baseParams, ...props});
            renders.push({
                defaultTaxCode: taxAmount.defaultTaxCode,
                shouldKeepCurrentTaxSelection: taxAmount.shouldKeepCurrentTaxSelection,
                areRulesLoading: taxAmount.areRulesLoading,
            });
            return taxAmount;
        },
        {initialProps: {transaction: initialTransaction}},
    );

    return {renders, rerenderWith: (transaction: Params['transaction']) => rerender({transaction})};
}

describe('useTaxAmount', () => {
    beforeEach(() => {
        mockConvertToDistanceInMeters.mockImplementation((distance: number) => distance);
        mockGetCommuterExclusionDisplayData.mockReturnValue(null);
        mockGetTaxableAmount.mockReturnValue(100);
        mockGetDistanceRateCustomUnit.mockReturnValue(undefined);
        mockCategoryTaxCodes = {};
        mockAreRulesLoading = false;
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
        mockCategoryTaxCodes = {Car: 'tax_category'};
        const transaction = {...baseTransaction, category: 'Car'};

        // When the hook resolves the default tax code
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction}));

        // Then the category rule outranks the workspace default, so the confirmation page opens on the rule's rate
        expect(result.current.defaultTaxCode).toBe('tax_category');
    });

    it('resolves the tax again when the currency changes and the user had picked the old default', () => {
        // Given a category rule, and a user who picked the workspace default before switching to a foreign currency
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', currency: 'EUR', taxCode: 'tax_default'};

        // When the hook decides whether that selection survives the currency change
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, previousTransactionCurrency: 'USD'}));

        // Then it does not, because the workspace default follows the currency, so the rate is resolved from scratch
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(false);
    });

    it('keeps the workspace default when the user picks it over the category rule rate', () => {
        // Given a category rule that resolves to its own tax code, and a user who picked the workspace default instead
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', taxCode: 'tax_default'};

        // When the hook decides whether that selection survives
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction}));

        // Then it is kept, because the selection is compared against the rule's rate rather than the workspace default
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(true);
    });

    it('writes the new workspace default when the user had picked the old one before a currency change', () => {
        // Given a category rule, and a user who picked the workspace default before switching to a foreign currency
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', currency: 'EUR', taxCode: 'tax_default'};

        // When the hook resolves the tax code to write after the currency change
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, previousTransactionCurrency: 'USD'}));

        // Then the foreign default is written, because that selection was following the workspace default
        expect(result.current.defaultTaxCode).toBe('tax_foreign');
    });

    it('keeps the rule rate across a currency change when the user had picked the rule rate', () => {
        // Given a user sitting on the category rule's rate when the currency changes
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car', currency: 'EUR', taxCode: 'tax_category'};

        // When the hook decides whether that selection survives
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, previousTransactionCurrency: 'USD'}));

        // Then it is kept, because only the workspace default follows the currency
        expect(result.current.shouldKeepCurrentTaxSelection).toBe(true);
    });

    it('applies the new category rule when the category changes', () => {
        // Given an expense carrying the tax its old category had no rule for, and a category that does have one
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Equipment', taxCode: 'tax_default'};

        // When the user switches to the category that carries the rule
        const {renders, rerenderWith} = renderTaxAmountRenders(transaction);
        rerenderWith({...transaction, category: 'Car'});

        // Then the rate the old category left behind does not read as a selection, so the rule's rate is applied
        expect(renders).toContainEqual({defaultTaxCode: 'tax_category', shouldKeepCurrentTaxSelection: false, areRulesLoading: false});
    });

    it('applies the category rule when the category changed while the rules were loading', () => {
        // Given an expense carrying the tax of a category with no rule, whose category is changed to one that has a
        // rule before `GetRules` has answered
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockHasTaxRateWithMatchingValue = true;
        mockAreRulesLoading = true;
        const transaction = {...baseTransaction, category: 'Equipment', taxCode: 'tax_default'};
        const {renders, rerenderWith} = renderTaxAmountRenders(transaction);
        rerenderWith({...transaction, category: 'Car'});
        // Nothing resolves the rate while the rules are loading, so further renders must not retire the change
        rerenderWith({...transaction, category: 'Car'});

        // When the rules land
        mockAreRulesLoading = false;
        rerenderWith({...transaction, category: 'Car'});

        // Then the change is still seen, so the rate the old category left behind does not read as a selection
        expect(renders).toContainEqual({defaultTaxCode: 'tax_category', shouldKeepCurrentTaxSelection: false, areRulesLoading: false});
    });

    it('applies the category rule when the rules arrive on a retry after the default was already written', () => {
        // Given a `GetRules` that failed, which settles the wait with no rules, so the expense is given the
        // workspace default
        mockHasTaxRateWithMatchingValue = true;
        const transaction = {...baseTransaction, category: 'Car'};
        const {renders, rerenderWith} = renderTaxAmountRenders(transaction);
        rerenderWith({...transaction, taxCode: 'tax_default'});

        // When a retry lands the rules and the category turns out to carry a rule
        mockCategoryTaxCodes = {Car: 'tax_category'};
        rerenderWith({...transaction, taxCode: 'tax_default'});

        // Then the fallback does not read as a rate the user picked, so the rule's rate replaces it
        expect(renders).toContainEqual({defaultTaxCode: 'tax_category', shouldKeepCurrentTaxSelection: false, areRulesLoading: false});
    });

    it('reports the category rule rate for a track expense being moved', () => {
        // Given a tracked expense being submitted to a workspace whose category carries a tax rule
        mockCategoryTaxCodes = {Car: 'tax_category'};
        const transaction = {...baseTransaction, category: 'Car'};

        // When the hook resolves the tax for the confirmation page
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}));

        // Then the rule's rate is reported as a rule rate, which is what lets it be written over the rate the
        // expense arrived with
        expect(result.current.categoryTaxCode).toBe('tax_category');
    });

    it('reports no category rule rate for a track expense whose category has no rule', () => {
        // Given a tracked expense being submitted to a workspace where its category carries no tax rule
        const transaction = {...baseTransaction, category: 'Equipment'};

        // When the hook resolves the tax for the confirmation page
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}));

        // Then nothing is reported, so the expense keeps the rate it arrived with rather than the workspace default
        expect(result.current.categoryTaxCode).toBeUndefined();
    });

    it('charges the tax again when a category rule replaces the rate a moved track expense arrived with', () => {
        // Given a tracked expense carrying a tax amount, being submitted to a workspace whose category has a rule
        mockCategoryTaxCodes = {Car: 'tax_category'};
        const transaction = {...baseTransaction, category: 'Car', taxAmount: 55};

        // When the hook resolves the tax amount
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}));

        // Then the amount is charged at the rule's rate, because the amount it arrived with was charged at a rate
        // the expense no longer carries
        expect(result.current.taxAmountInSmallestCurrencyUnits).toBe(10000);
    });

    it('keeps the tax amount a moved track expense arrived with when no category rule applies', () => {
        // Given a tracked expense carrying a tax amount, whose category carries no rule on the destination workspace
        const transaction = {...baseTransaction, category: 'Equipment', taxAmount: 55};

        // When the hook resolves the tax amount
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}));

        // Then it is kept as it stands, because the rate it was charged at is kept too and a stored amount is
        // already in the smallest currency units
        expect(result.current.taxAmountInSmallestCurrencyUnits).toBe(55);
    });

    it('does not inflate the kept tax amount by converting an amount that is already in the smallest units', () => {
        // Given a tracked expense carrying $5.00 of tax, whose category carries no rule on the destination workspace
        const transaction = {...baseTransaction, category: 'Equipment', taxAmount: 500};

        // When the hook resolves the tax amount
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}));

        // Then $5.00 is written back rather than $500.00, which is what converting a stored amount a second time
        // would produce
        expect(result.current.taxAmountInSmallestCurrencyUnits).toBe(500);
    });

    it('holds the workspace default back while a moved track expense still carries the rate it arrived with', () => {
        // Given a tracked expense being submitted to a workspace where its category carries no tax rule
        const transaction = {...baseTransaction, category: 'Equipment', taxCode: 'tax_arrived', taxValue: '5%', taxAmount: 55};

        // When the hook resolves the tax
        const {result} = renderHook(() => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}));

        // Then the default is held back, because writing it would replace a rate with one nobody chose for this expense
        expect(result.current.shouldHoldBackDefault).toBe(true);
    });

    it('puts the arrived rate back when the category carrying the rule is swapped for one without', () => {
        // Given a moved track expense that arrived with its own rate, on a category whose rule replaces that rate
        mockCategoryTaxCodes = {Car: 'tax_category'};
        const arrived = {...baseTransaction, category: 'Car', taxCode: 'tax_arrived', taxValue: '5%', taxAmount: 55};
        const {result, rerender} = renderHook((transaction: Params['transaction']) => useTaxAmount({...baseParams, transaction, isMovingTransactionFromTrackExpense: true}), {
            initialProps: arrived,
        });

        // When the user picks a category with no rule, by which point the transaction carries the rule's rate
        rerender({...arrived, category: 'Equipment', taxCode: 'tax_category', taxValue: '10%', taxAmount: 10000});

        // Then the rate the expense arrived with is restored rather than the rule's rate being left behind, so the
        // default is no longer held back
        expect(result.current.shouldHoldBackDefault).toBe(false);
        expect(result.current.defaultTaxCode).toBe('tax_arrived');
        expect(result.current.defaultTaxValue).toBe('5%');
        expect(result.current.taxAmountInSmallestCurrencyUnits).toBe(55);
    });

    it('applies the category rule to the distance rate default category', () => {
        // Given a distance rate whose default category carries a tax rule, on an expense with no category yet
        mockCategoryTaxCodes = {Car: 'tax_category'};
        mockGetDistanceRateCustomUnit.mockReturnValue({name: 'Distance', customUnitID: 'unit1', rates: {}, defaultCategory: 'Car'});

        // When the hook resolves the default tax code before that category is written to the transaction
        const {result} = renderHook(() => useTaxAmount({...baseParams, isDistanceRequest: true}));

        // Then the rule's rate is used, so this write and the one the category default triggers agree
        expect(result.current.defaultTaxCode).toBe('tax_category');
    });
});
