import Onyx from 'react-native-onyx';
import {applyUpdateToCache, getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID} from '@libs/OptimisticReportNamesCache';
import type {WorkingUpdates} from '@libs/OptimisticReportNamesCache';
import type {UpdateContext} from '@libs/OptimisticReportNamesConnectionManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';

describe('OptimisticReportNamesCache', () => {
    const mockReport: Report = {
        reportID: '123',
        reportName: 'Test Report',
        type: 'expense',
        total: -10000,
        currency: 'USD',
        policyID: 'policy1',
    } as Report;

    const mockPolicy: Policy = {
        id: 'policy1',
        name: 'Test Policy',
        fieldList: {},
    } as Policy;

    const mockTransaction: Transaction = {
        transactionID: 'txn123',
        reportID: '123',
        created: '2024-01-15T10:00:00Z',
        amount: -5000,
        currency: 'USD',
        merchant: 'Test Store',
    } as Transaction;

    const mockReportNameValuePairs: ReportNameValuePairs = {
        private_isArchived: '',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expensify_text_title: {
            defaultValue: '{report:type} - {report:total}',
        } as unknown as ReportNameValuePairs['expensify_text_title'],
    };

    const mockContext: UpdateContext = {
        betas: [],
        betaConfiguration: {},
        allReports: {
            [`${ONYXKEYS.COLLECTION.REPORT}123`]: mockReport,
        },
        allPolicies: {
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: mockPolicy,
        },
        allTransactions: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn123`]: mockTransaction,
        },
        allReportNameValuePairs: {
            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`]: mockReportNameValuePairs,
        },
    };

    describe('getCachedReportByID', () => {
        it('should return cached report when available in workingUpdates', () => {
            const cachedReport: Report = {
                ...mockReport,
                reportName: 'Updated Report Name',
                total: -20000,
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT}123`]: cachedReport,
            };

            const result = getCachedReportByID('123', mockContext, workingUpdates);

            expect(result).toEqual(cachedReport);
            expect(result?.reportName).toBe('Updated Report Name');
            expect(result?.total).toBe(-20000);
        });

        it('should return original report from context when not in workingUpdates', () => {
            const workingUpdates: WorkingUpdates = {};

            const result = getCachedReportByID('123', mockContext, workingUpdates);

            expect(result).toEqual(mockReport);
        });

        it('should return undefined when report not found anywhere', () => {
            const workingUpdates: WorkingUpdates = {};
            const emptyContext: UpdateContext = {
                ...mockContext,
                allReports: {},
            };

            const result = getCachedReportByID('nonexistent', emptyContext, workingUpdates);

            expect(result).toBeUndefined();
        });

        it('should prioritize workingUpdates over context data', () => {
            const cachedReport: Report = {
                ...mockReport,
                reportName: 'Cached Name',
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT}123`]: cachedReport,
            };

            const result = getCachedReportByID('123', mockContext, workingUpdates);

            expect(result?.reportName).toBe('Cached Name');
            expect(result?.reportName).not.toBe(mockReport.reportName);
        });
    });

    describe('getCachedPolicyByID', () => {
        it('should return cached policy when available in workingUpdates', () => {
            const cachedPolicy: Policy = {
                ...mockPolicy,
                name: 'Updated Policy Name',
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: cachedPolicy,
            };

            const result = getCachedPolicyByID('policy1', mockContext, workingUpdates);

            expect(result).toEqual(cachedPolicy);
            expect(result?.name).toBe('Updated Policy Name');
        });

        it('should return original policy from context when not in workingUpdates', () => {
            const workingUpdates: WorkingUpdates = {};

            const result = getCachedPolicyByID('policy1', mockContext, workingUpdates);

            expect(result).toEqual(mockPolicy);
        });

        it('should return undefined when policyID is undefined', () => {
            const workingUpdates: WorkingUpdates = {};

            const result = getCachedPolicyByID(undefined, mockContext, workingUpdates);

            expect(result).toBeUndefined();
        });

        it('should return undefined when policyID is empty string', () => {
            const workingUpdates: WorkingUpdates = {};

            const result = getCachedPolicyByID('', mockContext, workingUpdates);

            expect(result).toBeUndefined();
        });

        it('should return undefined when policy not found anywhere', () => {
            const workingUpdates: WorkingUpdates = {};
            const emptyContext: UpdateContext = {
                ...mockContext,
                allPolicies: {},
            };

            const result = getCachedPolicyByID('nonexistent', emptyContext, workingUpdates);

            expect(result).toBeUndefined();
        });
    });

    describe('getCachedTransactionByID', () => {
        it('should return cached transaction when available in workingUpdates', () => {
            const cachedTransaction: Transaction = {
                ...mockTransaction,
                amount: -7500,
                merchant: 'Updated Store',
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn123`]: cachedTransaction,
            };

            const result = getCachedTransactionByID('txn123', mockContext, workingUpdates);

            expect(result).toEqual(cachedTransaction);
            expect(result?.amount).toBe(-7500);
            expect(result?.merchant).toBe('Updated Store');
        });

        it('should return original transaction from context when not in workingUpdates', () => {
            const workingUpdates: WorkingUpdates = {};

            const result = getCachedTransactionByID('txn123', mockContext, workingUpdates);

            expect(result).toEqual(mockTransaction);
        });

        it('should return undefined when transaction not found anywhere', () => {
            const workingUpdates: WorkingUpdates = {};
            const emptyContext: UpdateContext = {
                ...mockContext,
                allTransactions: {},
            };

            const result = getCachedTransactionByID('nonexistent', emptyContext, workingUpdates);

            expect(result).toBeUndefined();
        });

        it('should handle transaction with updated created date', () => {
            const cachedTransaction: Transaction = {
                ...mockTransaction,
                created: '2024-02-20T15:30:00Z',
                modifiedCreated: '2024-02-20T15:30:00Z',
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn123`]: cachedTransaction,
            };

            const result = getCachedTransactionByID('txn123', mockContext, workingUpdates);

            expect(result?.created).toBe('2024-02-20T15:30:00Z');
        });
    });

    describe('getCachedReportNameValuePairsByID', () => {
        it('should return cached RNVP when available in workingUpdates', () => {
            const cachedRNVP: ReportNameValuePairs = {
                ...mockReportNameValuePairs,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: {
                    defaultValue: 'Updated Formula: {report:type}',
                } as ReportNameValuePairs['expensify_text_title'],
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`]: cachedRNVP,
            };

            const result = getCachedReportNameValuePairsByID('123', mockContext, workingUpdates);

            expect(result).toEqual(cachedRNVP);
            expect(result?.expensify_text_title?.defaultValue).toBe('Updated Formula: {report:type}');
        });

        it('should return original RNVP from context when not in workingUpdates', () => {
            const workingUpdates: WorkingUpdates = {};

            const result = getCachedReportNameValuePairsByID('123', mockContext, workingUpdates);

            expect(result).toEqual(mockReportNameValuePairs);
        });

        it('should return undefined when RNVP not found anywhere', () => {
            const workingUpdates: WorkingUpdates = {};
            const emptyContext: UpdateContext = {
                ...mockContext,
                allReportNameValuePairs: {},
            };

            const result = getCachedReportNameValuePairsByID('nonexistent', emptyContext, workingUpdates);

            expect(result).toBeUndefined();
        });

        it('should handle RNVP with archived status', () => {
            const cachedRNVP: ReportNameValuePairs = {
                ...mockReportNameValuePairs,
                private_isArchived: '2024-01-15',
            };

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`]: cachedRNVP,
            };

            const result = getCachedReportNameValuePairsByID('123', mockContext, workingUpdates);

            expect(result?.private_isArchived).toBe('2024-01-15');
        });
    });

    describe('applyUpdateToCache', () => {
        it('should apply SET update to cache', () => {
            const workingUpdates: WorkingUpdates = {};
            const newReport: Report = {
                ...mockReport,
                reportID: '456',
                reportName: 'New Report',
            };

            const update = {
                key: `${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: newReport,
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result).toEqual({
                [`${ONYXKEYS.COLLECTION.REPORT}456`]: newReport,
            });
        });

        it('should apply MERGE update to existing cached data', () => {
            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT}123`]: {
                    ...mockReport,
                    reportName: 'Cached Name',
                },
            };

            const update = {
                key: `${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -15000},
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey]).toEqual({
                ...mockReport,
                reportName: 'Cached Name',
                total: -15000,
            });
        });

        it('should apply MERGE update to context data when not in cache', () => {
            const workingUpdates: WorkingUpdates = {};

            const update = {
                key: `${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -15000},
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey]).toEqual({
                ...mockReport,
                total: -15000,
            });
        });

        it('should apply CLEAR update to remove from cache', () => {
            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT}123`]: mockReport,
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: mockPolicy,
            } as WorkingUpdates;

            const update = {
                key: `${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey,
                onyxMethod: Onyx.METHOD.CLEAR,
                value: undefined,
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result).toEqual({
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: mockPolicy,
            });
            expect(result[`${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey]).toBeUndefined();
        });
    });

    describe('integration scenarios', () => {
        it('should work with complex sequential updates', () => {
            let workingUpdates: WorkingUpdates = {} as WorkingUpdates;

            // First update: SET new report
            const setUpdate = {
                key: `${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: {
                    reportID: '456',
                    reportName: 'New Report',
                    total: -5000,
                    policyID: 'policy1',
                },
            };
            workingUpdates = applyUpdateToCache(workingUpdates, setUpdate, mockContext);

            // Second update: MERGE to existing report
            const mergeUpdate = {
                key: `${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -10000, currency: 'EUR'},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, mergeUpdate, mockContext);

            // Verify final state
            const result = getCachedReportByID('456', mockContext, workingUpdates);
            expect(result).toEqual({
                reportID: '456',
                reportName: 'New Report',
                total: -10000,
                currency: 'EUR',
                policyID: 'policy1',
            });
        });

        it('should maintain cache consistency across multiple object types', () => {
            let workingUpdates: WorkingUpdates = {} as WorkingUpdates;

            // Update report
            const reportUpdate = {
                key: `${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Updated Report'},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, reportUpdate, mockContext);

            // Update policy
            const policyUpdate = {
                key: `${ONYXKEYS.COLLECTION.POLICY}policy1` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: 'Updated Policy'},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, policyUpdate, mockContext);

            // Update transaction
            const transactionUpdate = {
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}txn123` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {amount: -7500},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, transactionUpdate, mockContext);

            // Verify all updates are cached correctly
            expect(getCachedReportByID('123', mockContext, workingUpdates)?.reportName).toBe('Updated Report');
            expect(getCachedPolicyByID('policy1', mockContext, workingUpdates)?.name).toBe('Updated Policy');
            expect(getCachedTransactionByID('txn123', mockContext, workingUpdates)?.amount).toBe(-7500);
        });
    });
});
