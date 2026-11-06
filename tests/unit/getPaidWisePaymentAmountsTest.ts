import getPaidWisePaymentAmounts, {getLatestPaidWisePaymentAmounts, isCrossBorderWisePayment} from '@components/WisePaymentSummary/utils/getPaidWisePaymentAmounts';

import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';

import createMock from '../utils/createMock';

const wisePayment: Partial<OriginalMessageIOU> = {
    fee: 129,
    rate: 0.7743,
    debitedAmount: 13044,
    creditedAmount: 10000,
    currency: CONST.CURRENCY.USD,
    creditedCurrency: CONST.CURRENCY.GBP,
};

function buildPayAction(reportActionID: string, created: string, payment: Partial<OriginalMessageIOU>): ReportAction {
    return createMock<ReportAction>({
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created,
        message: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY, paymentType: CONST.IOU.PAYMENT_TYPE.VBBA, ...payment},
    });
}

describe('getPaidWisePaymentAmounts', () => {
    it('reads the final amounts the backend adds to the pay action', () => {
        // Given a pay action that Wise has created the transfer for
        const action = buildPayAction('1', '2026-11-05 10:00:00.000', {...wisePayment, tax: 25});

        // When its amounts are read
        const amounts = getPaidWisePaymentAmounts(action);

        // Then the payment details get every amount Wise reported, in the shape the summary card takes, with the employee's currency as the payment currency
        expect(amounts).toEqual({fee: 129, rate: 0.7743, debitedAmount: 13044, creditedAmount: 10000, currency: CONST.CURRENCY.USD, paymentCurrency: CONST.CURRENCY.GBP, tax: 25});
    });

    it('returns nothing until the backend adds the Wise amounts', () => {
        // Given a pay action posted at Pay, before Wise created the transfer
        const action = buildPayAction('1', '2026-11-05 10:00:00.000', {currency: CONST.CURRENCY.USD});

        // When its amounts are read
        // Then there are none, so the message stays the regular paid message without a link
        expect(getPaidWisePaymentAmounts(action)).toBeUndefined();
    });

    it('ignores actions that are not payments', () => {
        // Given an expense created with the same amount fields
        const action = createMock<ReportAction>({
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, ...wisePayment},
        });

        // When its amounts are read
        // Then only a pay action can carry a Wise payment
        expect(getPaidWisePaymentAmounts(action)).toBeUndefined();
    });

    it('treats only a payment into another currency as cross-border', () => {
        // Given one payment converted to GBP and one paid out in the company's own currency
        const crossBorder = getPaidWisePaymentAmounts(buildPayAction('1', '2026-11-05 10:00:00.000', wisePayment));
        const sameCurrency = getPaidWisePaymentAmounts(buildPayAction('2', '2026-11-05 10:00:00.000', {...wisePayment, rate: 1, creditedCurrency: CONST.CURRENCY.USD}));

        // When each is checked
        // Then only the converted one has fees and a rate to disclose behind View details
        expect(crossBorder && isCrossBorderWisePayment(crossBorder)).toBe(true);
        expect(sameCurrency && isCrossBorderWisePayment(sameCurrency)).toBe(false);
    });

    describe('getLatestPaidWisePaymentAmounts', () => {
        it('picks the payment that stands when the report was paid again', () => {
            // Given a payment that was cancelled and a later one with a different rate
            const cancelledPayment = buildPayAction('1', '2026-11-05 10:00:00.000', wisePayment);
            const laterPayment = buildPayAction('2', '2026-11-06 10:00:00.000', {...wisePayment, rate: 0.75});
            const reportActions: ReportActions = {[cancelledPayment.reportActionID]: cancelledPayment, [laterPayment.reportActionID]: laterPayment};

            // When the payment details read the report's actions
            const amounts = getLatestPaidWisePaymentAmounts(reportActions);

            // Then they show the later payment
            expect(amounts?.rate).toBe(0.75);
        });
    });
});
