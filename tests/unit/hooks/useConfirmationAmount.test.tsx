import {renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useConfirmationAmount from '@components/MoneyRequestConfirmationList/hooks/useConfirmationAmount';

import type * as PerDiem from '@libs/actions/IOU/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency ?? 'USD'} ${(amount ?? 0).toFixed(2)}`,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    }),
}));

jest.mock('@libs/actions/IOU/PerDiem', () => ({
    computePerDiemExpenseAmount: ({subRates}: Parameters<typeof PerDiem.computePerDiemExpenseAmount>[0]) => (subRates ?? []).reduce((sum, {quantity, rate}) => sum + quantity * rate, 0),
}));

type Params = Parameters<typeof useConfirmationAmount>[0];

const baseParams: Params = {
    transaction: createMock<OnyxTypes.Transaction>({transactionID: 'txn1', amount: 100, comment: {}}),
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
        const subRates = [
            createMock<Params['prevSubRates'][number]>({id: 'subRate1', quantity: 1, name: 'Breakfast', rate: 30}),
            createMock<Params['prevSubRates'][number]>({id: 'subRate2', quantity: 1, name: 'Dinner', rate: 70}),
        ];
        const {result} = renderHook(
            () =>
                useConfirmationAmount({
                    ...baseParams,
                    iouAmount: 0,
                    isPerDiemRequest: true,
                    prevSubRates: [],
                    transaction: createMock<OnyxTypes.Transaction>({transactionID: 'txn1', amount: 0, comment: {customUnit: {subRates}}}),
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
        const iouAttendees = Array.from({length: 4}, () => createMock<Params['iouAttendees'][number]>({}));
        const {result} = renderHook(() => useConfirmationAmount({...baseParams, iouAttendees}), {
            wrapper: Wrapper,
        });
        // 100 / 4 = 25
        expect(result.current.formattedAmountPerAttendee).toContain('25.00');
    });

    it('formattedAmount is empty string for a failed-scan amount placeholder', () => {
        const {result} = renderHook(
            () =>
                useConfirmationAmount({
                    ...baseParams,
                    iouAmount: 0,
                    transaction: createMock<OnyxTypes.Transaction>({
                        transactionID: 'txn1',
                        amount: 0,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
                        comment: {},
                    }),
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.formattedAmount).toBe('');
    });

    it('formattedAmount is not blanked once the failed-scan amount is confirmed', () => {
        const {result} = renderHook(
            () =>
                useConfirmationAmount({
                    ...baseParams,
                    iouAmount: 0,
                    transaction: createMock<OnyxTypes.Transaction>({
                        transactionID: 'txn1',
                        amount: 0,
                        modifiedAmount: 0,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
                        comment: {},
                    }),
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.formattedAmount).toContain('0.00');
    });
});
