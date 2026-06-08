import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useConfirmationAmount from '@components/MoneyRequestConfirmationList/hooks/useConfirmationAmount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency ?? 'USD'} ${(amount ?? 0).toFixed(2)}`,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    }),
}));

jest.mock('@libs/actions/IOU/PerDiem', () => ({
    computePerDiemExpenseAmount: ({subRates}: {subRates: Array<{amount: number}>}) => subRates.reduce((sum, r) => sum + (r.amount ?? 0), 0),
}));

type Params = Parameters<typeof useConfirmationAmount>[0];

const baseParams: Params = {
    transaction: {transactionID: 'txn1', amount: 100, comment: {}} as unknown as OnyxTypes.Transaction,
    iouAmount: 100,
    iouCurrencyCode: 'USD',
    iouAttendees: [],
    isDistanceRequest: false,
    isDistanceRequestWithPendingRoute: false,
    shouldCalculateDistanceAmount: false,
    distanceRequestAmount: 250,
    distanceCurrency: 'USD',
    isPerDiemRequest: false,
    prevCurrency: 'USD',
    currency: 'USD',
    prevSubRates: [],
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('useConfirmationAmount', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    it('uses iouAmount when no override applies', () => {
        const {result} = renderHook(() => useConfirmationAmount(baseParams), {wrapper: Wrapper});
        expect(result.current.amountToBeUsed).toBe(100);
        expect(result.current.formattedAmount).toContain('100.00');
    });

    it('distance overrides iouAmount when shouldCalculateDistanceAmount is set', () => {
        const {result} = renderHook(() => useConfirmationAmount({...baseParams, isDistanceRequest: true, shouldCalculateDistanceAmount: true}), {wrapper: Wrapper});
        expect(result.current.amountToBeUsed).toBe(250);
    });

    it('per-diem overrides iouAmount when sub-rates change', () => {
        const subRates = [{amount: 30}, {amount: 70}];
        const {result} = renderHook(
            () =>
                useConfirmationAmount({
                    ...baseParams,
                    iouAmount: 0,
                    isPerDiemRequest: true,
                    prevSubRates: [],
                    transaction: {transactionID: 'txn1', amount: 0, comment: {customUnit: {subRates}}} as unknown as OnyxTypes.Transaction,
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.amountToBeUsed).toBe(100);
    });

    it('formattedAmount is empty string for distance request with pending route', () => {
        const {result} = renderHook(() => useConfirmationAmount({...baseParams, isDistanceRequest: true, isDistanceRequestWithPendingRoute: true}), {wrapper: Wrapper});
        expect(result.current.formattedAmount).toBe('');
        expect(result.current.formattedAmountPerAttendee).toBe('');
    });

    it('divides amount by attendee count for per-attendee total', () => {
        const {result} = renderHook(() => useConfirmationAmount({...baseParams, iouAttendees: [{accountID: 1}, {accountID: 2}, {accountID: 3}, {accountID: 4}] as Params['iouAttendees']}), {
            wrapper: Wrapper,
        });
        // 100 / 4 = 25
        expect(result.current.formattedAmountPerAttendee).toContain('25.00');
    });
});
