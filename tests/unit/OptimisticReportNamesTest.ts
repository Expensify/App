import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import type * as CurrencyUtils from '@libs/CurrencyUtils';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import {computeReportNameIfNeeded, getReportByTransactionID, shouldComputeReportName, updateOptimisticReportNamesFromUpdates} from '@libs/OptimisticReportNames';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Policy, Report, ReportNameValuePairs, Transaction} from '@src/types/onyx';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    isExpenseReport: jest.fn(),
    getReportTransactions: jest.fn(),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    ...jest.requireActual<typeof CurrencyUtils>('@libs/CurrencyUtils'),
    isValidCurrencyCode: jest.fn().mockImplementation((code: string) => ['USD'].includes(code)),
}));

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('OptimisticReportNames', () => {
    const mockPolicy = {
        id: 'policy1',
        fieldList: {
            [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                defaultValue: '{report:type} - {report:total}',
            },
        },
    } as unknown as Policy;

    const mockReport = {
        reportID: '123',
        reportName: 'Old Name',
        policyID: 'policy1',
        total: -10000,
        currency: 'USD',
        lastVisibleActionCreated: '2025-01-15T10:30:00Z',
        type: 'expense',
    } as Report;

    const mockContext: UpdateContext = {
        betas: [CONST.BETAS.CUSTOM_REPORT_NAMES],
        betaConfiguration: {},
        allReports: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            report_123: mockReport,
        },
        allPolicies: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            policy_policy1: mockPolicy,
        },
        allReportNameValuePairs: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            reportNameValuePairs_123: {
                private_isArchived: '',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: {
                    defaultValue: '{report:type} - {report:total}',
                },
            } as unknown as ReportNameValuePairs,
        },
        allTransactions: {},
        isOffline: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockReportUtils.isExpenseReport.mockReturnValue(true);
    });

    describe('shouldComputeReportName()', () => {
        test('should return true for report with title field formula', () => {
            const result = shouldComputeReportName(mockReport, mockContext);
            expect(result).toBe(true);
        });

        test('should return false when no title field', () => {
            const context = {
                ...mockContext,
                allReportNameValuePairs: {
                    ...mockContext.allReportNameValuePairs,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_123: {
                        private_isArchived: '',
                    },
                },
                allPolicies: {},
            };
            const result = shouldComputeReportName(mockReport, context);
            expect(result).toBe(false);
        });

        test('should return false for reports with unsupported type', () => {
            mockReportUtils.isExpenseReport.mockReturnValue(false);

            const result = shouldComputeReportName(
                {
                    ...mockReport,
                    type: 'iou',
                } as Report,
                mockContext,
            );
            expect(result).toBe(false);
        });
    });

    describe('computeReportNameIfNeeded()', () => {
        test('should compute name when report data changes', () => {
            const update = {
                key: 'report_123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -20000},
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = computeReportNameIfNeeded(mockReport, update, mockContext);
            expect(result?.name).toEqual('Expense Report - $200.00');
        });

        test('should return null when name would not change', () => {
            const update = {
                key: 'report_456' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {description: 'Updated description'},
            };

            const result = computeReportNameIfNeeded(
                {
                    ...mockReport,
                    reportName: 'Expense Report - $100.00',
                },
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                update,
                mockContext,
            );
            expect(result).toBeNull();
        });
    });

    describe('updateOptimisticReportNamesFromUpdates()', () => {
        test('should detect new report creation and add name update', () => {
            const updates = [
                {
                    key: 'report_456' as OnyxKey,
                    onyxMethod: Onyx.METHOD.SET,
                    value: {
                        reportID: '456',
                        policyID: 'policy1',
                        total: -15000,
                        currency: 'USD',
                        type: 'expense',
                    },
                },
            ];

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result.optimisticData).toHaveLength(2); // Original + name update
            expect(result.optimisticData.at(1)).toEqual({
                key: 'report_456',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Expense Report - $150.00'},
            });
        });

        test('should handle existing report updates', () => {
            const updates = [
                {
                    key: 'report_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: -25000},
                },
            ];

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result.optimisticData).toHaveLength(2); // Original + name update
            expect(result.optimisticData.at(1)?.value).toEqual({reportName: 'Expense Report - $250.00'});
        });

        test('should handle policy updates affecting multiple reports', () => {
            const contextWithMultipleReports = {
                ...mockContext,
                allReports: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    report_123: {...mockReport, reportID: '123'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    report_456: {...mockReport, reportID: '456'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    report_789: {...mockReport, reportID: '789'},
                },
                allPolicies: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    policy_policy1: {
                        id: 'policy1',
                        fieldList: {
                            [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                                fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                                defaultValue: 'Policy: {report:policyname}',
                            },
                        },
                    } as unknown as Policy,
                },
                allReportNameValuePairs: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_123: {private_isArchived: '', expensify_text_title: {defaultValue: 'Policy: {report:policyname}'}} as unknown as ReportNameValuePairs,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_456: {private_isArchived: '', expensify_text_title: {defaultValue: 'Policy: {report:policyname}'}} as unknown as ReportNameValuePairs,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_789: {private_isArchived: '', expensify_text_title: {defaultValue: 'Policy: {report:policyname}'}} as unknown as ReportNameValuePairs,
                },
            };

            const updates = [
                {
                    key: 'policy_policy1' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {name: 'Updated Policy Name'},
                },
            ];

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates(updates, contextWithMultipleReports);

            expect(result.optimisticData).toHaveLength(4);

            // Assert the original policy update
            expect(result.optimisticData.at(0)).toEqual({
                key: 'policy_policy1',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: 'Updated Policy Name'},
            });

            // Assert individual report name updates
            expect(result.optimisticData.at(1)).toEqual({
                key: 'report_123',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Policy: Updated Policy Name'},
            });

            expect(result.optimisticData.at(2)).toEqual({
                key: 'report_456',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Policy: Updated Policy Name'},
            });

            expect(result.optimisticData.at(3)).toEqual({
                key: 'report_789',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Policy: Updated Policy Name'},
            });
        });

        test('should handle unknown object types gracefully', () => {
            const updates = [
                {
                    key: 'unknown_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {someData: 'value'},
                },
            ];

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result.optimisticData).toEqual(updates); // Unchanged
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing report gracefully', () => {
            const update = {
                key: 'report_999' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -10000},
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = computeReportNameIfNeeded(undefined, update, mockContext);
            expect(result).toBeNull();
        });
    });

    describe('Transaction Updates', () => {
        test('should process transaction updates and trigger report name updates', () => {
            const contextWithTransaction = {
                ...mockContext,
                allTransactions: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_txn123: {
                        transactionID: 'txn123',
                        reportID: '123',
                        created: '2024-01-01',
                        amount: -5000,
                        currency: 'USD',
                        merchant: 'Original Merchant',
                    },
                },
            };

            const update = {
                key: 'transactions_txn123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    created: '2024-02-15', // Updated date
                    reportID: '123',
                },
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates([update], contextWithTransaction);

            // Should include original update + new report name update
            expect(result.optimisticData).toHaveLength(2);
            expect(result.optimisticData.at(0)).toEqual(update); // Original transaction update
            expect(result.optimisticData.at(1)?.key).toBe('report_123'); // New report update
        });

        test('getReportByTransactionID should find report from transaction', () => {
            const contextWithTransaction = {
                ...mockContext,
                allTransactions: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_abc123: {
                        transactionID: 'abc123',
                        reportID: '123',
                        amount: -7500,
                        created: '2024-01-15',
                        currency: 'USD',
                        merchant: 'Test Store',
                    },
                },
            };

            const result = getReportByTransactionID('abc123', contextWithTransaction);

            expect(result).toEqual(mockReport);
            expect(result?.reportID).toBe('123');
        });

        test('getReportByTransactionID should return undefined for missing transaction', () => {
            const result = getReportByTransactionID('nonexistent', mockContext);
            expect(result).toBeUndefined();
        });

        test('getReportByTransactionID should return undefined for transaction without reportID', () => {
            const contextWithIncompleteTransaction = {
                ...mockContext,
                allTransactions: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_incomplete: {
                        transactionID: 'incomplete' as OnyxKey,
                        amount: -1000,
                        currency: 'USD',
                        merchant: 'Store',
                        // Missing reportID
                    } as unknown as Transaction,
                },
            };

            const result = getReportByTransactionID('incomplete', contextWithIncompleteTransaction);
            expect(result).toBeUndefined();
        });

        test('should handle transaction updates that rely on context lookup', () => {
            const contextWithTransaction = {
                ...mockContext,
                allTransactions: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_xyz789: {
                        transactionID: 'xyz789',
                        reportID: '123',
                        created: '2024-01-01',
                        amount: -3000,
                        currency: 'EUR',
                        merchant: 'Context Store',
                    },
                },
            };

            // Transaction update without reportID in the value
            const update = {
                key: 'transactions_xyz789' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    amount: -4000, // Updated amount
                    // No reportID provided in update
                },
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates([update], contextWithTransaction);

            // Should still find the report through context lookup and generate update
            expect(result.optimisticData).toHaveLength(2);
            expect(result.optimisticData.at(1)?.key).toBe('report_123');
        });

        test('should use optimistic transaction data in formula computation', () => {
            const contextWithTransaction = {
                ...mockContext,
                allReportNameValuePairs: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_123: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        expensify_text_title: {
                            defaultValue: 'Report from {report:startdate}',
                        },
                    } as unknown as ReportNameValuePairs,
                },
                allPolicies: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    policy_policy1: {
                        id: 'policy1',
                        fieldList: {
                            [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                                fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                                defaultValue: 'Report from {report:startdate}',
                            },
                        },
                    } as unknown as Policy,
                },
                allTransactions: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_formula123: {
                        transactionID: 'formula123',
                        reportID: '123',
                        created: '2024-01-01', // Original date
                        amount: -5000,
                        currency: 'USD',
                        merchant: 'Original Store',
                    },
                },
            };

            // Mock getReportTransactions to return the original transaction
            // eslint-disable-next-line @typescript-eslint/dot-notation
            mockReportUtils.getReportTransactions.mockReturnValue([contextWithTransaction.allTransactions['transactions_formula123']]);

            const update = {
                key: 'transactions_formula123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    transactionID: 'formula123',
                    created: '2024-03-15', // Updated date that should be used in formula
                    modifiedCreated: '2024-03-15',
                },
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            const result = updateOptimisticReportNamesFromUpdates([update], contextWithTransaction);

            expect(result.optimisticData).toHaveLength(2);

            // The key test: verify exact report name with optimistic date
            const reportUpdate = result.optimisticData.at(1);
            expect(reportUpdate).toEqual({
                key: 'report_123',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    reportName: 'Report from 2024-03-15', // Exact expected result with updated date
                },
            });
        });
    });
});
