import {renderHook} from '@testing-library/react-native';
import useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';
import type * as OnyxTypes from '@src/types/onyx';

jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {
        getDefaultMileageRate: () => undefined,
        getRate: () => ({rate: 0.5, unit: 'mi', currency: 'USD'}),
        getDistanceRequestAmount: (distance: number, _unit: string, rate: number): number => Math.round(distance * rate * 100),
    },
}));

jest.mock('@libs/TransactionUtils', () => ({
    getDistanceInMeters: (transaction: {comment?: {customUnit?: {distance?: number}}} | undefined): number => transaction?.comment?.customUnit?.distance ?? 0,
    hasRoute: (transaction: {comment?: {customUnit?: {distance?: number}}} | undefined): boolean => !!transaction?.comment?.customUnit?.distance,
}));

type Params = Parameters<typeof useDistanceRequestState>[0];

const baseParams: Params = {
    transaction: {transactionID: 'txn1', comment: {customUnit: {distance: 10}}} as unknown as OnyxTypes.Transaction,
    policy: undefined,
    policyID: 'policy1',
    policyForMovingExpenses: undefined,
    isMovingTransactionFromTrackExpense: false,
    isDistanceRequest: true,
    iouAmount: 0,
    iouCurrencyCode: 'USD',
};

describe('useDistanceRequestState', () => {
    it('shouldCalculateDistanceAmount is true on initial mount when iouAmount is 0', () => {
        const {result} = renderHook(() => useDistanceRequestState(baseParams));
        expect(result.current.shouldCalculateDistanceAmount).toBe(true);
        expect(result.current.distance).toBe(10);
        expect(result.current.distanceRequestAmount).toBe(500); // 10 * 0.5 * 100
    });

    it('isDistanceRequestWithPendingRoute is true when transaction has no route', () => {
        const {result} = renderHook(() =>
            useDistanceRequestState({
                ...baseParams,
                transaction: {transactionID: 'txn1', comment: {customUnit: {}}} as unknown as OnyxTypes.Transaction,
            }),
        );
        expect(result.current.hasRoute).toBe(false);
        expect(result.current.isDistanceRequestWithPendingRoute).toBe(true);
    });

    it('returns USD currency from the mileage rate', () => {
        const {result} = renderHook(() => useDistanceRequestState(baseParams));
        expect(result.current.currency).toBe('USD');
    });

    it('falls back to USD when mileage rate has no currency and not moving from track expense', () => {
        const {result} = renderHook(() => useDistanceRequestState({...baseParams, isDistanceRequest: false}));
        expect(result.current.currency).toBe('USD');
    });
});
