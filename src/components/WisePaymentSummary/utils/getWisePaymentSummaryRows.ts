import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {WisePaymentAmounts, WisePaymentSummaryRow} from '@components/WisePaymentSummary/types';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {convertAmountToDisplayString, convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getReimbursableTotal, getUnheldReimbursableTotal} from '@libs/ReportUtils';

import type {Report} from '@src/types/onyx';

type GetWisePaymentSummaryRowsParams = {
    report: Pick<Report, 'currency' | 'total' | 'nonReimbursableTotal' | 'reimbursableTotal' | 'unheldTotal' | 'unheldNonReimbursableTotal' | 'unheldReimbursableTotal'>;
    amounts: WisePaymentAmounts;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;

    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

function getWisePaymentSummaryRows({report, amounts, isPayingUnheldOnly, translate, convertToDisplayString}: GetWisePaymentSummaryRowsParams): WisePaymentSummaryRow[] {
    // Expense report totals are stored as negative numbers
    const reportTotal = Math.abs(report.total ?? 0);
    const reimbursableTotal = Math.abs(getReimbursableTotal(report));

    const rows: WisePaymentSummaryRow[] = [{label: translate('iou.wisePaymentSummary.reportTotal'), value: convertToDisplayString(reportTotal, report.currency)}];

    if (isPayingUnheldOnly) {
        rows.push({
            label: translate('iou.wisePaymentSummary.unheldAmountBeingPaid'),
            value: convertToDisplayString(Math.abs(getUnheldReimbursableTotal(report)), report.currency),
        });
    } else if (reimbursableTotal !== reportTotal) {
        rows.push({label: translate('common.reimbursable'), value: convertToDisplayString(reimbursableTotal, report.currency)});
    }

    rows.push(
        {label: translate('iou.wisePaymentSummary.debitAmount'), value: convertToDisplayString(amounts.debitedAmount, amounts.currency)},
        {label: translate('iou.wisePaymentSummary.employeeWillReceive'), value: convertToDisplayString(amounts.creditedAmount, amounts.paymentCurrency)},
        {label: translate('iou.wisePaymentSummary.totalFees'), value: convertToDisplayString(amounts.fee, amounts.currency)},
    );

    if (amounts.tax) {
        rows.push({label: translate('common.tax'), value: convertToDisplayString(amounts.tax, amounts.currency)});
    }

    // The rate is a float, while convertAmountToDisplayString takes cents and keeps up to four decimals
    const rate = convertAmountToDisplayString(amounts.rate * 100, amounts.paymentCurrency);
    rows.push({label: translate('iou.wisePaymentSummary.fxRate'), value: `${convertToShortDisplayString(100, amounts.currency)} = ${rate}`});

    return rows;
}

export default getWisePaymentSummaryRows;
