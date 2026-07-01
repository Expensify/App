import {getDerivedReportNameByReportID} from '@libs/ReportAttributesUtils';

describe('ReportAttributesUtils', () => {
    describe('getDerivedReportNameByReportID', () => {
        const reportID = '1';
        const reportNames = {[reportID]: {reportName: 'Test Report'}};

        it('should return the name for an existing reportID', () => {
            expect(getDerivedReportNameByReportID(reportNames, reportID)).toBe('Test Report');
        });

        it('should return undefined when reportID is undefined', () => {
            expect(getDerivedReportNameByReportID(reportNames, undefined)).toBeUndefined();
        });

        it('should return undefined when the map is undefined', () => {
            expect(getDerivedReportNameByReportID(undefined, reportID)).toBeUndefined();
        });

        it('should return undefined when reportID does not exist in the map', () => {
            expect(getDerivedReportNameByReportID(reportNames, '999')).toBeUndefined();
        });
    });
});
