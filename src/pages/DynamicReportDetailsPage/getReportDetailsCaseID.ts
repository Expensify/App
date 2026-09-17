import {isInvoiceReport, isMoneyRequest, isMoneyRequestReport, isTrackExpenseReportNew} from '@libs/ReportUtils';

import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {CaseID} from './types';

import {CASES} from './types';

/**
 * Picks which header variant the details page mirrors: MoneyReportHeader (expense/invoice report),
 * MoneyRequestHeader (single transaction thread or tracked expense) or the plain HeaderView.
 */
function getReportDetailsCaseID(report: OnyxEntry<Report>, parentReport: OnyxEntry<Report>, parentReportAction: OnyxEntry<ReportAction>): CaseID {
    if (isMoneyRequestReport(report) || isInvoiceReport(report)) {
        return CASES.MONEY_REPORT;
    }
    if (isMoneyRequest(report) || isTrackExpenseReportNew(report, parentReport, parentReportAction)) {
        return CASES.MONEY_REQUEST;
    }
    return CASES.DEFAULT;
}

export default getReportDetailsCaseID;
