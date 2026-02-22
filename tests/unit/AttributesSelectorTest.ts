import {reportByIDsSelector} from '@selectors/Attributes';
import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAttributes, ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

describe('AttributesSelector', () => {
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ReportAttributes contains reportErrors
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
});
