import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import * as OptimisticReportNames from '@libs/OptimisticReportNames';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import {createCollection} from '../utils/collections/createCollection';
import {createRandomPolicy} from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    isExpenseReport: jest.fn(),
    getTitleReportField: jest.fn(),
    getReportTransactions: jest.fn(),
}));
jest.mock('@libs/Performance', () => ({
    markStart: jest.fn(),
    markEnd: jest.fn(),
}));
jest.mock('@libs/actions/Timing', () => ({
    start: jest.fn(),
    end: jest.fn(),
}));
jest.mock('@libs/Log', () => ({
    info: jest.fn(),
}));
jest.mock('@libs/Permissions', () => ({
    canUseCustomReportNames: jest.fn(() => true),
}));

type MockedReportUtils = jest.Mocked<typeof ReportUtils>;
const mockReportUtils = ReportUtils as MockedReportUtils;

const mockTitleField = {
    defaultValue: 'Report from {report:policyname} on {report:startdate}',
    type: CONST.REPORT.REPORT_FIELD_TYPES.TEXT,
    key: 'title',
};

describe('[OptimisticReportNames] Performance Tests', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    afterAll(() => {
        Onyx.clear();
    });

    const mockReports = createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) =>
            createRandomReport(index, {
                type: CONST.REPORT.TYPE.EXPENSE,
            }),
        100,
    );

    const mockPolicies = createCollection<Policy>(
        (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
        (index) =>
            createRandomPolicy(index, {
                fieldList: {
                    title: mockTitleField,
                },
            }),
        10,
    );

    const mockContext: UpdateContext = {
        betas: [CONST.BETAS.AUTH_AUTO_REPORT_TITLE],
        allReports: mockReports,
        allPolicies: mockPolicies,
        allReportNameValuePairs: {},
        allTransactions: {},
    };

    beforeAll(async () => {
        mockReportUtils.getTitleReportField.mockReturnValue(mockTitleField);
    });

    describe('updateOptimisticReportNamesFromUpdates', () => {
        test('should handle small batches of report updates efficiently', async () => {
            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => {
                        const updates = Array.from({length: 5}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: 'Updated Report',
                                total: Math.floor(Math.random() * 10000),
                            } as Report,
                        }));
                        return OptimisticReportNames.updateOptimisticReportNamesFromUpdates(updates, mockContext);
                    }),
                {runs: 20},
            );
        });

        test('should handle medium batches of report updates efficiently', async () => {
            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => {
                        const updates = Array.from({length: 25}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: 'Updated Report',
                                total: Math.floor(Math.random() * 10000),
                            } as Report,
                        }));
                        return OptimisticReportNames.updateOptimisticReportNamesFromUpdates(updates, mockContext);
                    }),
                {runs: 20},
            );
        });

        test('should handle large batches of report updates efficiently', async () => {
            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => {
                        const updates = Array.from({length: 100}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: 'Updated Report',
                                total: Math.floor(Math.random() * 10000),
                            } as Report,
                        }));
                        return OptimisticReportNames.updateOptimisticReportNamesFromUpdates(updates, mockContext);
                    }),
                {runs: 20},
            );
        });

        test('should handle policy updates that affect many reports efficiently', async () => {
            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => {
                        const updates = Array.from({length: 3}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                name: `Updated Policy ${i}`,
                                fieldList: {
                                    title: mockTitleField,
                                },
                            } as Policy,
                        }));
                        return OptimisticReportNames.updateOptimisticReportNamesFromUpdates(updates, mockContext);
                    }),
                {runs: 20},
            );
        });

        test('should handle mixed update types efficiently', async () => {
            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => {
                        const reportUpdates = Array.from({length: 15}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: `Updated Report ${i}`,
                                total: Math.floor(Math.random() * 10000),
                            } as Report,
                        }));

                        const policyUpdates = Array.from({length: 2}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                name: `Updated Policy ${i}`,
                                fieldList: {
                                    title: mockTitleField,
                                },
                            } as Policy,
                        }));

                        const updates = [...reportUpdates, ...policyUpdates];
                        return OptimisticReportNames.updateOptimisticReportNamesFromUpdates(updates, mockContext);
                    }),
                {runs: 20},
            );
        });

        test('should handle empty updates gracefully', async () => {
            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => OptimisticReportNames.updateOptimisticReportNamesFromUpdates([], mockContext)),
                {runs: 20},
            );
        });

        test('should handle updates with no matching data efficiently', async () => {
            const emptyContext: UpdateContext = {
                betas: [CONST.BETAS.AUTH_AUTO_REPORT_TITLE],
                allReports: {},
                allPolicies: {},
                allReportNameValuePairs: {},
                allTransactions: {},
            };

            await measurePerformance(
                <T,>(scenario: () => T) =>
                    scenario(() => {
                        const updates = Array.from({length: 10}, (_, i) => ({
                            key: `${ONYXKEYS.COLLECTION.REPORT}nonexistent_${i}` as const,
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: `Report ${i}`,
                            } as Report,
                        }));

                        return OptimisticReportNames.updateOptimisticReportNamesFromUpdates(updates, emptyContext);
                    }),
                {runs: 20},
            );
        });
    });

    describe('computeReportNameIfNeeded', () => {
        test('should compute report names efficiently for existing reports', async () => {
            const report = Object.values(mockReports)[0];
            const update = {
                key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}` as const,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    total: 5000,
                } as Report,
            };

            await measurePerformance(
                <T,>(scenario: () => T) => scenario(() => OptimisticReportNames.computeReportNameIfNeeded(report, update, mockContext)),
                {runs: 100},
            );
        });

        test('should compute report names efficiently for new reports', async () => {
            const newReport = createRandomReport(999, {
                type: CONST.REPORT.TYPE.EXPENSE,
            });

            const update = {
                key: `${ONYXKEYS.COLLECTION.REPORT}${newReport.reportID}` as const,
                onyxMethod: Onyx.METHOD.SET,
                value: newReport,
            };

            await measurePerformance(
                <T,>(scenario: () => T) => scenario(() => OptimisticReportNames.computeReportNameIfNeeded(undefined, update, mockContext)),
                {runs: 100},
            );
        });
    });
});