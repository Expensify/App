import reportByIDsSelector, {reportNameSelector} from '@selectors/ReportAttributes';
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
