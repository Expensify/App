import reportByIDsSelector, {getReportAttributeByID, reportNamesByReportIDsSelector, reportNameSelector} from '@selectors/Attributes';
import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAttributes, ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

describe('ReportAttributesSelector', () => {
    describe('reportByIDsSelector', () => {
        const reportID = '1';
        const reportAttributes: ReportAttributes = {
            reportName: 'Test Report',
            isEmpty: false,
            brickRoadStatus: undefined,
            requiresAttention: false,
            reportErrors: {},
        };

        const attributes: OnyxEntry<ReportAttributesDerivedValue> = {
            reports: {
                [reportID]: reportAttributes,
            },
            locale: 'en',
        };

        it('should return report attributes for matching report IDs', () => {
            const result = reportByIDsSelector([reportID])(attributes);
            expect(result).toMatchObject({[reportID]: {reportName: 'Test Report'}});
        });

        it('should return empty object when attributes is undefined', () => {
            const result = reportByIDsSelector([reportID])(undefined);
            expect(result).toEqual({});
        });

        it('should skip report IDs that do not exist in attributes', () => {
            const result = reportByIDsSelector([reportID, '999'])(attributes);
            expect(result).toMatchObject({[reportID]: {reportName: 'Test Report'}});
        });
    });

    describe('getReportAttributeByID', () => {
        const reportID = '1';
        const reportAttributes: ReportAttributes = {
            reportName: 'Test Report',
            isEmpty: false,
            brickRoadStatus: undefined,
            requiresAttention: false,
            reportErrors: {},
        };
        const map: Record<string, ReportAttributes> = {
            [reportID]: reportAttributes,
        };

        it('should return the entry for an existing reportID', () => {
            expect(getReportAttributeByID(map, reportID)).toBe(reportAttributes);
        });

        it('should return undefined when reportID is undefined', () => {
            expect(getReportAttributeByID(map, undefined)).toBeUndefined();
        });

        it('should return undefined when the map is undefined', () => {
            expect(getReportAttributeByID(undefined, reportID)).toBeUndefined();
        });

        it('should return undefined when reportID does not exist in the map', () => {
            expect(getReportAttributeByID(map, '999')).toBeUndefined();
        });
    });

    describe('reportNamesByReportIDsSelector', () => {
        const reportID1 = '1';
        const reportID2 = '2';
        const reportAttributes: ReportAttributes = {
            reportName: 'Test Report',
            isEmpty: false,
            brickRoadStatus: undefined,
            requiresAttention: false,
            reportErrors: {},
        };
        const attributes: OnyxEntry<ReportAttributesDerivedValue> = {
            reports: {
                [reportID1]: reportAttributes,
                [reportID2]: {...reportAttributes, reportName: 'Second Report'},
            },
            locale: 'en',
        };

        it('should return only the reportName for the matching report IDs', () => {
            const result = reportNamesByReportIDsSelector([reportID1, reportID2])(attributes);
            expect(result).toEqual({[reportID1]: {reportName: 'Test Report'}, [reportID2]: {reportName: 'Second Report'}});
        });

        it('should skip undefined and non-existent report IDs', () => {
            const result = reportNamesByReportIDsSelector([reportID1, undefined, '999'])(attributes);
            expect(result).toEqual({[reportID1]: {reportName: 'Test Report'}});
        });

        it('should return an empty object when attributes is undefined', () => {
            const result = reportNamesByReportIDsSelector([reportID1])(undefined);
            expect(result).toEqual({});
        });
    });

    describe('reportNameSelector', () => {
        const reportID = '1';
        const reportAttributes: ReportAttributes = {
            reportName: 'Test Report',
            isEmpty: false,
            brickRoadStatus: undefined,
            requiresAttention: false,
            reportErrors: {},
        };

        const attributes: OnyxEntry<ReportAttributesDerivedValue> = {
            reports: {
                [reportID]: reportAttributes,
            },
            locale: 'en',
        };

        it('should return the report name for the matching report ID', () => {
            const result = reportNameSelector(attributes, reportID);
            expect(result).toBe('Test Report');
        });

        it('should return undefined when the report ID is undefined', () => {
            const result = reportNameSelector(attributes, undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined when the report ID does not exist in attributes', () => {
            const result = reportNameSelector(attributes, '999');
            expect(result).toBeUndefined();
        });

        it('should return undefined when attributes is undefined', () => {
            const result = reportNameSelector(undefined, reportID);
            expect(result).toBeUndefined();
        });
    });
});
