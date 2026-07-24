import {getDerivedReportNameByReportID} from '@libs/ReportAttributesUtils';
import type {ReportNamesByID} from '@libs/ReportAttributesUtils';

const REPORT_ID_1 = 'reportID1';
const REPORT_ID_2 = 'reportID2';

const REPORT_NAMES: ReportNamesByID = {
    [REPORT_ID_1]: 'Report 1',
    [REPORT_ID_2]: undefined,
};

describe('getDerivedReportNameByReportID', () => {
    it("should return the report's name for a matching reportID", () => {
        expect(getDerivedReportNameByReportID(REPORT_NAMES, REPORT_ID_1)).toBe('Report 1');
    });

    it('should return undefined when the reportID is undefined', () => {
        expect(getDerivedReportNameByReportID(REPORT_NAMES, undefined)).toBeUndefined();
    });

    it('should return undefined when the reportID is missing from the map', () => {
        expect(getDerivedReportNameByReportID(REPORT_NAMES, 'nonExistentReportID')).toBeUndefined();
    });

    it('should return undefined when the reportID maps to an undefined name', () => {
        expect(getDerivedReportNameByReportID(REPORT_NAMES, REPORT_ID_2)).toBeUndefined();
    });

    it('should return undefined when the names map is undefined', () => {
        expect(getDerivedReportNameByReportID(undefined, REPORT_ID_1)).toBeUndefined();
    });

    it('should return undefined when both arguments are undefined', () => {
        expect(getDerivedReportNameByReportID(undefined, undefined)).toBeUndefined();
    });
});
