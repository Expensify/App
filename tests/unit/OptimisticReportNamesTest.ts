import Onyx from 'react-native-onyx';
import {computeReportNameIfNeeded, shouldComputeReportName, updateOptimisticReportNamesFromUpdates} from '@libs/OptimisticReportNames';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import * as ReportUtils from '@libs/ReportUtils';

// Mock dependencies
jest.mock('@libs/ReportUtils');
jest.mock('@libs/Permissions');

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('OptimisticReportNames', () => {
    const mockPolicy = {
        id: 'policy1',
        fieldList: {
            text_title: {
                defaultValue: '{report:type} - {report:total}',
            },
        },
    };

    const mockReport = {
        reportID: '123',
        reportName: 'Old Name',
        policyID: 'policy1',
        total: -10000,
        currency: 'USD',
        lastVisibleActionCreated: '2025-01-15T10:30:00Z',
    };

    const mockContext: UpdateContext = {
        betas: ['authAutoReportTitles'],
        allReports: {
            report_123: mockReport,
        },
        allPolicies: {
            policy_policy1: mockPolicy,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockReportUtils.isExpenseReport.mockReturnValue(true);
        mockReportUtils.getTitleReportField.mockReturnValue(mockPolicy.fieldList.text_title);
    });

    describe('shouldComputeReportName()', () => {
        test('should return true for expense report with title field formula', () => {
            const result = shouldComputeReportName(mockReport as any, mockPolicy as any);
            expect(result).toBe(true);
        });

        test('should return false for non-expense reports', () => {
            mockReportUtils.isExpenseReport.mockReturnValue(false);
            const result = shouldComputeReportName(mockReport as any, mockPolicy as any);
            expect(result).toBe(false);
        });

        test('should return false when no policy', () => {
            const result = shouldComputeReportName(mockReport as any, null);
            expect(result).toBe(false);
        });

        test('should return false when no title field', () => {
            mockReportUtils.getTitleReportField.mockReturnValue(undefined);
            const result = shouldComputeReportName(mockReport as any, mockPolicy as any);
            expect(result).toBe(false);
        });

        test('should return true when title field has no formula', () => {
            const policyWithoutFormula = {
                ...mockPolicy,
                fieldList: {
                    text_title: {defaultValue: 'Static Title'},
                },
            };
            mockReportUtils.getTitleReportField.mockReturnValue(policyWithoutFormula.fieldList.text_title);
            const result = shouldComputeReportName(mockReport as any, policyWithoutFormula as any);
            expect(result).toBe(true);
        });
    });

    describe('computeReportNameIfNeeded()', () => {
        test('should compute name when report data changes', () => {
            const update = {
                key: 'report_123',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -20000},
            };

            const result = computeReportNameIfNeeded(mockReport as any, update, mockContext);
            expect(result).toEqual('Expense Report - USD 200.00');
        });

        test('should return null when name would not change', () => {
            const update = {
                key: 'report_456',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {description: 'Updated description'},
            };

            const result = computeReportNameIfNeeded(mockReport as any, update, mockContext);
            expect(result).toBeNull();
        });
    });

    describe('updateOptimisticReportNamesFromUpdates()', () => {
        test('should detect new report creation and add name update', () => {
            const updates = [
                {
                    key: 'report_456',
                    onyxMethod: Onyx.METHOD.SET,
                    value: {
                        reportID: '456',
                        policyID: 'policy1',
                        total: -15000,
                        currency: 'USD',
                    },
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result).toHaveLength(2); // Original + name update
            expect(result[1]).toEqual({
                key: 'report_456',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Expense Report - USD 150.00'},
            });
        });

        test('should handle existing report updates', () => {
            const updates = [
                {
                    key: 'report_123',
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: -25000},
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result).toHaveLength(2); // Original + name update
            expect(result[1].value).toEqual({reportName: 'Expense Report - USD 250.00'});
        });

        test('should handle policy updates affecting multiple reports', () => {
            const contextWithMultipleReports = {
                ...mockContext,
                allReports: {
                    report_123: {...mockReport, reportID: '123'},
                    report_456: {...mockReport, reportID: '456'},
                },
            };

            const updates = [
                {
                    key: 'policy_policy1',
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {name: 'Updated Policy Name'},
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, contextWithMultipleReports);
            expect(result.length).toBeGreaterThan(1);
        });

        test('should handle unknown object types gracefully', () => {
            const updates = [
                {
                    key: 'unknown_123',
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {someData: 'value'},
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result).toEqual(updates); // Unchanged
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing report gracefully', () => {
            const update = {
                key: 'report_999',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -10000},
            };

            const result = computeReportNameIfNeeded(null as any, update, mockContext);
            expect(result).toBeNull();
        });
    });
});
