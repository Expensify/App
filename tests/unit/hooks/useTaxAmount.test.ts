import {renderHook} from '@testing-library/react-native';

import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

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
        convertToDistanceInMeters: jest.fn(),
        getCommuterExclusionDisplayData: jest.fn(),
        getTaxableAmount: jest.fn(),
    },
}));

jest.mock('@libs/TransactionUtils', () => ({
    calculateTaxAmount: (taxPercentage: string, taxableAmount: number) => {
        const pct = Number.parseFloat(String(taxPercentage).replace('%', '')) || 0;
        return (taxableAmount * pct) / 100;
    },
    getDefaultTaxCode: () => 'tax_default',
    getTaxValue: () => '10%',
    hasTaxRateWithMatchingValue: () => false,
}));

type Params = Parameters<typeof useTaxAmount>[0];

const mockConvertToDistanceInMeters = jest.mocked(DistanceRequestUtils.convertToDistanceInMeters);
const mockGetCommuterExclusionDisplayData = jest.mocked(DistanceRequestUtils.getCommuterExclusionDisplayData);
const mockGetTaxableAmount = jest.mocked(DistanceRequestUtils.getTaxableAmount);

const baseParams: Params = {
    transaction: {transactionID: 'txn1', amount: 1000, currency: 'USD'} as unknown as OnyxTypes.Transaction,
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
        mockGetCommuterExclusionDisplayData.mockReturnValue({
            commuterExclusion: 1,
            reimbursableDistance: 3,
            distanceUnit: 'mi',
        });

        renderHook(() =>
            useTaxAmount({
                ...baseParams,
                transaction: {
                    ...baseParams.transaction,
                    comment: {
                        customUnit: {
                            commuterExclusion: 1,
                            reimbursableDistance: 3,
                            distanceUnit: 'mi',
                        },
                    },
                } as OnyxTypes.Transaction,
                isDistanceRequest: true,
                distance: 4,
            }),
        );

        expect(mockGetTaxableAmount).toHaveBeenCalledWith(undefined, '', 3);
    });

    it('falls back to the active mileage unit for commuter exclusion tax', () => {
        mockGetCommuterExclusionDisplayData.mockReturnValue({
            commuterExclusion: 1,
            reimbursableDistance: 3,
            distanceUnit: 'km',
        });

        renderHook(() =>
            useTaxAmount({
                ...baseParams,
                transaction: {
                    ...baseParams.transaction,
                    comment: {
                        customUnit: {
                            commuterExclusion: 1,
                            reimbursableDistance: 3,
                        },
                    },
                } as OnyxTypes.Transaction,
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
});
