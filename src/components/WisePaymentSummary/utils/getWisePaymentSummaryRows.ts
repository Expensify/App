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

    /** True for the payment details after payment, which name the amounts in the past tense */
    isPaid?: boolean;

    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/** Rows every quote card shows, counting tax as if Wise always charged one: report total, debit amount, employee amount, fees, tax and FX rate */
const QUOTE_ROW_COUNT = 6;

type PartialPaymentRowParams = Pick<GetWisePaymentSummaryRowsParams, 'report' | 'isPayingUnheldOnly'>;

/** Whether the card adds a row for the part of the report being paid, which differs from the report total */
function hasPartialPaymentRow({report, isPayingUnheldOnly}: PartialPaymentRowParams): boolean {
    return isPayingUnheldOnly || Math.abs(getReimbursableTotal(report)) !== Math.abs(report.total ?? 0);
}

/** The most rows the card can show for this report, known before the quote loads */
function getWisePaymentSummaryRowCount(params: PartialPaymentRowParams): number {
    return QUOTE_ROW_COUNT + (hasPartialPaymentRow(params) ? 1 : 0);
}

/** Amounts for a report Wise pays without a quote: the employee gets the amount being paid, with no fees or conversion */
function getAmountsWithoutQuote({report, isPayingUnheldOnly}: PartialPaymentRowParams): WisePaymentAmounts {
    const amount = Math.abs(isPayingUnheldOnly ? getUnheldReimbursableTotal(report) : getReimbursableTotal(report));
    const currency = report.currency ?? CONST.CURRENCY.USD;
    return {fee: 0, rate: 1, debitedAmount: amount, creditedAmount: amount, currency, paymentCurrency: currency};
}

function getWisePaymentSummaryRows({report, amounts, isPayingUnheldOnly, isPaid = false, translate, convertToDisplayString}: GetWisePaymentSummaryRowsParams): WisePaymentSummaryRow[] {
    // Expense report totals are stored as negative numbers
    const reportTotal = Math.abs(report.total ?? 0);
    const reimbursableTotal = Math.abs(getReimbursableTotal(report));

    const rows: WisePaymentSummaryRow[] = [{label: translate('iou.wisePaymentSummary.reportTotal'), value: convertToDisplayString(reportTotal, report.currency)}];

    if (isPayingUnheldOnly) {
        rows.push({
            label: translate('iou.wisePaymentSummary.unheldAmountBeingPaid'),
            value: convertToDisplayString(Math.abs(getUnheldReimbursableTotal(report)), report.currency),
        });
    } else if (hasPartialPaymentRow({report, isPayingUnheldOnly})) {
        rows.push({label: translate('common.reimbursable'), value: convertToDisplayString(reimbursableTotal, report.currency)});
    }

    rows.push(
        {label: translate(isPaid ? 'iou.wisePaymentSummary.debitedAmount' : 'iou.wisePaymentSummary.debitAmount'), value: convertToDisplayString(amounts.debitedAmount, amounts.currency)},
        {
            label: translate(isPaid ? 'iou.wisePaymentSummary.employeeReceived' : 'iou.wisePaymentSummary.employeeWillReceive'),
            value: convertToDisplayString(amounts.creditedAmount, amounts.paymentCurrency),
        },
        {label: translate('iou.wisePaymentSummary.totalFees'), value: convertToDisplayString(amounts.fee, amounts.currency)},
    );

    if (amounts.tax) {
        rows.push({label: translate('common.tax'), value: convertToDisplayString(amounts.tax, amounts.currency)});
    }

    if (amounts.currency !== amounts.paymentCurrency) {
        // The rate is a float, while convertAmountToDisplayString takes cents and keeps up to four decimals
        const rate = convertAmountToDisplayString(amounts.rate * 100, amounts.paymentCurrency);
        rows.push({label: translate('iou.wisePaymentSummary.fxRate'), value: `${convertToShortDisplayString(100, amounts.currency)} = ${rate}`});
    }

    return rows;
}

export default getWisePaymentSummaryRows;
export {getAmountsWithoutQuote, getWisePaymentSummaryRowCount};
