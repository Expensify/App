import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import {computeReportNameIfNeeded, updateOptimisticReportNamesFromUpdates} from '@libs/OptimisticReportNames';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    // jest.requireActual is necessary to include multi-layered module imports (eg. Report.ts has processReportIDDeeplink() which uses parseReportRouteParams() imported from getReportIDFromUrl.ts)
    // Without jest.requireActual, parseReportRouteParams would be undefined, causing the test to fail.
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    // These methods are mocked below in the beforeAll function to return specific values
    isExpenseReport: jest.fn(),
    getTitleReportField: jest.fn(),
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
            text_title: {
                defaultValue: '{report:type} - {report:startdate} - {report:total} {report:currency}',
            },
        },
    } as unknown as Policy;

    const mockPolicies = createCollection<Policy>(
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
            ...createRandomReport(index, undefined),
            policyID: `policy${index % POLICIES_COUNT}`,
            total: -(Math.random() * 100000), // Random negative amount
            currency: 'USD',
            lastVisibleActionCreated: new Date().toISOString(),
        }),
        REPORTS_COUNT,
    );

    const mockContext: UpdateContext = {
        betas: [CONST.BETAS.CUSTOM_REPORT_NAMES],
        betaConfiguration: {},
        allReports: mockReports,
        allPolicies: mockPolicies,
        allReportNameValuePairs: {},
        allTransactions: {},
        isOffline: false,
    };

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        mockReportUtils.isExpenseReport.mockReturnValue(true);
        mockReportUtils.getTitleReportField.mockReturnValue(mockPolicy.fieldList?.text_title);
        await waitForBatchedUpdates();
    });

    afterAll(() => {
        Onyx.clear();
    });

    describe('Single Report Name Computation', () => {
        test('[OptimisticReportNames] computeReportNameIfNeeded() single report', async () => {
            const report = Object.values(mockReports).at(0);
            const update = {
                key: `report_${report?.reportID}` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -20000},
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => computeReportNameIfNeeded(report, update, mockContext));
        });
    });

    describe('Batch Processing Performance', () => {
        test('[OptimisticReportNames] updateOptimisticReportNamesFromUpdates() with 10 new reports', async () => {
            const updates = Array.from({length: 10}, (_, i) => ({
                key: `report_new${i}` as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `new${i}`,
                    policyID: `policy${i % 10}`,
                    total: -(Math.random() * 50000),
                    currency: 'USD',
                    lastVisibleActionCreated: new Date().toISOString(),
                },
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, mockContext));
        });

        test('[OptimisticReportNames] updateOptimisticReportNamesFromUpdates() with 50 existing report updates', async () => {
            const reportKeys = Object.keys(mockReports).slice(0, 50) as OnyxKey[];
            const updates = reportKeys.map((key) => ({
                key,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -(Math.random() * 100000)},
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, mockContext));
        });

        test('[OptimisticReportNames] updateOptimisticReportNamesFromUpdates() with 100 mixed updates', async () => {
            const newReportUpdates = Array.from({length: 50}, (_, i) => ({
                key: `report_batch${i}` as OnyxKey,
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
                    key: key as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: -(Math.random() * 125000)},
                }));

            const allUpdates = [...newReportUpdates, ...existingReportUpdates];

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(allUpdates, mockContext));
        });
    });

    describe('Policy Update Impact Performance', () => {
        test('[OptimisticReportNames] policy update affecting multiple reports', async () => {
            const policyUpdate = {
                key: 'policy_policy1' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: 'Updated Policy Name'},
            };

            // This should trigger name computation for all reports using policy1
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates([policyUpdate], mockContext));
        });

        test('[OptimisticReportNames] multiple policy updates', async () => {
            const policyUpdates = Array.from({length: 10}, (_, i) => ({
                key: `policy_policy${i}` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: `Bulk Updated Policy ${i}`},
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(policyUpdates, mockContext));
        });
    });

    describe('Large Dataset Performance', () => {
        test('[OptimisticReportNames] processing with large context (1000 reports)', async () => {
            const updates = Array.from({length: 1000}, (_, i) => ({
                key: `report_large${i}` as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `large${i}`,
                    policyID: `policy${i % 50}`,
                    total: -(Math.random() * 200000),
                    currency: 'USD',
                    lastVisibleActionCreated: new Date().toISOString(),
                },
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, mockContext));
        });

        test('[OptimisticReportNames] worst case: many irrelevant updates', async () => {
            // Create updates that won't trigger name computation to test filtering performance
            const irrelevantUpdates = Array.from({length: 100}, (_, i) => ({
                key: `transaction_${i}` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {description: `Updated transaction ${i}`},
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
                    (index) =>
                        ({
                            id: `policy${index}`,
                            name: `Policy ${index}`,
                            fieldList: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                text_title: {
                                    name: 'Title',
                                    defaultValue: 'Static Title',
                                    fieldID: 'text_title',
                                    orderWeight: 0,
                                    type: 'text' as const,
                                    deletable: true,
                                    values: [],
                                    keys: [],
                                    externalIDs: [],
                                    disabledOptions: [],
                                    isTax: false,
                                },
                            },
                        }) as unknown as Policy,
                    50,
                ),
                allReportNameValuePairs: {},
                isOffline: false,
            };

            const updates = Array.from({length: 20}, (_, i) => ({
                key: `report_static${i}` as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `static${i}`,
                    policyID: `policy${i % 10}`,
                    total: -10000,
                    currency: 'USD',
                },
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, contextWithoutFormulas));
        });

        test('[OptimisticReportNames] missing policies and reports', async () => {
            const contextWithMissingData: UpdateContext = {
                betas: [CONST.BETAS.CUSTOM_REPORT_NAMES],
                betaConfiguration: {},
                allReports: {},
                allPolicies: {},
                allReportNameValuePairs: {},
                allTransactions: {},
                isOffline: false,
            };

            const updates = Array.from({length: 10}, (_, i) => ({
                key: `report_missing${i}` as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: `missing${i}`,
                    policyID: 'nonexistent',
                    total: -10000,
                    currency: 'USD',
                },
            }));

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => updateOptimisticReportNamesFromUpdates(updates, contextWithMissingData));
        });
    });
});
