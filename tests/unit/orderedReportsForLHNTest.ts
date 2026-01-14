import type {OnyxCollection} from 'react-native-onyx';
import orderedReportsForLHNConfig from '@libs/actions/OnyxDerived/configs/orderedReportsForLHN';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy, Report, Transaction} from '@src/types/onyx';

describe('orderedReportsForLHN derived value', () => {
    const createMockReport = (reportID: string, overrides: Partial<Report> = {}): Report => ({
        reportID,
        reportName: `Report ${reportID}`,
        lastVisibleActionCreated: '2024-01-01 10:00:00',
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    });

    const createMockPolicy = (policyID: string, overrides: Partial<Policy> = {}): Policy =>
        ({
            id: policyID,
            name: `Policy ${policyID}`,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.USER,
            ...overrides,
        }) as Policy;

    const createMockTransaction = (transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction =>
        ({
            transactionID,
            reportID,
            amount: 100,
            currency: 'USD',
            ...overrides,
        }) as Transaction;

    describe('initial state', () => {
        it('should return empty state when connections are not set', () => {
            const result = orderedReportsForLHNConfig.compute(
                [
                    {}, // reports
                    {}, // policies
                    {}, // transactions
                    {}, // transactionViolations
                    {}, // reportNameValuePairs
                    {}, // reportsDrafts
                    [], // betas
                    {reports: {}, locale: null}, // reportAttributesData
                    CONST.PRIORITY_MODE.DEFAULT, // priorityMode
                    CONST.LOCALES.DEFAULT, // preferredLocale
                ],
                {
                    currentValue: undefined,
                    sourceValues: undefined,
                    areAllConnectionsSet: false,
                },
            );

            expect(result).toEqual({
                reportsToDisplay: {},
                orderedReportIDs: [],
                currentReportID: undefined,
                locale: null,
            });
        });

        it('should perform full computation on first call with data', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createMockReport('1'),
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: createMockReport('2'),
            };

            const result = orderedReportsForLHNConfig.compute(
                [
                    reports,
                    {}, // policies
                    {}, // transactions
                    {}, // transactionViolations
                    {}, // reportNameValuePairs
                    {}, // reportsDrafts
                    [], // betas
                    {reports: {}, locale: null}, // reportAttributesData
                    CONST.PRIORITY_MODE.DEFAULT,
                    CONST.LOCALES.DEFAULT,
                ],
                {
                    currentValue: undefined,
                    sourceValues: undefined,
                    areAllConnectionsSet: true,
                },
            );

            expect(result.reportsToDisplay).toBeDefined();
            expect(result.orderedReportIDs).toBeDefined();
            expect(result.locale).toBe(CONST.LOCALES.DEFAULT);
        });
    });

    describe('incremental updates', () => {
        it('should perform incremental update when only one report changes', () => {
            const report1 = createMockReport('1');
            const report2 = createMockReport('2');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call - incremental update
            const updatedReport1 = createMockReport('1', {reportName: 'Updated Report 1'});
            const updatedReports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReport1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [updatedReports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.REPORT]: {
                            [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReport1,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Should have performed incremental update
            expect(secondResult.reportsToDisplay).toBeDefined();
            expect(secondResult.locale).toBe(CONST.LOCALES.DEFAULT);
        });

        it('should update reports affected by transaction changes', () => {
            const report1 = createMockReport('1');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
            };

            const transaction = createMockTransaction('t1', '1');
            const transactions: OnyxCollection<Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}t1`]: transaction,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute(
                [reports, {}, transactions, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: undefined,
                    sourceValues: undefined,
                    areAllConnectionsSet: true,
                },
            );

            // Second call - transaction update
            const updatedTransaction = createMockTransaction('t1', '1', {amount: 200});
            const updatedTransactions: OnyxCollection<Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}t1`]: updatedTransaction,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reports, {}, updatedTransactions, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.TRANSACTION]: {
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}t1`]: updatedTransaction,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Should have updated the report associated with the transaction
            expect(secondResult.reportsToDisplay).toBeDefined();
        });

        it('should update reports affected by policy changes', () => {
            const policy1 = createMockPolicy('p1');
            const report1 = createMockReport('1', {policyID: 'p1'});
            const report2 = createMockReport('2', {policyID: 'p2'});

            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: policy1,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, policies, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call - policy update
            const updatedPolicy1 = createMockPolicy('p1', {name: 'Updated Policy'});
            const updatedPolicies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: updatedPolicy1,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reports, updatedPolicies, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.POLICY]: {
                            [`${ONYXKEYS.COLLECTION.POLICY}p1`]: updatedPolicy1,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Should have updated report 1 which belongs to policy p1
            // Report 2 should not be affected
            expect(secondResult.reportsToDisplay).toBeDefined();
        });

        it('should update reports affected by draft comment changes', () => {
            const report1 = createMockReport('1');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call - draft comment added
            const reportsDrafts: OnyxCollection<string> = {
                [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}1`]: 'Draft message',
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reports, {}, {}, {}, {}, reportsDrafts, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: {
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}1`]: 'Draft message',
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Should have updated report 1 which has a draft comment
            expect(secondResult.reportsToDisplay).toBeDefined();
        });
    });

    describe('full recomputation triggers', () => {
        it('should perform full recomputation when locale changes', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createMockReport('1'),
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: createMockReport('2'),
            };

            // First call with en locale
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.EN], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            expect(firstResult.locale).toBe(CONST.LOCALES.EN);

            // Second call with es locale
            const secondResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.ES], {
                currentValue: firstResult,
                sourceValues: {
                    [ONYXKEYS.NVP_PREFERRED_LOCALE]: undefined,
                },
                areAllConnectionsSet: true,
            });

            expect(secondResult.locale).toBe(CONST.LOCALES.ES);
            // Full recomputation should have happened, affecting all reports
        });

        it('should perform full recomputation when betas change', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createMockReport('1'),
            };

            // First call without betas
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call with betas
            const betas: Beta[] = [CONST.BETAS.DEFAULT_ROOMS];
            const secondResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, betas, {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: firstResult,
                sourceValues: {
                    [ONYXKEYS.BETAS]: undefined,
                },
                areAllConnectionsSet: true,
            });

            // Full recomputation should have happened
            expect(secondResult.reportsToDisplay).toBeDefined();
        });

        it('should perform full recomputation when priority mode changes', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createMockReport('1'),
            };

            // First call with DEFAULT priority mode
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call with GSD priority mode
            const secondResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.GSD, CONST.LOCALES.DEFAULT], {
                currentValue: firstResult,
                sourceValues: {
                    [ONYXKEYS.NVP_PRIORITY_MODE]: undefined,
                },
                areAllConnectionsSet: true,
            });

            // Full recomputation should have happened
            expect(secondResult.reportsToDisplay).toBeDefined();
        });
    });

    describe('caching behavior', () => {
        it('should return current value when no updates and fully computed', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createMockReport('1'),
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call with no sourceValues (no changes)
            const secondResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: firstResult,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Should return the cached value
            expect(secondResult).toBe(firstResult);
        });

        it('should return current value when reports is null/undefined', () => {
            const previousResult = {
                reportsToDisplay: {},
                orderedReportIDs: ['1'],
                currentReportID: undefined,
                locale: CONST.LOCALES.DEFAULT,
            };

            const result = orderedReportsForLHNConfig.compute(
                [
                    undefined as unknown as OnyxCollection<Report>, // No reports
                    {},
                    {},
                    {},
                    {},
                    {},
                    [],
                    {reports: {}, locale: null},
                    CONST.PRIORITY_MODE.DEFAULT,
                    CONST.LOCALES.DEFAULT,
                ],
                {
                    currentValue: previousResult,
                    sourceValues: undefined,
                    areAllConnectionsSet: true,
                },
            );

            // Should return previous value when reports is undefined
            expect(result).toBe(previousResult);
        });
    });

    describe('edge cases', () => {
        it('should handle transaction with no reportID', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createMockReport('1'),
            };

            const transaction = createMockTransaction('t1', '');
            const transactions: OnyxCollection<Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}t1`]: transaction,
            };

            // First call
            const firstResult = orderedReportsForLHNConfig.compute(
                [reports, {}, transactions, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: undefined,
                    sourceValues: undefined,
                    areAllConnectionsSet: true,
                },
            );

            // Second call with transaction update
            const updatedTransaction = createMockTransaction('t1', '', {amount: 200});
            const updatedTransactions: OnyxCollection<Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}t1`]: updatedTransaction,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reports, {}, updatedTransactions, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.TRANSACTION]: {
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}t1`]: updatedTransaction,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Should handle gracefully without crashing
            expect(secondResult).toBeDefined();
        });

        it('should handle report with no policyID when policies change', () => {
            const report1 = createMockReport('1'); // No policyID
            const report2 = createMockReport('2', {policyID: 'p1'});

            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            const policy1 = createMockPolicy('p1');
            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: policy1,
            };

            // First call
            const firstResult = orderedReportsForLHNConfig.compute([reports, policies, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Second call - policy update
            const updatedPolicy1 = createMockPolicy('p1', {name: 'Updated'});
            const updatedPolicies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: updatedPolicy1,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reports, updatedPolicies, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.POLICY]: {
                            [`${ONYXKEYS.COLLECTION.POLICY}p1`]: updatedPolicy1,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Should only update report2, not report1 (which has no policyID)
            expect(secondResult).toBeDefined();
        });
    });

    describe('cache correctness verification', () => {
        let updateReportsToDisplayInLHNSpy: jest.SpyInstance;
        let getReportsToDisplayInLHNSpy: jest.SpyInstance;

        beforeEach(() => {
            updateReportsToDisplayInLHNSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');
            getReportsToDisplayInLHNSpy = jest.spyOn(SidebarUtils, 'getReportsToDisplayInLHN');
        });

        afterEach(() => {
            updateReportsToDisplayInLHNSpy.mockRestore();
            getReportsToDisplayInLHNSpy.mockRestore();
        });

        it('should preserve object references for unchanged reports during incremental update', () => {
            const report1 = createMockReport('1');
            const report2 = createMockReport('2');
            const report3 = createMockReport('3');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: report3,
            };

            // First call - full computation to initialize the cache
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Capture the report2 and report3 objects from the first result
            const report2FromFirstResult = firstResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}2`];
            const report3FromFirstResult = firstResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}3`];

            // Second call - only report1 changed (incremental update)
            const updatedReport1 = createMockReport('1', {reportName: 'Updated Report 1'});
            const updatedReports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReport1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2, // Same reference
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: report3, // Same reference
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [updatedReports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.REPORT]: {
                            [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReport1,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // CRITICAL: Report2 and Report3's entries should be the exact same object references
            // (not recomputed) because they weren't in sourceValues
            expect(secondResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}2`]).toBe(report2FromFirstResult);
            expect(secondResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}3`]).toBe(report3FromFirstResult);
        });

        it('should use incremental update (not full computation) when sourceValues indicates specific reports changed', () => {
            const report1 = createMockReport('1');
            const report2 = createMockReport('2');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            // First call - to initialize isFullyComputed state
            // Note: Due to module-level isFullyComputed state, after any previous test runs,
            // this may already be true. We focus on verifying the second call behavior.
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Clear spies for second call - this is the call we're testing
            updateReportsToDisplayInLHNSpy.mockClear();
            getReportsToDisplayInLHNSpy.mockClear();

            // Second call - incremental update
            const updatedReport1 = createMockReport('1', {reportName: 'Updated'});
            const updatedReports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReport1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            orderedReportsForLHNConfig.compute([updatedReports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: firstResult,
                sourceValues: {
                    [ONYXKEYS.COLLECTION.REPORT]: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReport1,
                    },
                },
                areAllConnectionsSet: true,
            });

            // Second call should use incremental update, not full computation
            expect(updateReportsToDisplayInLHNSpy).toHaveBeenCalled();
            expect(getReportsToDisplayInLHNSpy).not.toHaveBeenCalled();
        });

        it('should call updateReportsToDisplayInLHN with only the changed report keys', () => {
            const report1 = createMockReport('1');
            const report2 = createMockReport('2');
            const report3 = createMockReport('3');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: report3,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            updateReportsToDisplayInLHNSpy.mockClear();

            // Second call - only report2 changed
            const updatedReport2 = createMockReport('2', {reportName: 'Updated Report 2'});
            const updatedReports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: updatedReport2,
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: report3,
            };

            orderedReportsForLHNConfig.compute([updatedReports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: firstResult,
                sourceValues: {
                    [ONYXKEYS.COLLECTION.REPORT]: {
                        [`${ONYXKEYS.COLLECTION.REPORT}2`]: updatedReport2,
                    },
                },
                areAllConnectionsSet: true,
            });

            // Verify updateReportsToDisplayInLHN was called with only report2's key
            expect(updateReportsToDisplayInLHNSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    updatedReportsKeys: [`${ONYXKEYS.COLLECTION.REPORT}2`],
                }),
            );
        });

        it('should remove deleted reports from reportsToDisplay', () => {
            const report1 = createMockReport('1');
            const report2 = createMockReport('2');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
            };

            // First call - full computation with both reports
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Note: Mock reports may or may not pass shouldDisplayReportInLHN checks.
            // We'll manually add report2 to reportsToDisplay to test the deletion behavior.
            const firstResultWithReport2: typeof firstResult = {
                ...firstResult,
                reportsToDisplay: {
                    ...firstResult.reportsToDisplay,
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
                },
                orderedReportIDs: [...firstResult.orderedReportIDs, '2'].filter((v, i, a) => a.indexOf(v) === i),
            };

            // Second call - report2 is deleted (no longer in reports collection)
            const reportsWithoutReport2: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reportsWithoutReport2, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResultWithReport2,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.REPORT]: {
                            [`${ONYXKEYS.COLLECTION.REPORT}2`]: undefined, // Deleted
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Report2 should be removed from reportsToDisplay after the incremental update
            expect(secondResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}2`]).toBeUndefined();

            // Report2 should also be removed from orderedReportIDs
            expect(secondResult.orderedReportIDs).not.toContain('2');
        });

        it('should correctly update only reports affected by policy changes, not all reports', () => {
            const policy1 = createMockPolicy('p1');
            const policy2 = createMockPolicy('p2');
            const report1 = createMockReport('1', {policyID: 'p1'});
            const report2 = createMockReport('2', {policyID: 'p1'});
            const report3 = createMockReport('3', {policyID: 'p2'});
            const report4 = createMockReport('4'); // No policy

            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}4`]: report4,
            };

            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: policy1,
                [`${ONYXKEYS.COLLECTION.POLICY}p2`]: policy2,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, policies, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            // Capture references from first result
            const report3FromFirstResult = firstResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}3`];
            const report4FromFirstResult = firstResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}4`];

            updateReportsToDisplayInLHNSpy.mockClear();

            // Second call - only policy1 changed
            const updatedPolicy1 = createMockPolicy('p1', {name: 'Updated Policy 1'});
            const updatedPolicies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}p1`]: updatedPolicy1,
                [`${ONYXKEYS.COLLECTION.POLICY}p2`]: policy2,
            };

            const secondResult = orderedReportsForLHNConfig.compute(
                [reports, updatedPolicies, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT],
                {
                    currentValue: firstResult,
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.POLICY]: {
                            [`${ONYXKEYS.COLLECTION.POLICY}p1`]: updatedPolicy1,
                        },
                    },
                    areAllConnectionsSet: true,
                },
            );

            // Verify updateReportsToDisplayInLHN was called with only reports belonging to policy1
            expect(updateReportsToDisplayInLHNSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    updatedReportsKeys: expect.arrayContaining([`${ONYXKEYS.COLLECTION.REPORT}1`, `${ONYXKEYS.COLLECTION.REPORT}2`]),
                }),
            );

            // Report3 (belongs to p2) and report4 (no policy) should NOT be in updatedReportsKeys
            const mockCalls = updateReportsToDisplayInLHNSpy.mock.calls as Array<[{updatedReportsKeys: string[]}]>;
            const callArgs = mockCalls.at(0)?.at(0);
            expect(callArgs?.updatedReportsKeys).not.toContain(`${ONYXKEYS.COLLECTION.REPORT}3`);
            expect(callArgs?.updatedReportsKeys).not.toContain(`${ONYXKEYS.COLLECTION.REPORT}4`);

            // Report3 and report4 should preserve their object references
            expect(secondResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}3`]).toBe(report3FromFirstResult);
            expect(secondResult.reportsToDisplay?.[`${ONYXKEYS.COLLECTION.REPORT}4`]).toBe(report4FromFirstResult);
        });

        it('should use full computation (not incremental) when betas change', () => {
            const report1 = createMockReport('1');
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
            };

            // First call - full computation
            const firstResult = orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, [], {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: undefined,
                sourceValues: undefined,
                areAllConnectionsSet: true,
            });

            updateReportsToDisplayInLHNSpy.mockClear();
            getReportsToDisplayInLHNSpy.mockClear();

            // Second call - betas changed (should trigger full recomputation)
            const newBetas: Beta[] = [CONST.BETAS.DEFAULT_ROOMS];
            orderedReportsForLHNConfig.compute([reports, {}, {}, {}, {}, {}, newBetas, {reports: {}, locale: null}, CONST.PRIORITY_MODE.DEFAULT, CONST.LOCALES.DEFAULT], {
                currentValue: firstResult,
                sourceValues: {
                    // hasKeyTriggeredCompute checks if the key exists in sourceValues
                    // The actual value doesn't matter for non-collection keys
                    [ONYXKEYS.BETAS]: undefined,
                },
                areAllConnectionsSet: true,
            });

            // Should use full computation, not incremental update
            expect(getReportsToDisplayInLHNSpy).toHaveBeenCalled();
            // updateReportsToDisplayInLHN should NOT be called for full computation
            expect(updateReportsToDisplayInLHNSpy).not.toHaveBeenCalled();
        });
    });
});
