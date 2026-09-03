import {renderHook} from '@testing-library/react-native';

import useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import createMock from '../../utils/createMock';

jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {
        getDefaultMileageRate: () => undefined,
        getRate: () => ({rate: 0.5, unit: 'mi', currency: 'USD'}),
        getDistanceRequestAmount: (distance: number, _unit: string, rate: number): number => Math.round(distance * rate * 100),
        getCommuterExclusionDisplayData: (customUnit: {commuterExclusion?: number; reimbursableDistance?: number; distanceUnit?: string} | undefined, distanceUnit: string) => {
            if (!customUnit?.commuterExclusion) {
                return null;
            }
            return {
                commuterExclusion: customUnit.commuterExclusion,
                reimbursableDistance: customUnit.reimbursableDistance ?? 0,
                distanceUnit: customUnit.distanceUnit ?? distanceUnit,
            };
        },
        convertToDistanceInMeters: (distance: number): number => distance,
    },
}));

jest.mock('@libs/TransactionUtils', () => ({
    getDistanceInMeters: (transaction: {comment?: {customUnit?: {routeDistanceMeters?: number}}} | undefined): number => transaction?.comment?.customUnit?.routeDistanceMeters ?? 0,
    hasRoute: (transaction: {comment?: {customUnit?: {routeDistanceMeters?: number}}} | undefined): boolean => !!transaction?.comment?.customUnit?.routeDistanceMeters,
}));

type Params = Parameters<typeof useDistanceRequestState>[0];

const baseParams: Params = {
    transaction: createMock<OnyxTypes.Transaction>({transactionID: 'txn1', comment: {customUnit: {routeDistanceMeters: 10}}}),
    policy: undefined,
    policyID: 'policy1',
    policyForMovingExpenses: undefined,
    isMovingTransactionFromTrackExpense: false,
    isDistanceRequest: true,
    isPolicyExpenseChat: false,
    iouAmount: 0,
    iouCurrencyCode: 'USD',
};

describe('useDistanceRequestState', () => {
    describe('isDistanceRequestWithPendingRoute', () => {
        const homeAndOfficePolicy = createMock<OnyxTypes.Policy>({
            id: 'policy1',
            commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE},
        });

        it('stays pending while the home and office exclusion has not been decided for this workspace yet', () => {
            const {result} = renderHook(() => useDistanceRequestState({...baseParams, policy: homeAndOfficePolicy, isPolicyExpenseChat: true}));

            expect(result.current.isDistanceRequestWithPendingRoute).toBe(true);
        });

        it('stops being pending once the verdict for this workspace arrives', () => {
            const transaction = createMock<OnyxTypes.Transaction>({
                transactionID: 'txn1',
                comment: {customUnit: {routeDistanceMeters: 10}},
                commuterExclusionPreview: {policyID: 'policy1', hasExclusion: false, isWholeTripExcluded: false, commuteDistanceMeters: 0},
            });
            const {result} = renderHook(() => useDistanceRequestState({...baseParams, transaction, policy: homeAndOfficePolicy, isPolicyExpenseChat: true}));

            expect(result.current.isDistanceRequestWithPendingRoute).toBe(false);
        });

        it('does not wait on a verdict that can no longer arrive because the route errored', () => {
            const transaction = createMock<OnyxTypes.Transaction>({
                transactionID: 'txn1',
                comment: {customUnit: {routeDistanceMeters: 10}},
                errorFields: {route: {error: 'oops'}},
            });
            const {result} = renderHook(() => useDistanceRequestState({...baseParams, transaction, policy: homeAndOfficePolicy, isPolicyExpenseChat: true}));

            expect(result.current.isDistanceRequestWithPendingRoute).toBe(false);
        });

        it('does not wait on a verdict for a personal expense that a workspace exclusion cannot govern', () => {
            const {result} = renderHook(() => useDistanceRequestState({...baseParams, policy: homeAndOfficePolicy, isPolicyExpenseChat: false}));

            expect(result.current.isDistanceRequestWithPendingRoute).toBe(false);
        });
    });

    it('shouldCalculateDistanceAmount is true on initial mount when iouAmount is 0', () => {
        const {result} = renderHook(() => useDistanceRequestState(baseParams));
        expect(result.current.shouldCalculateDistanceAmount).toBe(true);
        expect(result.current.distance).toBe(10);
        expect(result.current.distanceRequestAmount).toBe(500); // 10 * 0.5 * 100
    });

    it('recalculates only when the reimbursable distance changes', () => {
        const transaction = baseParams.transaction;
        if (!transaction) {
            throw new Error('Expected a transaction');
        }

        let reimbursableDistance = 8;
        const {result, rerender} = renderHook(() =>
            useDistanceRequestState({
                ...baseParams,
                transaction: {
                    ...transaction,
                    transactionID: 'txn1',
                    comment: {
                        ...transaction.comment,
                        customUnit: {
                            ...transaction.comment?.customUnit,
                            routeDistanceMeters: 10,
                            quantity: 10,
                            distanceUnit: 'mi',
                            commuterExclusion: 2,
                            reimbursableDistance,
                        },
                    },
                },
                iouAmount: 500,
            }),
        );

        expect(result.current.distance).toBe(10);
        expect(result.current.distanceRequestAmount).toBe(400);
        expect(result.current.shouldCalculateDistanceAmount).toBe(false);

        reimbursableDistance = 7;
        rerender(undefined);

        expect(result.current.distanceRequestAmount).toBe(350);
        expect(result.current.shouldCalculateDistanceAmount).toBe(true);

        rerender(undefined);
        expect(result.current.shouldCalculateDistanceAmount).toBe(false);
    });

    it('isDistanceRequestWithPendingRoute is true when transaction has no route', () => {
        const {result} = renderHook(() =>
            useDistanceRequestState({
                ...baseParams,
                transaction: createMock<OnyxTypes.Transaction>({transactionID: 'txn1', comment: {customUnit: {}}}),
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
