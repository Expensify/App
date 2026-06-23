import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useConfirmationCtaText from '@components/MoneyRequestConfirmationList/hooks/useConfirmationCtaText';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type Params = Parameters<typeof useConfirmationCtaText>[0];

const baseParams: Params = {
    expensesNumber: 1,
    isTypeInvoice: false,
    isTypeTrackExpense: false,
    isTypeSplit: false,
    isTypeRequest: false,
    iouAmount: 100,
    iouType: CONST.IOU.TYPE.SUBMIT,
    policy: undefined,
    formattedAmount: '$1.00',
    receiptPath: '',
    isDistanceRequestWithPendingRoute: false,
    isPerDiemRequest: false,
    isNewManualExpenseFlowEnabled: false,
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('useConfirmationCtaText', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    it('returns a single-entry array tagged with iouType', () => {
        const {result} = renderHook(() => useConfirmationCtaText(baseParams), {wrapper: Wrapper});
        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)?.value).toBe(CONST.IOU.TYPE.SUBMIT);
    });

    it('uses createExpenses copy for multiple expenses', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, expensesNumber: 3}), {wrapper: Wrapper});
        expect(result.current.at(0)?.text.toLowerCase()).toContain('expense');
    });

    it('uses splitExpense copy for split with zero amount', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, isTypeSplit: true, iouAmount: 0}), {wrapper: Wrapper});
        expect(result.current.at(0)?.text.toLowerCase()).toContain('split');
    });

    it('uses createExpense copy for track expense with zero amount', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, isTypeTrackExpense: true, iouType: CONST.IOU.TYPE.TRACK, iouAmount: 0}), {wrapper: Wrapper});
        expect(result.current.at(0)?.text.toLowerCase()).toContain('expense');
    });

    it('uses createExpense copy when new manual expense flow is enabled', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, isNewManualExpenseFlowEnabled: true}), {wrapper: Wrapper});
        expect(result.current.at(0)?.text.toLowerCase()).toContain('expense');
    });

    it('includes formatted amount in createExpenseWithAmount copy', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, formattedAmount: '$42.00'}), {wrapper: Wrapper});
        expect(result.current.at(0)?.text).toContain('$42.00');
    });

    it('uses next copy for invoice without invoicing details', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, isTypeInvoice: true, iouType: CONST.IOU.TYPE.INVOICE}), {
            wrapper: Wrapper,
        });
        expect(result.current.at(0)?.text.toLowerCase()).toContain('next');
    });

    it('capitalizes the first letter of the CTA text', () => {
        const {result} = renderHook(() => useConfirmationCtaText(baseParams), {wrapper: Wrapper});
        const text = result.current.at(0)?.text ?? '';
        expect(text.length).toBeGreaterThan(0);
        expect(text[0]).toBe(text[0].toUpperCase());
    });

    it('includes formatted amount in sendInvoice copy when invoicing details are present', () => {
        const policy = {invoice: {companyName: 'Acme', companyWebsite: 'acme.com'}} as Params['policy'];
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, isTypeInvoice: true, iouType: CONST.IOU.TYPE.INVOICE, policy, formattedAmount: '$50.00'}), {
            wrapper: Wrapper,
        });
        expect(result.current.at(0)?.text).toContain('$50.00');
    });

    it('includes formatted amount for track expense with non-zero amount', () => {
        const {result} = renderHook(
            () =>
                useConfirmationCtaText({
                    ...baseParams,
                    isTypeTrackExpense: true,
                    iouType: CONST.IOU.TYPE.TRACK,
                    iouAmount: 100,
                    formattedAmount: '$1.23',
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.at(0)?.text).toContain('$1.23');
    });

    it('uses createExpense for distance request with pending route', () => {
        const {result} = renderHook(
            () =>
                useConfirmationCtaText({
                    ...baseParams,
                    isTypeRequest: true,
                    isDistanceRequestWithPendingRoute: true,
                    iouAmount: 0,
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.at(0)?.text.toLowerCase()).toContain('expense');
    });

    it('uses createExpenseWithAmount for per-diem request with non-zero amount', () => {
        const {result} = renderHook(
            () =>
                useConfirmationCtaText({
                    ...baseParams,
                    isPerDiemRequest: true,
                    iouAmount: 200,
                    formattedAmount: '$2.00',
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.at(0)?.text).toContain('$2.00');
    });

    it('uses splitAmount with formatted amount for split with non-zero amount when manual flow is disabled', () => {
        const {result} = renderHook(
            () =>
                useConfirmationCtaText({
                    ...baseParams,
                    isTypeSplit: true,
                    iouAmount: 500,
                    formattedAmount: '$5.00',
                    isNewManualExpenseFlowEnabled: false,
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.at(0)?.text).toContain('$5.00');
    });

    it('uses createExpense for default zero-amount fallback', () => {
        const {result} = renderHook(() => useConfirmationCtaText({...baseParams, iouAmount: 0}), {wrapper: Wrapper});
        expect(result.current.at(0)?.text.toLowerCase()).toContain('expense');
        // No formatted amount appended when amount is zero
        expect(result.current.at(0)?.text).not.toContain('$');
    });
});
