import type {ReportAttributes, ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';

import reportByIDsSelector, {reportNameSelector, reportNamesByIDsSelector} from '@selectors/ReportAttributes';

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

    describe('reportNamesByIDsSelector', () => {
        it('selects the display and raw names of the requested reports', () => {
            // Given an archived room, whose display name differs from its raw report name, and a report that is not requested
            const roomID = '1';
            const otherReportID = '2';
            const attributes: OnyxEntry<ReportAttributesDerivedValue> = {
                reports: {
                    [roomID]: {reportName: '#room (archived) ', rawReportName: '#room', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                    [otherReportID]: {reportName: 'Other', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                },
                locale: 'en',
            };

            // When selecting the names of the room and of a report that has no attributes
            const result = reportNamesByIDsSelector(attributes, [roomID, '999', undefined]);

            // Then only the room is selected, with both names, so LHN rows can name mentioned rooms without reading every report
            expect(result).toEqual({[roomID]: {reportName: '#room (archived) ', rawReportName: '#room'}});
        });
    });
});
