import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import {applyUpdateToCache, deepMerge, getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID} from '@libs/OptimisticReportNamesCache';
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

        it('should apply MERGE_COLLECTION update to multiple items', () => {
            const workingUpdates: WorkingUpdates = {};
            const report1: Report = {
                reportID: '456',
                reportName: 'Report 1',
                type: 'expense',
                policyID: 'policy1',
            } as Report;

            const report2: Report = {
                reportID: '789',
                reportName: 'Report 2',
                type: 'expense',
                policyID: 'policy1',
            } as Report;

            const update = {
                key: ONYXKEYS.COLLECTION.REPORT,
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}456`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}789`]: report2,
                },
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey]).toEqual(report1);
            expect(result[`${ONYXKEYS.COLLECTION.REPORT}789` as OnyxKey]).toEqual(report2);
        });

        it('should apply MERGE_COLLECTION update merging with existing data', () => {
            const existingReport: Report = {
                reportID: '456',
                reportName: 'Existing Report',
                type: 'expense',
                total: -5000,
                policyID: 'policy1',
            } as Report;

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.REPORT}456`]: existingReport,
            };

            const update = {
                key: ONYXKEYS.COLLECTION.REPORT,
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}456`]: {reportName: 'Updated Report', total: -7500},
                },
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey]).toEqual({
                reportID: '456',
                reportName: 'Updated Report',
                type: 'expense',
                total: -7500,
                policyID: 'policy1',
            });
        });

        it('should apply MERGE_COLLECTION update merging with context data', () => {
            const workingUpdates: WorkingUpdates = {};

            const update = {
                key: ONYXKEYS.COLLECTION.REPORT,
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}123`]: {reportName: 'Context Merged Report', total: -8000},
                },
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT}123` as OnyxKey]).toEqual({
                ...mockReport,
                reportName: 'Context Merged Report',
                total: -8000,
            });
        });

        it('should apply SET_COLLECTION update to multiple items', () => {
            const workingUpdates: WorkingUpdates = {};
            const transaction1: Transaction = {
                transactionID: 'txn456',
                reportID: '456',
                amount: -3000,
                merchant: 'Store A',
            } as Transaction;

            const transaction2: Transaction = {
                transactionID: 'txn789',
                reportID: '789',
                amount: -4500,
                merchant: 'Store B',
            } as Transaction;

            const update = {
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                onyxMethod: Onyx.METHOD.SET_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn456`]: transaction1,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn789`]: transaction2,
                },
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.TRANSACTION}txn456` as OnyxKey]).toEqual(transaction1);
            expect(result[`${ONYXKEYS.COLLECTION.TRANSACTION}txn789` as OnyxKey]).toEqual(transaction2);
        });

        it('should apply SET_COLLECTION update replacing existing data', () => {
            const existingTransaction: Transaction = {
                transactionID: 'txn456',
                reportID: '456',
                amount: -3000,
                merchant: 'Old Store',
                created: '2024-01-01T10:00:00Z',
            } as Transaction;

            const workingUpdates: WorkingUpdates = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn456`]: existingTransaction,
            };

            const newTransaction: Transaction = {
                transactionID: 'txn456',
                reportID: '456',
                amount: -5000,
                merchant: 'New Store',
            } as Transaction;

            const update = {
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                onyxMethod: Onyx.METHOD.SET_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn456`]: newTransaction,
                },
            };

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.TRANSACTION}txn456` as OnyxKey]).toEqual(newTransaction);
            expect((result[`${ONYXKEYS.COLLECTION.TRANSACTION}txn456` as OnyxKey] as Transaction)?.created).toBeUndefined();
        });

        it('should apply MULTI_SET update across multiple collections', () => {
            const workingUpdates: WorkingUpdates = {};
            const report: Report = {
                reportID: '456',
                reportName: 'Multi Report',
                type: 'expense',
                policyID: 'policy1',
            } as Report;

            const transaction: Transaction = {
                transactionID: 'txn456',
                reportID: '456',
                amount: -2500,
                merchant: 'Multi Store',
            } as Transaction;

            const policy: Policy = {
                id: 'policy2',
                name: 'Multi Policy',
            } as Policy;

            const update = {
                key: 'MULTI_SET_KEY' as OnyxKey,
                onyxMethod: Onyx.METHOD.MULTI_SET,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}456`]: report,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn456`]: transaction,
                    [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: policy,
                },
            } as unknown as OnyxUpdate;

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey]).toEqual(report);
            expect(result[`${ONYXKEYS.COLLECTION.TRANSACTION}txn456` as OnyxKey]).toEqual(transaction);
            expect(result[`${ONYXKEYS.COLLECTION.POLICY}policy2` as OnyxKey]).toEqual(policy);
        });

        it('should apply MULTI_SET update with report name value pairs', () => {
            const workingUpdates: WorkingUpdates = {};
            const reportNameValuePairs: ReportNameValuePairs = {
                private_isArchived: '2024-01-15',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: {
                    defaultValue: '{report:type} for {report:policyname}',
                } as ReportNameValuePairs['expensify_text_title'],
            };

            const update = {
                key: 'MULTI_SET_KEY' as OnyxKey,
                onyxMethod: Onyx.METHOD.MULTI_SET,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}456`]: reportNameValuePairs,
                },
            } as unknown as OnyxUpdate;

            const result = applyUpdateToCache(workingUpdates, update, mockContext);

            expect(result[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}456` as OnyxKey]).toEqual(reportNameValuePairs);
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

        it('should work with MERGE_COLLECTION followed by individual updates', () => {
            let workingUpdates: WorkingUpdates = {} as WorkingUpdates;

            // First: MERGE_COLLECTION for multiple reports
            const mergeCollectionUpdate = {
                key: ONYXKEYS.COLLECTION.REPORT,
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}456`]: {reportID: '456', reportName: 'Bulk Report 1', total: -1000},
                    [`${ONYXKEYS.COLLECTION.REPORT}789`]: {reportID: '789', reportName: 'Bulk Report 2', total: -2000},
                },
            };
            workingUpdates = applyUpdateToCache(workingUpdates, mergeCollectionUpdate, mockContext);

            // Second: Individual MERGE update to one of the reports
            const individualMergeUpdate = {
                key: `${ONYXKEYS.COLLECTION.REPORT}456` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -1500, currency: 'EUR'},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, individualMergeUpdate, mockContext);

            // Verify final state
            const report456 = getCachedReportByID('456', mockContext, workingUpdates);
            const report789 = getCachedReportByID('789', mockContext, workingUpdates);

            expect(report456).toEqual({
                reportID: '456',
                reportName: 'Bulk Report 1',
                total: -1500,
                currency: 'EUR',
            });
            expect(report789).toEqual({
                reportID: '789',
                reportName: 'Bulk Report 2',
                total: -2000,
            });
        });

        it('should work with SET_COLLECTION followed by MERGE updates', () => {
            let workingUpdates: WorkingUpdates = {} as WorkingUpdates;

            // First: SET_COLLECTION for multiple transactions
            const setCollectionUpdate = {
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                onyxMethod: Onyx.METHOD.SET_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn456`]: {transactionID: 'txn456', reportID: '456', amount: -1000, merchant: 'Store A'},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn789`]: {transactionID: 'txn789', reportID: '789', amount: -2000, merchant: 'Store B'},
                },
            };
            workingUpdates = applyUpdateToCache(workingUpdates, setCollectionUpdate, mockContext);

            // Second: MERGE update to add additional properties
            const mergeUpdate = {
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}txn456` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {category: 'Travel', tag: 'Business'},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, mergeUpdate, mockContext);

            // Verify final state
            const txn456 = getCachedTransactionByID('txn456', mockContext, workingUpdates);
            const txn789 = getCachedTransactionByID('txn789', mockContext, workingUpdates);

            expect(txn456).toEqual({
                transactionID: 'txn456',
                reportID: '456',
                amount: -1000,
                merchant: 'Store A',
                category: 'Travel',
                tag: 'Business',
            });
            expect(txn789).toEqual({
                transactionID: 'txn789',
                reportID: '789',
                amount: -2000,
                merchant: 'Store B',
            });
        });

        it('should work with MULTI_SET followed by collection updates', () => {
            let workingUpdates: WorkingUpdates = {} as WorkingUpdates;

            // First: MULTI_SET across different collections
            const multiSetUpdate = {
                key: 'MULTI_SET_KEY' as OnyxKey,
                onyxMethod: Onyx.METHOD.MULTI_SET,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}456`]: {reportID: '456', reportName: 'Multi Report', type: 'expense'},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}txn456`]: {transactionID: 'txn456', reportID: '456', amount: -1500},
                    [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: {id: 'policy2', name: 'Multi Policy'},
                },
            } as unknown as OnyxUpdate;
            workingUpdates = applyUpdateToCache(workingUpdates, multiSetUpdate, mockContext);

            // Second: MERGE_COLLECTION to update policies
            const mergeCollectionUpdate = {
                key: ONYXKEYS.COLLECTION.POLICY,
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: {name: 'Updated Multi Policy', settings: {theme: 'dark'}},
                },
            };
            workingUpdates = applyUpdateToCache(workingUpdates, mergeCollectionUpdate, mockContext);

            // Verify final state
            const report = getCachedReportByID('456', mockContext, workingUpdates);
            const transaction = getCachedTransactionByID('txn456', mockContext, workingUpdates);
            const policy = getCachedPolicyByID('policy2', mockContext, workingUpdates);

            expect(report).toEqual({
                reportID: '456',
                reportName: 'Multi Report',
                type: 'expense',
            });
            expect(transaction).toEqual({
                transactionID: 'txn456',
                reportID: '456',
                amount: -1500,
            });
            expect(policy).toEqual({
                id: 'policy2',
                name: 'Updated Multi Policy',
                settings: {theme: 'dark'},
            });
        });

        it('should handle complex scenario with all new methods', () => {
            let workingUpdates: WorkingUpdates = {} as WorkingUpdates;

            // Step 1: MULTI_SET to initialize data across collections
            const multiSetUpdate = {
                key: 'MULTI_SET_KEY' as OnyxKey,
                onyxMethod: Onyx.METHOD.MULTI_SET,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}100`]: {reportID: '100', reportName: 'Report 100', total: -1000},
                    [`${ONYXKEYS.COLLECTION.REPORT}200`]: {reportID: '200', reportName: 'Report 200', total: -2000},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}t100`]: {transactionID: 't100', reportID: '100', amount: -500},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}t200`]: {transactionID: 't200', reportID: '200', amount: -1000},
                },
            } as unknown as OnyxUpdate;
            workingUpdates = applyUpdateToCache(workingUpdates, multiSetUpdate, mockContext);

            // Step 2: MERGE_COLLECTION to update multiple reports
            const mergeCollectionUpdate = {
                key: ONYXKEYS.COLLECTION.REPORT,
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.REPORT}100`]: {total: -1500, currency: 'USD'},
                    [`${ONYXKEYS.COLLECTION.REPORT}200`]: {total: -2500, currency: 'EUR'},
                },
            };
            workingUpdates = applyUpdateToCache(workingUpdates, mergeCollectionUpdate, mockContext);

            // Step 3: SET_COLLECTION to replace transactions
            const setCollectionUpdate = {
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                onyxMethod: Onyx.METHOD.SET_COLLECTION,
                value: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}t100`]: {transactionID: 't100', reportID: '100', amount: -750, merchant: 'New Store'},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}t300`]: {transactionID: 't300', reportID: '100', amount: -250, merchant: 'Another Store'},
                },
            };
            workingUpdates = applyUpdateToCache(workingUpdates, setCollectionUpdate, mockContext);

            // Step 4: Individual MERGE to fine-tune
            const individualMergeUpdate = {
                key: `${ONYXKEYS.COLLECTION.REPORT}100` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {status: 'open', lastModified: '2024-01-15'},
            };
            workingUpdates = applyUpdateToCache(workingUpdates, individualMergeUpdate, mockContext);

            // Verify final state
            const report100 = getCachedReportByID('100', mockContext, workingUpdates);
            const report200 = getCachedReportByID('200', mockContext, workingUpdates);
            const transaction100 = getCachedTransactionByID('t100', mockContext, workingUpdates);
            const transaction200 = getCachedTransactionByID('t200', mockContext, workingUpdates);
            const transaction300 = getCachedTransactionByID('t300', mockContext, workingUpdates);

            expect(report100).toEqual({
                reportID: '100',
                reportName: 'Report 100',
                total: -1500,
                currency: 'USD',
                status: 'open',
                lastModified: '2024-01-15',
            });

            expect(report200).toEqual({
                reportID: '200',
                reportName: 'Report 200',
                total: -2500,
                currency: 'EUR',
            });

            expect(transaction100).toEqual({
                transactionID: 't100',
                reportID: '100',
                amount: -750,
                merchant: 'New Store',
            });

            // Transaction t200 was replaced by SET_COLLECTION, so it shouldn't exist
            expect(transaction200).toBeUndefined();

            expect(transaction300).toEqual({
                transactionID: 't300',
                reportID: '100',
                amount: -250,
                merchant: 'Another Store',
            });
        });
    });

    describe('deepMerge', () => {
        describe('Basic merging', () => {
            it('should merge simple objects', () => {
                const target = {a: 1, b: 2};
                const source = {b: 3, c: 4};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1, b: 3, c: 4});
            });

            it('should add new properties from source', () => {
                const target = {a: 1};
                const source = {b: 2, c: 3};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1, b: 2, c: 3});
            });

            it('should preserve target properties not in source', () => {
                const target = {a: 1, b: 2, c: 3};
                const source = {b: 4};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1, b: 4, c: 3});
            });
        });

        describe('Deep merging', () => {
            it('should deeply merge nested objects', () => {
                const target = {
                    user: {name: 'John', age: 30},
                    settings: {theme: 'dark', notifications: true},
                };
                const source = {
                    user: {age: 31, city: 'NYC'},
                    settings: {notifications: false},
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    user: {name: 'John', age: 31, city: 'NYC'},
                    settings: {theme: 'dark', notifications: false},
                });
            });

            it('should merge multiple levels of nesting', () => {
                const target = {
                    level1: {
                        level2: {
                            level3: {a: 1, b: 2},
                        },
                    },
                };
                const source = {
                    level1: {
                        level2: {
                            level3: {b: 3, c: 4},
                        },
                    },
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    level1: {
                        level2: {
                            level3: {a: 1, b: 3, c: 4},
                        },
                    },
                });
            });
        });

        describe('Array handling', () => {
            it('should replace arrays instead of merging them', () => {
                const target = {items: [1, 2, 3]};
                const source = {items: [4, 5]};
                const result = deepMerge(target, source);

                expect(result).toEqual({items: [4, 5]});
            });

            it('should handle arrays in nested objects', () => {
                const target = {
                    data: {
                        list: [1, 2, 3],
                        name: 'test',
                    },
                };
                const source = {
                    data: {
                        list: [4, 5],
                    },
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    data: {
                        list: [4, 5],
                        name: 'test',
                    },
                });
            });
        });

        describe('Null and undefined handling', () => {
            it('should handle null source', () => {
                const target = {a: 1, b: 2};
                const source = undefined;
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1, b: 2});
            });

            it('should handle null target', () => {
                const target = undefined;
                const source = {a: 1, b: 2};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1, b: 2});
            });

            it('should handle both null target and source', () => {
                const target = undefined;
                const source = undefined;
                const result = deepMerge(target, source);

                expect(result).toEqual({});
            });

            it('should replace target property with null from source', () => {
                const target = {a: 1, b: {c: 3}};
                const source = {a: null};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: null, b: {c: 3}});
            });

            it('should ignore undefined values in source', () => {
                const target = {a: 1, b: 2};
                const source = {a: undefined, c: 3};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1, b: 2, c: 3});
            });
        });

        describe('Special object types', () => {
            it('should replace Date objects instead of merging', () => {
                const target = {date: new Date('2023-01-01')};
                const source = {date: new Date('2023-12-31')};
                const result = deepMerge(target, source);

                expect(result.date).toEqual(new Date('2023-12-31'));
            });

            it('should replace RegExp objects instead of merging', () => {
                const target = {pattern: /old/};
                const source = {pattern: /new/};
                const result = deepMerge(target, source);

                expect(result.pattern).toEqual(/new/);
            });

            it('should handle mixed object types', () => {
                const target = {
                    date: new Date('2023-01-01'),
                    nested: {a: 1},
                };
                const source = {
                    date: new Date('2023-12-31'),
                    nested: {b: 2},
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    date: new Date('2023-12-31'),
                    nested: {a: 1, b: 2},
                });
            });
        });

        describe('Primitive type handling', () => {
            it('should replace primitives with objects', () => {
                const target = {value: 'string'};
                const source = {value: {nested: 'object'}};
                const result = deepMerge(target, source);

                expect(result).toEqual({value: {nested: 'object'}});
            });

            it('should replace objects with primitives', () => {
                const target = {value: {nested: 'object'}};
                const source = {value: 'string'};
                const result = deepMerge(target, source);

                expect(result).toEqual({value: 'string'});
            });
        });

        describe('Real-world scenarios', () => {
            it('should merge report objects correctly', () => {
                const target = {
                    reportID: '123',
                    reportName: 'Test Report',
                    participants: {user1: true},
                    metadata: {created: '2023-01-01'},
                };
                const source = {
                    reportName: 'Updated Report',
                    participants: {user2: true},
                    metadata: {updated: '2023-12-31'},
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    reportID: '123',
                    reportName: 'Updated Report',
                    participants: {user1: true, user2: true},
                    metadata: {created: '2023-01-01', updated: '2023-12-31'},
                });
            });

            it('should handle transaction updates', () => {
                const target = {
                    transactionID: '456',
                    amount: 100,
                    receipt: {url: 'old-url', filename: 'old.jpg'},
                };
                const source = {
                    amount: 150,
                    receipt: {filename: 'new.jpg'},
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    transactionID: '456',
                    amount: 150,
                    receipt: {url: 'old-url', filename: 'new.jpg'},
                });
            });

            it('should handle policy configuration merges', () => {
                const target = {
                    policyID: '789',
                    settings: {
                        approvalMode: 'basic',
                        notifications: {email: true, push: false},
                    },
                    categories: {travel: true},
                };
                const source = {
                    settings: {
                        notifications: {push: true, sms: true},
                    },
                    categories: {meals: true},
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    policyID: '789',
                    settings: {
                        approvalMode: 'basic',
                        notifications: {email: true, push: true, sms: true},
                    },
                    categories: {travel: true, meals: true},
                });
            });

            it('should handle complex nested updates', () => {
                const target = {
                    reportID: 'report_123',
                    reportName: 'Old Name',
                    policyID: 'policy_456',
                    stateNum: 0,
                    participants: {
                        user1: {role: 'admin'},
                        user2: {role: 'member'},
                    },
                    errors: {},
                    pendingFields: {reportName: 'update'},
                };

                const source = {
                    reportName: 'New Name',
                    stateNum: 1,
                    participants: {
                        user1: {role: 'admin', lastRead: '2023-12-31'},
                    },
                    errors: {general: 'Some error'},
                };

                const result = deepMerge(target, source);

                expect(result).toEqual({
                    reportID: 'report_123',
                    reportName: 'New Name',
                    policyID: 'policy_456',
                    stateNum: 1,
                    participants: {
                        user1: {role: 'admin', lastRead: '2023-12-31'},
                        user2: {role: 'member'},
                    },
                    errors: {general: 'Some error'},
                    pendingFields: {reportName: 'update'},
                });
            });
        });

        describe('Edge cases', () => {
            it('should handle empty objects', () => {
                const target = {};
                const source = {a: 1};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1});
            });

            it('should handle merging with empty source', () => {
                const target = {a: 1};
                const source = {};
                const result = deepMerge(target, source);

                expect(result).toEqual({a: 1});
            });

            it('should handle deeply nested null replacement', () => {
                const target = {
                    level1: {
                        level2: {
                            level3: {value: 'old'},
                        },
                    },
                };
                const source = {
                    level1: {
                        level2: {
                            level3: null,
                        },
                    },
                };
                const result = deepMerge(target, source);

                expect(result).toEqual({
                    level1: {
                        level2: {
                            level3: null,
                        },
                    },
                });
            });
        });
    });
});
