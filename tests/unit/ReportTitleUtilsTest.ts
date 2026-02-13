import Onyx from 'react-native-onyx';
import {getTitleFieldFromRNVP, removeTitleFieldFromReport, shouldUpdateTitleField, updateTitleFieldToMatchPolicy} from '@libs/ReportTitleUtils';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report, ReportNameValuePairs} from '@src/types/onyx';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    getTitleReportField: jest.fn(),
    isChatReport: jest.fn(),
}));
jest.mock('@libs/Permissions', () => ({
    isBetaEnabled: jest.fn().mockReturnValue(true),
}));

const mockedReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('ReportTitleUtils', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();

        const mergedCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS> = {};
        mergedCollection[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}12345`] = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expensify_text_title: {
                defaultValue: 'Report {report:total}',
            },
        } as unknown as ReportNameValuePairs;
        await Onyx.merge(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, mergedCollection);
    });

    describe('getTitleFieldFromRNVP', () => {
        const mockReportID = '12345';
        const mockTitleField = {
            defaultValue: 'Report {report:total}',
        };

        it('should return title field when RNVP exists with title field', () => {
            const result = getTitleFieldFromRNVP(mockReportID);

            expect(result).toEqual(mockTitleField);
        });

        it('should return undefined when RNVP is undefined', () => {
            const result = getTitleFieldFromRNVP('55555');

            expect(result).toBeUndefined();
        });
    });

    describe('updateTitleFieldToMatchPolicy', () => {
        const mockReportID = '12345';
        const mockTitleField: PolicyReportField = {
            defaultValue: 'Test report Title',
        } as unknown as PolicyReportField;

        it('should return optimistic update when valid inputs provided', () => {
            const mockPolicy: Policy = {
                id: 'policy123',
                fieldList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    text_title: mockTitleField,
                },
            } as unknown as Policy;

            mockedReportUtils.getTitleReportField.mockReturnValue(mockTitleField);

            const result = updateTitleFieldToMatchPolicy(mockReportID, mockPolicy);

            expect(mockedReportUtils.getTitleReportField).toHaveBeenCalledWith(mockPolicy.fieldList);
            expect(result).toHaveLength(1);
            expect(result.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockReportID}`,
                value: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expensify_text_title: mockTitleField,
                },
            });
        });

        it('should return empty array when policy is undefined', () => {
            const result = updateTitleFieldToMatchPolicy(mockReportID, undefined);

            expect(result).toEqual([]);
            expect(mockedReportUtils.getTitleReportField).not.toHaveBeenCalled();
        });
    });

    describe('removeTitleFieldFromReport', () => {
        const mockReportID = '12345';

        it('should return optimistic update with null value for valid reportID', () => {
            const result = removeTitleFieldFromReport(mockReportID);

            expect(result).toHaveLength(1);
            expect(result.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockReportID}`,
                value: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expensify_text_title: null,
                },
            });
        });
    });

    describe('shouldUpdateTitleField', () => {
        const mockReportID = '12345';

        it('should return false when report is chat report', () => {
            const mockReport: Report = {
                reportID: mockReportID,
                type: CONST.REPORT.TYPE.CHAT,
            } as Report;

            mockedReportUtils.isChatReport.mockReturnValue(true);

            const result = shouldUpdateTitleField(mockReport);

            expect(mockedReportUtils.isChatReport).toHaveBeenCalledWith(mockReport);
            expect(result).toBe(false);
        });

        it('should return false when report has no title field in RNVP', () => {
            const mockReport: Report = {
                reportID: '5555',
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            mockedReportUtils.isChatReport.mockReturnValue(false);

            const result = shouldUpdateTitleField(mockReport);

            expect(result).toBe(false);
        });

        it('should return true when non-chat report has title field', () => {
            const mockReport: Report = {
                reportID: mockReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            mockedReportUtils.isChatReport.mockReturnValue(false);

            const result = shouldUpdateTitleField(mockReport);

            expect(result).toBe(true);
        });
    });
});
