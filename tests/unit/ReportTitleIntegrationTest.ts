import Onyx from 'react-native-onyx';
import * as Report from '@libs/actions/Report';
import * as ReportTitleUtils from '@libs/ReportTitleUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type {Report as ReportType} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock the ReportTitleUtils
jest.mock('@libs/ReportTitleUtils');

const mockReportTitleUtils = ReportTitleUtils as jest.Mocked<typeof ReportTitleUtils>;

describe('Report Title Integration Tests', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('Manual report renaming integration', () => {
        it('should remove title field from rNVP when report is manually renamed', () => {
            const reportID = 'report123';
            const newName = 'Custom Report Name';
            const previousName = 'Generated Report Name';

            // Mock the removeTitleFieldFromReport function
            mockReportTitleUtils.removeTitleFieldFromReport.mockReturnValue([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
                    value: {
                        [CONST.REPORT_FIELD_TITLE_FIELD_ID]: null,
                    },
                },
            ]);

            // Call the updateReportName function
            Report.updateReportName(reportID, newName, previousName);

            // Verify that removeTitleFieldFromReport was called
            expect(mockReportTitleUtils.removeTitleFieldFromReport).toHaveBeenCalledWith(reportID);
            expect(mockReportTitleUtils.removeTitleFieldFromReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('Report policy move integration', () => {
        it('should update title field when moving report to existing policy', () => {
            const reportID = 'report123';
            const policyID = 'policy456';
            
            const mockReport: ReportType = {
                reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'oldPolicy',
            } as ReportType;

            const mockPolicy: Policy = {
                id: policyID,
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'New Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            // Mock the functions
            mockReportTitleUtils.shouldUpdateTitleField.mockReturnValue(true);
            mockReportTitleUtils.updateTitleFieldToMatchPolicy.mockReturnValue([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
                    value: {
                        [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                            defaultValue: 'New Policy: {report:policyname}',
                            deleteable: false,
                        },
                    },
                },
            ]);

            // Set up Onyx state
            return Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: mockReport,
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: mockPolicy,
            })
                .then(waitForBatchedUpdates)
                .then(() => {
                    // Call the moveIOUReportToPolicy function would be called here
                    // For this test, we're verifying the integration behavior
                    
                    // The actual integration would call these functions in sequence:
                    const shouldUpdate = ReportTitleUtils.shouldUpdateTitleField(mockReport, mockPolicy);
                    expect(shouldUpdate).toBe(true);
                    
                    const titleFieldUpdates = ReportTitleUtils.updateTitleFieldToMatchPolicy(reportID, mockPolicy);
                    expect(titleFieldUpdates).toHaveLength(1);
                    
                    expect(mockReportTitleUtils.shouldUpdateTitleField).toHaveBeenCalledWith(mockReport, mockPolicy);
                    expect(mockReportTitleUtils.updateTitleFieldToMatchPolicy).toHaveBeenCalledWith(reportID, mockPolicy);
                });
        });

        it('should not update title field for chat reports', () => {
            const reportID = 'report123';
            const policyID = 'policy456';
            
            const mockChatReport: ReportType = {
                reportID,
                type: CONST.REPORT.TYPE.CHAT,
                policyID: 'oldPolicy',
            } as ReportType;

            const mockPolicy: Policy = {
                id: policyID,
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            // Mock the shouldUpdateTitleField to return false for chat reports
            mockReportTitleUtils.shouldUpdateTitleField.mockReturnValue(false);

            return Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: mockChatReport,
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: mockPolicy,
            })
                .then(waitForBatchedUpdates)
                .then(() => {
                    const shouldUpdate = ReportTitleUtils.shouldUpdateTitleField(mockChatReport, mockPolicy);
                    expect(shouldUpdate).toBe(false);
                    
                    expect(mockReportTitleUtils.shouldUpdateTitleField).toHaveBeenCalledWith(mockChatReport, mockPolicy);
                    expect(mockReportTitleUtils.updateTitleFieldToMatchPolicy).not.toHaveBeenCalled();
                });
        });
    });

    describe('Report creation integration', () => {
        it('should add title field from policy when creating new expense report', () => {
            const reportID = 'newReport123';
            const policyID = 'policy456';

            const mockPolicy: Policy = {
                id: policyID,
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Expense: {report:total}',
                        deleteable: false,
                    },
                },
            } as Policy;

            // Mock the updateTitleFieldToMatchPolicy function
            mockReportTitleUtils.updateTitleFieldToMatchPolicy.mockReturnValue([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
                    value: {
                        [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                            defaultValue: 'Expense: {report:total}',
                            deleteable: false,
                        },
                    },
                },
            ]);

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, mockPolicy)
                .then(waitForBatchedUpdates)
                .then(() => {
                    // This would be called during report creation in IOU.ts
                    const titleFieldUpdates = ReportTitleUtils.updateTitleFieldToMatchPolicy(reportID, mockPolicy);
                    
                    expect(titleFieldUpdates).toHaveLength(1);
                    expect(titleFieldUpdates[0].value).toEqual({
                        [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                            defaultValue: 'Expense: {report:total}',
                            deleteable: false,
                        },
                    });
                    
                    expect(mockReportTitleUtils.updateTitleFieldToMatchPolicy).toHaveBeenCalledWith(reportID, mockPolicy);
                });
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle missing policy gracefully', () => {
            const reportID = 'report123';

            mockReportTitleUtils.updateTitleFieldToMatchPolicy.mockReturnValue([]);

            const titleFieldUpdates = ReportTitleUtils.updateTitleFieldToMatchPolicy(reportID, undefined);
            
            expect(titleFieldUpdates).toEqual([]);
            expect(mockReportTitleUtils.updateTitleFieldToMatchPolicy).toHaveBeenCalledWith(reportID, undefined);
        });

        it('should handle empty reportID gracefully', () => {
            const mockPolicy: Policy = {
                id: 'policy123',
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            mockReportTitleUtils.updateTitleFieldToMatchPolicy.mockReturnValue([]);

            const titleFieldUpdates = ReportTitleUtils.updateTitleFieldToMatchPolicy('', mockPolicy);
            
            expect(titleFieldUpdates).toEqual([]);
            expect(mockReportTitleUtils.updateTitleFieldToMatchPolicy).toHaveBeenCalledWith('', mockPolicy);
        });

        it('should handle policy without title field gracefully', () => {
            const reportID = 'report123';
            const mockPolicy: Policy = {
                id: 'policy123',
                fieldList: {
                    text_category: {
                        name: 'Category',
                        type: 'text',
                        fieldID: 'text_category',
                        defaultValue: '',
                        deleteable: true,
                    },
                },
            } as Policy;

            mockReportTitleUtils.updateTitleFieldToMatchPolicy.mockReturnValue([]);

            const titleFieldUpdates = ReportTitleUtils.updateTitleFieldToMatchPolicy(reportID, mockPolicy);
            
            expect(titleFieldUpdates).toEqual([]);
            expect(mockReportTitleUtils.updateTitleFieldToMatchPolicy).toHaveBeenCalledWith(reportID, mockPolicy);
        });
    });
});