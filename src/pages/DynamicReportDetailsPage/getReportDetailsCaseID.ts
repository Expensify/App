/**
 * Picks which header DynamicReportDetailsPage renders (HeaderView, MoneyRequestHeader or MoneyReportHeader) from the report's type flags.
 */
import type {CaseID} from './types';

import {CASES} from './types';

type ReportDetailsCaseFlags = {
    isMoneyRequestReport: boolean;
    isInvoiceReport: boolean;
    isMoneyRequest: boolean;
    isTrackExpenseReport: boolean;
};

function getReportDetailsCaseID({isMoneyRequestReport, isInvoiceReport, isMoneyRequest, isTrackExpenseReport}: ReportDetailsCaseFlags): CaseID {
    if (isMoneyRequestReport || isInvoiceReport) {
        // 3. MoneyReportHeader
        return CASES.MONEY_REPORT;
    }
    if (isMoneyRequest || isTrackExpenseReport) {
        // 2. MoneyRequestHeader
        return CASES.MONEY_REQUEST;
    }
    // 1. HeaderView
    return CASES.DEFAULT;
}

export default getReportDetailsCaseID;
