import {isBillReport, shouldHideBillReport} from '@libs/BillUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

describe('BillUtils', () => {
    describe('isBillReport', () => {
        it.each([
            {type: CONST.REPORT.UNSUPPORTED_TYPE.BILL, expected: true},
            {type: CONST.REPORT.TYPE.INVOICE, expected: false},
            {type: CONST.REPORT.TYPE.EXPENSE, expected: false},
        ])('returns $expected for a $type report', ({type, expected}) => {
            // Given a report of one type
            const report: Report = {reportID: '1', type};

            // When we check whether it's a bill
            // Then only bills match, so invoices and expense reports keep their own flows
            expect(isBillReport(report)).toBe(expected);
        });

        it('returns false when the report is missing', () => {
            // Given a report that isn't loaded yet
            // When we check whether it's a bill
            // Then it doesn't count as a bill
            expect(isBillReport(undefined)).toBe(false);
        });
    });

    describe('shouldHideBillReport', () => {
        it.each([
            {reportType: CONST.REPORT.UNSUPPORTED_TYPE.BILL, isBillPayBetaEnabled: false, expected: true},
            {reportType: CONST.REPORT.UNSUPPORTED_TYPE.BILL, isBillPayBetaEnabled: true, expected: false},
            {reportType: CONST.REPORT.UNSUPPORTED_TYPE.PAYCHECK, isBillPayBetaEnabled: false, expected: false},
            {reportType: CONST.REPORT.TYPE.INVOICE, isBillPayBetaEnabled: false, expected: false},
        ])('returns $expected for $reportType when isBillPayBetaEnabled is $isBillPayBetaEnabled', ({reportType, isBillPayBetaEnabled, expected}) => {
            // Given a report type and the user's newDotBillPay beta state
            // When the report screen checks whether to hide the report
            // Then only bills are hidden, and only from users without the beta
            expect(shouldHideBillReport(reportType, isBillPayBetaEnabled)).toBe(expected);
        });
    });
});
