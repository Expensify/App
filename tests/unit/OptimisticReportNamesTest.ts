import Onyx from 'react-native-onyx';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import {computeReportNameIfNeeded, getReportByTransactionID, shouldComputeReportName, updateOptimisticReportNamesFromUpdates} from '@libs/OptimisticReportNames';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report, Transaction} from '@src/types/onyx';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    isExpenseReport: jest.fn(),
    getTitleReportField: jest.fn(),
    getReportTransactions: jest.fn(),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    getCurrencySymbol: jest.fn(() => '$'),
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

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('OptimisticReportNames', () => {
    const mockReport: Report = {
        reportID: '123',
        type: 'expense',
        policyID: 'policy123',
        reportName: 'Original Report Name',
        currency: 'USD',
        total: 5000,
    };

    const mockPolicy: Policy = {
        id: 'policy123',
        name: 'Test Workspace',
        fieldList: {
            title: {
                type: 'text',
                key: 'title',
                defaultValue: 'Report from {report:policyname}',
            } as PolicyReportField,
        },
    };

    const mockContext: UpdateContext = {
        betas: ['authAutoReportTitle'],
        allReports: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            report_123: mockReport,
        },
        allPolicies: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            policy_policy123: mockPolicy,
        },
        allReportNameValuePairs: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            reportNameValuePairs_123: {
                private_isArchived: '',
            },
        },
        allTransactions: {},
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('shouldComputeReportName', () => {
        beforeEach(() => {
            mockReportUtils.getTitleReportField.mockReturnValue({
                defaultValue: 'Report from {report:policyname}',
            } as PolicyReportField);
        });

        test('should return true for valid expense report with policy title field', () => {
            const result = shouldComputeReportName(mockReport, mockPolicy);
            expect(result).toBe(true);
        });

        test('should return false for report without policy', () => {
            const result = shouldComputeReportName(mockReport, undefined);
            expect(result).toBe(false);
        });

        test('should return false for unsupported report type', () => {
            const chatReport = {...mockReport, type: 'chat'};
            const result = shouldComputeReportName(chatReport, mockPolicy);
            expect(result).toBe(false);
        });

        test('should return false when policy has no title field', () => {
            mockReportUtils.getTitleReportField.mockReturnValue(undefined);
            const result = shouldComputeReportName(mockReport, mockPolicy);
            expect(result).toBe(false);
        });
    });

    describe('computeReportNameIfNeeded', () => {
        beforeEach(() => {
            mockReportUtils.getTitleReportField.mockReturnValue({
                defaultValue: 'Report from {report:policyname}',
            } as PolicyReportField);
        });

        test('should compute new report name when formula changes', () => {
            const update = {
                key: 'report_123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    total: 10000,
                },
            };

            const result = computeReportNameIfNeeded(mockReport, update, mockContext);

            expect(result).toBe('Report from Test Workspace');
        });

        test('should return null when no computation is needed', () => {
            mockReportUtils.getTitleReportField.mockReturnValue(undefined);

            const update = {
                key: 'report_123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    total: 10000,
                },
            };

            const result = computeReportNameIfNeeded(mockReport, update, mockContext);

            expect(result).toBeNull();
        });

        test('should handle new report creation', () => {
            const newReport = {
                ...mockReport,
                reportID: 'new456',
                reportName: '',
            };

            const update = {
                key: 'report_new456' as OnyxKey,
                onyxMethod: Onyx.METHOD.SET,
                value: newReport,
            };

            const result = computeReportNameIfNeeded(undefined, update, mockContext);

            expect(result).toBe('Report from Test Workspace');
        });

        test('should return null when computed name matches current name', () => {
            const reportWithComputedName = {
                ...mockReport,
                reportName: 'Report from Test Workspace',
            };

            const update = {
                key: 'report_123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    total: 8000,
                },
            };

            const result = computeReportNameIfNeeded(reportWithComputedName, update, mockContext);

            expect(result).toBeNull();
        });
    });

    describe('updateOptimisticReportNamesFromUpdates', () => {
        beforeEach(() => {
            mockReportUtils.getTitleReportField.mockReturnValue({
                defaultValue: 'Report from {report:policyname}',
            } as PolicyReportField);
        });

        test('should process report updates and add name updates', () => {
            const updates = [
                {
                    key: 'report_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {
                        total: 7500,
                    },
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);

            expect(result).toHaveLength(2);
            expect(result.at(0)).toEqual(updates.at(0));
            expect(result.at(1)?.key).toBe('report_123');
            expect(result.at(1)?.value).toEqual({
                reportName: 'Report from Test Workspace',
            });
        });

        test('should process policy updates and update affected reports', () => {
            const updates = [
                {
                    key: 'policy_policy123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {
                        name: 'Updated Workspace',
                    },
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);

            expect(result).toHaveLength(2);
            expect(result.at(0)).toEqual(updates.at(0));
            expect(result.at(1)?.key).toBe('report_123');
        });

        test('should return original updates when no changes needed', () => {
            mockReportUtils.getTitleReportField.mockReturnValue(undefined);

            const updates = [
                {
                    key: 'report_456' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {
                        total: 3000,
                    },
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);

            expect(result).toEqual(updates);
        });

        test('should handle empty updates array', () => {
            const result = updateOptimisticReportNamesFromUpdates([], mockContext);

            expect(result).toEqual([]);
        });

        test('should return original updates when feature is disabled', () => {
            const contextWithDisabledFeature = {
                ...mockContext,
                betas: [],
            };

            const updates = [
                {
                    key: 'report_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {
                        total: 7500,
                    },
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, contextWithDisabledFeature);

            expect(result).toEqual(updates);
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

            const result = updateOptimisticReportNamesFromUpdates([update], contextWithTransaction);

            // Should include original update + new report name update
            expect(result).toHaveLength(2);
            expect(result.at(0)).toEqual(update); // Original transaction update
            expect(result.at(1)?.key).toBe('report_123'); // New report update
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

            const result = updateOptimisticReportNamesFromUpdates([update], contextWithTransaction);

            // Should still find the report through context lookup and generate update
            expect(result).toHaveLength(2);
            expect(result.at(1)?.key).toBe('report_123');
        });

        test('should use optimistic transaction data in formula computation', () => {
            mockReportUtils.getTitleReportField.mockReturnValue({
                defaultValue: 'Report from {report:startdate}',
            } as unknown as PolicyReportField);

            const contextWithTransaction = {
                ...mockContext,
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

            const result = updateOptimisticReportNamesFromUpdates([update], contextWithTransaction);

            expect(result).toHaveLength(2);

            // The key test: verify exact report name with optimistic date
            const reportUpdate = result.at(1);
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