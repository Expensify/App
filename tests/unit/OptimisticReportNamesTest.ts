import Onyx from 'react-native-onyx';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import {computeReportNameIfNeeded, shouldComputeReportName, updateOptimisticReportNamesFromUpdates} from '@libs/OptimisticReportNames';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    isExpenseReport: jest.fn(),
    getTitleReportField: jest.fn(),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    getCurrencySymbol: jest.fn().mockReturnValue('$'),
}));

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('OptimisticReportNames', () => {
    const mockPolicy = {
        id: 'policy1',
        fieldList: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            text_title: {
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
        betas: ['authAutoReportTitle'],
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
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockReportUtils.isExpenseReport.mockReturnValue(true);
        mockReportUtils.getTitleReportField.mockReturnValue(mockPolicy.fieldList?.text_title);
    });

    describe('shouldComputeReportName()', () => {
        test('should return true for expense report with title field formula', () => {
            const result = shouldComputeReportName(mockReport, mockPolicy);
            expect(result).toBe(true);
        });

        test('should return false for reports with unsupported type', () => {
            mockReportUtils.isExpenseReport.mockReturnValue(false);

            const result = shouldComputeReportName(
                {
                    ...mockReport,
                    type: 'iou',
                } as Report,
                mockPolicy,
            );
            expect(result).toBe(false);
        });

        test('should return false when no policy', () => {
            const result = shouldComputeReportName(mockReport, undefined);
            expect(result).toBe(false);
        });

        test('should return false when no title field', () => {
            mockReportUtils.getTitleReportField.mockReturnValue(undefined);
            const result = shouldComputeReportName(mockReport, mockPolicy);
            expect(result).toBe(false);
        });

        test('should return true when title field has no formula', () => {
            const policyWithoutFormula = {
                ...mockPolicy,
                fieldList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    text_title: {defaultValue: 'Static Title'},
                },
            } as unknown as Policy;
            mockReportUtils.getTitleReportField.mockReturnValue(policyWithoutFormula.fieldList?.text_title);
            const result = shouldComputeReportName(mockReport, policyWithoutFormula);
            expect(result).toBe(true);
        });
    });

    describe('computeReportNameIfNeeded()', () => {
        test('should compute name when report data changes', () => {
            const update = {
                key: 'report_123' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -20000},
            };

            const result = computeReportNameIfNeeded(mockReport, update, mockContext);
            expect(result).toEqual('Expense Report - $200.00');
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

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result).toHaveLength(2); // Original + name update
            expect(result.at(1)).toEqual({
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

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result).toHaveLength(2); // Original + name update
            expect(result.at(1)?.value).toEqual({reportName: 'Expense Report - $250.00'});
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
                allReportNameValuePairs: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_123: {private_isArchived: ''},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_456: {private_isArchived: ''},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reportNameValuePairs_789: {private_isArchived: ''},
                },
            };
            mockReportUtils.getTitleReportField.mockReturnValue({defaultValue: 'Policy: {report:policyname}'} as unknown as PolicyReportField);

            const updates = [
                {
                    key: 'policy_policy1' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {name: 'Updated Policy Name'},
                },
            ];

            const result = updateOptimisticReportNamesFromUpdates(updates, contextWithMultipleReports);

            expect(result).toHaveLength(4);

            // Assert the original policy update
            expect(result.at(0)).toEqual({
                key: 'policy_policy1',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {name: 'Updated Policy Name'},
            });

            // Assert individual report name updates
            expect(result.at(1)).toEqual({
                key: 'report_123',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Policy: Updated Policy Name'},
            });

            expect(result.at(2)).toEqual({
                key: 'report_456',
                onyxMethod: Onyx.METHOD.MERGE,
                value: {reportName: 'Policy: Updated Policy Name'},
            });

            expect(result.at(3)).toEqual({
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

            const result = updateOptimisticReportNamesFromUpdates(updates, mockContext);
            expect(result).toEqual(updates); // Unchanged
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing report gracefully', () => {
            const update = {
                key: 'report_999' as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -10000},
            };

            const result = computeReportNameIfNeeded(undefined, update, mockContext);
            expect(result).toBeNull();
        });
    });

    describe('Title field in rNVP functionality', () => {
        describe('shouldComputeReportName with title field check', () => {
            it('should return false when title field is missing from rNVP', () => {
                const report = {
                    reportID: '123',
                    policyID: 'policy1',
                    type: 'expense',
                } as Report;

                const context: UpdateContext = {
                    allPolicies: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        policy_policy1: mockPolicy,
                    },
                    allReports: {},
                    allReportNameValuePairs: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        reportNameValuePairs_123: {}, // No text_title field
                    },
                };

                mockReportUtils.getTitleReportField.mockReturnValue(mockPolicy.fieldList?.text_title as unknown as PolicyReportField);

                const result = shouldComputeReportName(report, mockPolicy, context);
                expect(result).toBe(false);
            });

            it('should return false when title field exists but has no defaultValue', () => {
                const report = {
                    reportID: '123',
                    policyID: 'policy1',
                    type: 'expense',
                } as Report;

                const context: UpdateContext = {
                    allPolicies: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        policy_policy1: mockPolicy,
                    },
                    allReports: {},
                    allReportNameValuePairs: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        reportNameValuePairs_123: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            text_title: {
                                defaultValue: '',
                                deleteable: true,
                            },
                        },
                    },
                };

                const result = shouldComputeReportName(report, mockPolicy, context);
                expect(result).toBe(false);
            });

            it('should return true when title field exists with defaultValue', () => {
                const report = {
                    reportID: '123',
                    policyID: 'policy1',
                    type: 'expense',
                } as Report;

                const context: UpdateContext = {
                    allPolicies: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        policy_policy1: mockPolicy,
                    },
                    allReports: {},
                    allReportNameValuePairs: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        reportNameValuePairs_123: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            text_title: {
                                defaultValue: 'Policy: {report:policyname}',
                                deleteable: false,
                            },
                        },
                    },
                };

                const result = shouldComputeReportName(report, mockPolicy, context);
                expect(result).toBe(true);
            });
        });

        describe('computeReportNameIfNeeded with title field check', () => {
            it('should return null when title field is missing from rNVP', () => {
                const report = {
                    reportID: '123',
                    policyID: 'policy1',
                    type: 'expense',
                    reportName: 'Existing Name',
                } as Report;

                const update = {
                    key: 'report_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: 100},
                };

                const context: UpdateContext = {
                    allPolicies: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        policy_policy1: mockPolicy,
                    },
                    allReports: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        report_123: report,
                    },
                    allReportNameValuePairs: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        reportNameValuePairs_123: {}, // No text_title field
                    },
                };

                const result = computeReportNameIfNeeded(report, update, context);
                expect(result).toBeNull();
            });

            it('should return null when title field has no defaultValue', () => {
                const report = {
                    reportID: '123',
                    policyID: 'policy1',
                    type: 'expense',
                    reportName: 'Existing Name',
                } as Report;

                const update = {
                    key: 'report_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: 100},
                };

                const context: UpdateContext = {
                    allPolicies: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        policy_policy1: mockPolicy,
                    },
                    allReports: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        report_123: report,
                    },
                    allReportNameValuePairs: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        reportNameValuePairs_123: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            text_title: {
                                defaultValue: '', // Empty defaultValue
                                deleteable: true,
                            },
                        },
                    },
                };

                const result = computeReportNameIfNeeded(report, update, context);
                expect(result).toBeNull();
            });

            it('should compute name when title field exists with valid defaultValue', () => {
                const report = {
                    reportID: '123',
                    policyID: 'policy1',
                    type: 'expense',
                    reportName: 'Existing Name',
                } as Report;

                const update = {
                    key: 'report_123' as OnyxKey,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {total: 100},
                };

                const context: UpdateContext = {
                    allPolicies: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        policy_policy1: mockPolicy,
                    },
                    allReports: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        report_123: report,
                    },
                    allReportNameValuePairs: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        reportNameValuePairs_123: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            text_title: {
                                defaultValue: 'Policy: {report:policyname}',
                                deleteable: false,
                            },
                        },
                    },
                };

                const result = computeReportNameIfNeeded(report, update, context);
                expect(result).toBeDefined();
                expect(typeof result).toBe('string');
            });
        });
    });
});
