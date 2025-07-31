import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {computeNameForNewReport, computeReportNameIfNeeded, updateOptimisticReportNamesFromUpdates} from '@libs/OptimisticReportNames';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type Report from '@src/types/onyx/Report';
import createCollection from '../utils/collections/createCollection';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock dependencies
jest.mock('@libs/ReportUtils');
jest.mock('@libs/Permissions');
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

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('[OptimisticReportNames] Performance Tests', () => {
    const REPORTS_COUNT = 1000;
    const POLICIES_COUNT = 100;

    const mockPolicy = {
        id: 'policy1',
        name: 'Test Policy',
        fieldList: {
            text_title: {
                defaultValue: '{report:type} - {report:startdate} - {report:total} {report:currency}',
            },
        },
    };

    const mockPolicies = createCollection(
        (item) => `policy_${item.id}`,
        (index) => ({
            ...mockPolicy,
            id: `policy${index}`,
            name: `Policy ${index}`,
        }),
        POLICIES_COUNT,
    );

    const mockReports = createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => ({
            ...createRandomReport(index),
            policyID: `policy${index % POLICIES_COUNT}`,
            total: -(Math.random() * 100000), // Random negative amount
            currency: 'USD',
            lastVisibleActionCreated: new Date().toISOString(),
        }),
        REPORTS_COUNT,
    );

    const mockContext: UpdateContext = {
        betas: ['authAutoReportTitles'],
        allReports: mockReports,
        allPolicies: mockPolicies,
    };

    beforeAll(async () => {
        await Onyx.init({keys: ONYXKEYS});
        mockReportUtils.isExpenseReport.mockReturnValue(true);
        mockReportUtils.getTitleReportField.mockReturnValue(mockPolicy.fieldList.text_title);
        await waitForBatchedUpdates();
    });

    afterAll(() => {
        Onyx.clear();
    });

    describe('Single Report Name Computation', () => {
        test('[OptimisticReportNames] computeNameForNewReport() single report', async () => {
            const update = {
                key: 'report_123',
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: '123',
                    policyID: 'policy1',
                    total: -10000,
                    currency: 'USD',
                    lastVisibleActionCreated: new Date().toISOString(),
                },
            };

            await measureFunction(() => computeNameForNewReport(update, mockContext));
        });

        test('[OptimisticReportNames] computeReportNameIfNeeded() single report', async () => {
            const report = Object.values(mockReports)[0];
            const update = {
                key: `report_${report.reportID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -20000},
            };

            await measureFunction(() => computeReportNameIfNeeded(report, update, mockContext));
        });
    });

    describe('Batch Processing Performance', () => {
        test('[OptimisticReportNames] updateOptimisticReportNamesFromUpdates() with 10 new reports', async () => {
            const updates = Array.from({length: 10}, (_, i) => ({
                key: `report_new${i}`,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `new${i}`,
                    policyID: `policy${i % 10}`,
                    total: -(Math.random() * 50000),
                    currency: 'USD',
                    lastVisibleActionCreated: new Date().toISOString(),
                },
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, mockContext));
        });

        test('[OptimisticReportNames] updateOptimisticReportNamesFromUpdates() with 50 existing report updates', async () => {
            const reportKeys = Object.keys(mockReports).slice(0, 50);
            const updates = reportKeys.map((key, i) => ({
                key,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -(Math.random() * 100000)},
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, mockContext));
        });

        test('[OptimisticReportNames] updateOptimisticReportNamesFromUpdates() with 100 mixed updates', async () => {
            const newReportUpdates = Array.from({length: 50}, (_, i) => ({
                key: `report_batch${i}`,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `batch${i}`,
                    policyID: `policy${i % 20}`,
                    total: -(Math.random() * 75000),
                    currency: 'USD',
                    lastVisibleActionCreated: new Date().toISOString(),
                },
            }));

            const existingReportUpdates = Object.keys(mockReports)
                .slice(0, 50)
                .map((key) => ({
                    key,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: -(Math.random() * 125000)},
                }));

            const allUpdates = [...newReportUpdates, ...existingReportUpdates];

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(allUpdates, mockContext));
        });
    });

    describe('Policy Update Impact Performance', () => {
        test('[OptimisticReportNames] policy update affecting multiple reports', async () => {
            const policyUpdate = {
                key: 'policy_policy1',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: 'Updated Policy Name'},
            };

            // This should trigger name computation for all reports using policy1
            await measureFunction(() => updateOptimisticReportNamesFromUpdates([policyUpdate], mockContext));
        });

        test('[OptimisticReportNames] multiple policy updates', async () => {
            const policyUpdates = Array.from({length: 10}, (_, i) => ({
                key: `policy_policy${i}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: `Bulk Updated Policy ${i}`},
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(policyUpdates, mockContext));
        });
    });

    describe('Large Dataset Performance', () => {
        test('[OptimisticReportNames] processing with large context (1000 reports)', async () => {
            const updates = Array.from({length: 20}, (_, i) => ({
                key: `report_large${i}`,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `large${i}`,
                    policyID: `policy${i % 50}`,
                    total: -(Math.random() * 200000),
                    currency: 'USD',
                    lastVisibleActionCreated: new Date().toISOString(),
                },
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, mockContext));
        });

        test('[OptimisticReportNames] worst case: many irrelevant updates', async () => {
            // Create updates that won't trigger name computation to test filtering performance
            const irrelevantUpdates = Array.from({length: 100}, (_, i) => ({
                key: `transaction_${i}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {description: `Updated transaction ${i}`},
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(irrelevantUpdates, mockContext));
        });
    });

    describe('Edge Cases Performance', () => {
        test('[OptimisticReportNames] reports without formulas', async () => {
            // Mock reports with policies that don't have formulas
            const contextWithoutFormulas: UpdateContext = {
                ...mockContext,
                allPolicies: createCollection(
                    (item) => `policy_${item.id}`,
                    (index) => ({
                        id: `policy${index}`,
                        name: `Policy ${index}`,
                        fieldList: {
                            text_title: {defaultValue: 'Static Title'}, // No formula
                        },
                    }),
                    50,
                ),
            };

            const updates = Array.from({length: 20}, (_, i) => ({
                key: `report_static${i}`,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `static${i}`,
                    policyID: `policy${i % 10}`,
                    total: -10000,
                    currency: 'USD',
                },
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, contextWithoutFormulas));
        });

        test('[OptimisticReportNames] missing policies and reports', async () => {
            const contextWithMissingData: UpdateContext = {
                betas: ['authAutoReportTitles'],
                allReports: {},
                allPolicies: {},
            };

            const updates = Array.from({length: 10}, (_, i) => ({
                key: `report_missing${i}`,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `missing${i}`,
                    policyID: 'nonexistent',
                    total: -10000,
                    currency: 'USD',
                },
            }));

            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, contextWithMissingData));
        });
    });
});
