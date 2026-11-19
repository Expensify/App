import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {WisePaymentAmounts, WisePaymentSummaryRow} from '@components/WisePaymentSummary/types';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {convertAmountToDisplayString, convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getReimbursableTotal, getUnheldReimbursableTotal} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

type GetWisePaymentSummaryRowsParams = {
    report: Pick<Report, 'currency' | 'total' | 'nonReimbursableTotal' | 'reimbursableTotal' | 'unheldTotal' | 'unheldNonReimbursableTotal' | 'unheldReimbursableTotal'>;
    amounts: WisePaymentAmounts;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;

    /** True for the payment details after payment, which show their own rows */
    isPaid?: boolean;

    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/** Rows every card shows: reimbursable amount, fees, company amount, employee amount and FX rate. Wise adds a tax row in some corridors */
const WISE_PAYMENT_SUMMARY_ROW_COUNT = 5;

type AmountBeingPaidParams = Pick<GetWisePaymentSummaryRowsParams, 'report' | 'isPayingUnheldOnly'>;

/** The reimbursable amount Wise sends, which leaves out the expenses on hold when the admin pays only the rest */
function getAmountBeingPaid({report, isPayingUnheldOnly}: AmountBeingPaidParams): number {
    // Expense report totals are stored as negative numbers
    return Math.abs(isPayingUnheldOnly ? getUnheldReimbursableTotal(report) : getReimbursableTotal(report));
}

/** Amounts for a report Wise pays without a quote: the employee gets the amount being paid, with no fees or conversion */
function getAmountsWithoutQuote(params: AmountBeingPaidParams): WisePaymentAmounts {
    const amount = getAmountBeingPaid(params);
    const currency = params.report.currency ?? CONST.CURRENCY.USD;
    return {fee: 0, rate: 1, debitedAmount: amount, creditedAmount: amount, currency, paymentCurrency: currency};
}

function getFXRate({rate, currency, paymentCurrency}: WisePaymentAmounts, translate: LocaleContextProps['translate']): string {
    if (currency === paymentCurrency) {
        return translate('common.na');
    }
    // The rate is a float, while convertAmountToDisplayString takes cents and keeps up to four decimals
    return `${convertToShortDisplayString(100, currency)} = ${convertAmountToDisplayString(rate * 100, paymentCurrency)}`;
}

/** Rows of the payment details after payment */
function getPaidWisePaymentSummaryRows({report, amounts, translate, convertToDisplayString}: GetWisePaymentSummaryRowsParams): WisePaymentSummaryRow[] {
    // Expense report totals are stored as negative numbers
    const reportTotal = Math.abs(report.total ?? 0);
    const reimbursableTotal = Math.abs(getReimbursableTotal(report));

    const rows: WisePaymentSummaryRow[] = [{label: translate('iou.wisePaymentSummary.reportTotal'), value: convertToDisplayString(reportTotal, report.currency)}];

    if (reimbursableTotal !== reportTotal) {
        rows.push({label: translate('common.reimbursable'), value: convertToDisplayString(reimbursableTotal, report.currency)});
    }

    rows.push(
        {label: translate('iou.wisePaymentSummary.debitedAmount'), value: convertToDisplayString(amounts.debitedAmount, amounts.currency)},
        {label: translate('iou.wisePaymentSummary.employeeReceived'), value: convertToDisplayString(amounts.creditedAmount, amounts.paymentCurrency)},
        {label: translate('iou.wisePaymentSummary.totalFees'), value: convertToDisplayString(amounts.fee, amounts.currency)},
    );

    if (amounts.tax) {
        rows.push({label: translate('common.tax'), value: convertToDisplayString(amounts.tax, amounts.currency)});
    }

    rows.push({label: translate('iou.wisePaymentSummary.fxRate'), value: getFXRate(amounts, translate)});

    return rows;
}

/** Ordered so the reimbursable amount plus the fees add up to what the company pays, as Wise requires before payment */
function getWisePaymentSummaryRows(params: GetWisePaymentSummaryRowsParams): WisePaymentSummaryRow[] {
    const {report, amounts, isPayingUnheldOnly, isPaid = false, translate, convertToDisplayString} = params;
    if (isPaid) {
        return getPaidWisePaymentSummaryRows(params);
    }

    const rows: WisePaymentSummaryRow[] = [
        {label: translate('common.reimbursable'), value: convertToDisplayString(getAmountBeingPaid({report, isPayingUnheldOnly}), report.currency)},
        {label: translate('iou.wisePaymentSummary.totalFees'), value: convertToDisplayString(amounts.fee, amounts.currency)},
    ];

    if (amounts.tax) {
        rows.push({label: translate('common.tax'), value: convertToDisplayString(amounts.tax, amounts.currency)});
    }

    rows.push(
        {label: translate('iou.wisePaymentSummary.companyWillPay'), value: convertToDisplayString(amounts.debitedAmount, amounts.currency)},
        {label: translate('iou.wisePaymentSummary.employeeWillReceive'), value: convertToDisplayString(amounts.creditedAmount, amounts.paymentCurrency)},
        {label: translate('iou.wisePaymentSummary.fxRate'), value: getFXRate(amounts, translate)},
    );

    return rows;
}

export default getWisePaymentSummaryRows;
export {WISE_PAYMENT_SUMMARY_ROW_COUNT, getAmountsWithoutQuote};
