import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import type * as CurrencyUtils from '@libs/CurrencyUtils';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import {computeReportNameIfNeeded, getReportByTransactionID, shouldComputeReportName} from '@libs/OptimisticReportNames';
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
    });
});
