import Onyx from 'react-native-onyx';
import {getTitleFieldFromRNVP, removeTitleFieldFromReport, shouldUpdateTitleField, updateTitleFieldToMatchPolicy, updateTitleFieldWithExactValue} from '@libs/ReportTitleUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    getReportNameValuePairs: jest.fn(),
    getTitleReportField: jest.fn(),
    isChatReport: jest.fn(),
}));

const mockedReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('ReportTitleUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTitleFieldFromRNVP', () => {
        const mockReportID = '12345';
        const mockTitleField = {
            defaultValue: 'Test Title',
        };

        it('should return title field when RNVP exists with title field', () => {
            mockedReportUtils.getReportNameValuePairs.mockReturnValue({
                [CONST.REPORT.REPORT_TITLE_FIELD]: mockTitleField,
            });

            const result = getTitleFieldFromRNVP(mockReportID);

            expect(mockedReportUtils.getReportNameValuePairs).toHaveBeenCalledWith(mockReportID);
            expect(result).toEqual(mockTitleField);
        });

        it('should return undefined when RNVP exists but has no title field', () => {
            mockedReportUtils.getReportNameValuePairs.mockReturnValue({
                otherField: 'value',
            });

            const result = getTitleFieldFromRNVP(mockReportID);

            expect(result).toBeUndefined();
        });

        it('should return undefined when RNVP is null', () => {
            mockedReportUtils.getReportNameValuePairs.mockReturnValue(null);

            const result = getTitleFieldFromRNVP(mockReportID);

            expect(result).toBeUndefined();
        });

        it('should return undefined when RNVP is undefined', () => {
            mockedReportUtils.getReportNameValuePairs.mockReturnValue(undefined);

            const result = getTitleFieldFromRNVP(mockReportID);

            expect(result).toBeUndefined();
        });
    });

    describe('updateTitleFieldToMatchPolicy', () => {
        const mockReportID = '12345';
        const mockTitleField: PolicyReportField = {
            fieldID: 'title_field_1',
            name: 'Title',
            type: 'text',
            value: 'Policy Title',
            defaultValue: '',
            deletable: false,
            orderWeight: 1,
        };

        it('should return optimistic update when valid inputs provided', () => {
            const mockPolicy: Policy = {
                id: 'policy123',
                fieldList: {
                    field1: mockTitleField,
                },
            } as Policy;

            mockedReportUtils.getTitleReportField.mockReturnValue(mockTitleField);

            const result = updateTitleFieldToMatchPolicy(mockReportID, mockPolicy);

            expect(mockedReportUtils.getTitleReportField).toHaveBeenCalledWith(mockPolicy.fieldList);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockReportID}`,
                value: {
                    [CONST.REPORT.REPORT_TITLE_FIELD]: mockTitleField,
                },
            });
        });

        it('should return empty array when policy is undefined', () => {
            const result = updateTitleFieldToMatchPolicy(mockReportID, undefined);

            expect(result).toEqual([]);
            expect(mockedReportUtils.getTitleReportField).not.toHaveBeenCalled();
        });

        it('should return empty array when policy has fieldList but no title field', () => {
            const mockPolicy: Policy = {
                id: 'policy123',
                fieldList: {
                    field1: {
                        fieldID: 'other_field',
                        name: 'Other',
                        type: 'text',
                    } as PolicyReportField,
                },
            } as Policy;

            mockedReportUtils.getTitleReportField.mockReturnValue(undefined);

            const result = updateTitleFieldToMatchPolicy(mockReportID, mockPolicy);

            expect(result).toEqual([]);
        });
    });

    describe('updateTitleFieldWithExactValue', () => {
        const mockReportID = '12345';

        it('should return optimistic update with exact value', () => {
            const policyTitleField = 'Exact Title Value';

            const result = updateTitleFieldWithExactValue(mockReportID, policyTitleField);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockReportID}`,
                value: {
                    [CONST.REPORT.REPORT_TITLE_FIELD]: policyTitleField,
                },
            });
        });

        it('should create update with empty string value', () => {
            const result = updateTitleFieldWithExactValue(mockReportID, '');

            expect(result).toHaveLength(1);
            expect(result[0].value[CONST.REPORT.REPORT_TITLE_FIELD]).toBe('');
        });

        it('should handle special characters in title field', () => {
            const specialTitle = 'Title with "quotes" & <tags>';

            const result = updateTitleFieldWithExactValue(mockReportID, specialTitle);

            expect(result[0].value[CONST.REPORT.REPORT_TITLE_FIELD]).toBe(specialTitle);
        });
    });

    describe('removeTitleFieldFromReport', () => {
        const mockReportID = '12345';

        it('should return optimistic update with null value for valid reportID', () => {
            const result = removeTitleFieldFromReport(mockReportID);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockReportID}`,
                value: {
                    [CONST.REPORT.REPORT_TITLE_FIELD]: null,
                },
            });
        });
    });

    describe('shouldUpdateTitleField', () => {
        const mockReportID = '12345';
        const mockTitleField = {
            defaultValue: 'Test Title',
        };

        beforeEach(() => {
            mockedReportUtils.getReportNameValuePairs.mockReturnValue({
                [CONST.REPORT.REPORT_TITLE_FIELD]: mockTitleField,
            });
        });

        it('should return false when report is null', () => {
            const result = shouldUpdateTitleField(null);

            expect(result).toBe(false);
            expect(mockedReportUtils.isChatReport).not.toHaveBeenCalled();
        });

        it('should return false when report is undefined', () => {
            const result = shouldUpdateTitleField(undefined);

            expect(result).toBe(false);
            expect(mockedReportUtils.isChatReport).not.toHaveBeenCalled();
        });

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
                reportID: mockReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            mockedReportUtils.isChatReport.mockReturnValue(false);
            mockedReportUtils.getReportNameValuePairs.mockReturnValue({});

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

            expect(mockedReportUtils.isChatReport).toHaveBeenCalledWith(mockReport);
            expect(result).toBe(true);
        });

        it('should return true for IOU report with title field', () => {
            const mockReport: Report = {
                reportID: mockReportID,
                type: CONST.REPORT.TYPE.IOU,
            } as Report;

            mockedReportUtils.isChatReport.mockReturnValue(false);

            const result = shouldUpdateTitleField(mockReport);

            expect(result).toBe(true);
        });
    });
});
