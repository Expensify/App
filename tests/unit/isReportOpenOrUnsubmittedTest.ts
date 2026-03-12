import type {OnyxCollection} from 'react-native-onyx';
import {isReportOpenOrUnsubmitted} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

describe('isReportOpenOrUnsubmitted', () => {
    const createReport = (reportID: string, stateNum: number, statusNum: number): Report =>
        ({
            reportID,
            stateNum,
            statusNum,
        }) as Report;

    const createReportsCollection = (reports: Report[]): OnyxCollection<Report> => {
        const collection: OnyxCollection<Report> = {};
        for (const report of reports) {
            collection[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
        }
        return collection;
    };

    describe('returns true for edge cases', () => {
        it('should return true when reportID is undefined', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED)]);

            expect(isReportOpenOrUnsubmitted(undefined, reports)).toBe(true);
        });

        it('should return true when reportID is empty string', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED)]);

            expect(isReportOpenOrUnsubmitted('', reports)).toBe(true);
        });

        it('should return true when reportID is UNREPORTED_REPORT_ID', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED)]);

            expect(isReportOpenOrUnsubmitted(CONST.REPORT.UNREPORTED_REPORT_ID, reports)).toBe(true);
        });

        it('should return true when reports collection is undefined', () => {
            expect(isReportOpenOrUnsubmitted('123', undefined)).toBe(true);
        });

        it('should return true when report does not exist in collection', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED)]);

            expect(isReportOpenOrUnsubmitted('999', reports)).toBe(true);
        });
    });

    describe('returns true for open reports', () => {
        it('should return true when report stateNum is OPEN', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.OPEN, CONST.REPORT.STATUS_NUM.OPEN)]);

            expect(isReportOpenOrUnsubmitted('1', reports)).toBe(true);
        });
    });

    describe('returns false for non-open reports', () => {
        it('should return false when report stateNum is SUBMITTED', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED)]);

            expect(isReportOpenOrUnsubmitted('1', reports)).toBe(false);
        });

        it('should return false when report stateNum is APPROVED', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED)]);

            expect(isReportOpenOrUnsubmitted('1', reports)).toBe(false);
        });

        it('should return false when report stateNum is BILLING', () => {
            const reports = createReportsCollection([createReport('1', CONST.REPORT.STATE_NUM.BILLING, CONST.REPORT.STATUS_NUM.CLOSED)]);

            expect(isReportOpenOrUnsubmitted('1', reports)).toBe(false);
        });
    });

    describe('handles multiple reports correctly', () => {
        it('should check the correct report in a collection with multiple reports', () => {
            const reports = createReportsCollection([
                createReport('1', CONST.REPORT.STATE_NUM.OPEN, CONST.REPORT.STATUS_NUM.OPEN),
                createReport('2', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED),
                createReport('3', CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED),
            ]);

            expect(isReportOpenOrUnsubmitted('1', reports)).toBe(true);
            expect(isReportOpenOrUnsubmitted('2', reports)).toBe(false);
            expect(isReportOpenOrUnsubmitted('3', reports)).toBe(false);
        });
    });
});
