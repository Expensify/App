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
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: mockTitleField,
            });

            const result = getTitleFieldFromRNVP(mockReportID);

            expect(mockedReportUtils.getReportNameValuePairs).toHaveBeenCalledWith(mockReportID);
            expect(result).toEqual(mockTitleField);
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
            defaultValue: '',
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

    describe('updateTitleFieldWithExactValue', () => {
        const mockReportID = '12345';

        it('should return optimistic update with exact value', () => {
            const policyTitleField = 'Exact Title Value';

            const result = updateTitleFieldWithExactValue(mockReportID, policyTitleField);

            expect(result).toHaveLength(1);
            expect(result.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${mockReportID}`,
                value: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expensify_text_title: policyTitleField,
                },
            });
        });

        it('should create update with empty string value', () => {
            const result = updateTitleFieldWithExactValue(mockReportID, '');

            expect(result).toHaveLength(1);
            expect(result.at(0)?.value).toEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: '',
            });
        });

        it('should handle special characters in title field', () => {
            const specialTitle = 'Title with "quotes" & <tags>';

            const result = updateTitleFieldWithExactValue(mockReportID, specialTitle);

            expect(result.at(0)?.value).toEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: specialTitle,
            });
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
        const mockTitleField = {
            defaultValue: 'Test Title',
        };

        beforeEach(() => {
            mockedReportUtils.getReportNameValuePairs.mockReturnValue({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: mockTitleField,
            });
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
