import {compute, extract, FORMULA_PART_TYPES, isFormula, parse} from '@libs/Formula';
import type {FormulaContext} from '@libs/Formula';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';

// Mock ReportActionsUtils and ReportUtils
jest.mock('@libs/ReportActionsUtils', () => ({
    getAllReportActions: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    getReportTransactions: jest.fn(),
}));

const mockReportActionsUtils = ReportActionsUtils as jest.Mocked<typeof ReportActionsUtils>;
const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('CustomFormula', () => {
    describe('extract()', () => {
        test('should extract formula parts with default braces', () => {
            expect(extract('{report:type} - {report:total}')).toEqual(['{report:type}', '{report:total}']);
        });

        test('should handle nested braces', () => {
            expect(extract('{report:created:yyyy-MM-dd}')).toEqual(['{report:created:yyyy-MM-dd}']);
        });

        test('should handle escaped braces', () => {
            expect(extract('\\{not-formula} {report:type}')).toEqual(['{report:type}']);
        });

        test('should handle empty formula', () => {
            expect(extract('')).toEqual([]);
            expect(extract(null as any)).toEqual([]);
            expect(extract(undefined as any)).toEqual([]);
        });

        test('should handle formula without braces', () => {
            expect(extract('no braces here')).toEqual([]);
        });
    });

    describe('parse()', () => {
        test('should parse report formula parts', () => {
            const parts = parse('{report:type} {report:startdate}');
            expect(parts).toHaveLength(2); // report:type, report:startdate (space is trimmed)
            expect(parts[0]).toEqual({
                definition: '{report:type}',
                type: 'report',
                fieldPath: ['type'],
                functions: [],
            });
            expect(parts[1]).toEqual({
                definition: '{report:startdate}',
                type: 'report',
                fieldPath: ['startdate'],
                functions: [],
            });
        });

        test('should parse field formula parts', () => {
            const parts = parse('{field:custom_field}');
            expect(parts[0]).toEqual({
                definition: '{field:custom_field}',
                type: 'field',
                fieldPath: ['custom_field'],
                functions: [],
            });
        });

        test('should parse user formula parts with functions', () => {
            const parts = parse('{user:email|frontPart}');
            expect(parts[0]).toEqual({
                definition: '{user:email|frontPart}',
                type: 'user',
                fieldPath: ['email'],
                functions: ['frontPart'],
            });
        });

        test('should handle empty formula', () => {
            expect(parse('')).toEqual([]);
            expect(parse(null as any)).toEqual([]);
        });

        test('should treat formula without braces as free text', () => {
            const parts = parse('no braces here');
            expect(parts).toHaveLength(1);
            expect(parts[0].type).toBe('freetext');
        });
    });

    describe('compute()', () => {
        const mockContext: FormulaContext = {
            report: {
                reportID: '123',
                reportName: '',
                total: -10000, // -$100.00
                currency: 'USD',
                lastVisibleActionCreated: '2025-01-15T10:30:00Z',
                policyID: 'policy1',
            } as any,
            policy: {
                name: 'Test Policy',
            },
        };

        beforeEach(() => {
            jest.clearAllMocks();

            // Mock report actions - test the iteration logic for finding oldest date (for 'created' field)
            const mockReportActions = {
                '1': {
                    reportActionID: '1',
                    created: '2025-01-10T08:00:00Z', // Oldest action
                    actionName: 'CREATED',
                },
                '2': {
                    reportActionID: '2',
                    created: '2025-01-15T10:30:00Z', // Later action
                    actionName: 'IOU',
                },
                '3': {
                    reportActionID: '3',
                    created: '2025-01-12T14:20:00Z', // Middle action
                    actionName: 'COMMENT',
                },
            };

            // Mock transactions - test the iteration logic for finding oldest transaction date (for 'startdate' field)
            const mockTransactions = [
                {
                    transactionID: 'trans1',
                    created: '2025-01-08T12:00:00Z', // Oldest transaction
                    amount: 5000,
                },
                {
                    transactionID: 'trans2',
                    created: '2025-01-14T16:45:00Z', // Later transaction
                    amount: 3000,
                },
                {
                    transactionID: 'trans3',
                    created: '2025-01-11T09:15:00Z', // Middle transaction
                    amount: 2000,
                },
            ];

            mockReportActionsUtils.getAllReportActions.mockReturnValue(mockReportActions as any);
            mockReportUtils.getReportTransactions.mockReturnValue(mockTransactions as any);
        });

        test('should compute basic report formula', () => {
            const result = compute('{report:type} {report:total}', mockContext);
            expect(result).toBe('Expense ReportUSD100.00'); // No space between parts
        });

        test('should compute startdate formula using transactions', () => {
            const result = compute('{report:startdate}', mockContext);
            expect(result).toBe('01/08/2025'); // Should use oldest transaction date (2025-01-08)
        });

        test('should compute created formula using report actions', () => {
            const result = compute('{report:created}', mockContext);
            expect(result).toBe('01/10/2025'); // Should use oldest report action date (2025-01-10)
        });

        test('should compute startdate with custom format', () => {
            const result = compute('{report:startdate:yyyy-MM-dd}', mockContext);
            expect(result).toBe('2025-01-08'); // Should use oldest transaction date with yyyy-MM-dd format
        });

        test('should compute created with custom format', () => {
            const result = compute('{report:created:MMMM dd, yyyy}', mockContext);
            expect(result).toBe('January 10, 2025'); // Should use oldest report action date with MMMM dd, yyyy format
        });

        test('should compute startdate with short month format', () => {
            const result = compute('{report:startdate:dd MMM yyyy}', mockContext);
            expect(result).toBe('08 Jan 2025'); // Should use oldest transaction date with dd MMM yyyy format
        });

        test('should compute policy name', () => {
            const result = compute('{report:policyname}', mockContext);
            expect(result).toBe('Test Policy');
        });

        test('should handle empty formula', () => {
            expect(compute('', mockContext)).toBe('');
            expect(compute(null as any, mockContext)).toBe('');
        });

        test('should handle unknown formula parts', () => {
            const result = compute('{report:unknown}', mockContext);
            expect(result).toBe('{report:unknown}');
        });

        test('should handle missing report data gracefully', () => {
            const contextWithMissingData: FormulaContext = {
                report: {} as any,
                policy: null,
            };
            const result = compute('{report:total} {report:policyname}', contextWithMissingData);
            expect(result).toBe(''); // Empty strings concatenated = empty string
        });

        test('should preserve free text', () => {
            const result = compute('Expense Report - {report:total}', mockContext);
            expect(result).toBe('Expense Report - USD100.00');
        });

        test('should preserve exact spacing around formula parts', () => {
            const result = compute('Report with type after 4 spaces   {report:type}-and no space after computed part', mockContext);
            expect(result).toBe('Report with type after 4 spaces   Expense Report-and no space after computed part');
        });
    });

    describe('isFormula()', () => {
        test('should detect formulas', () => {
            expect(isFormula('{report:type}')).toBe(true);
            expect(isFormula('Text with {report:type} formula')).toBe(true);
        });

        test('should detect non-formulas', () => {
            expect(isFormula('plain text')).toBe(false);
            expect(isFormula('\\{escaped}')).toBe(false);
            expect(isFormula('')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('should handle malformed braces', () => {
            const parts = parse('{incomplete');
            expect(parts[0].type).toBe('freetext');
        });

        test('should handle invalid date', () => {
            const context: FormulaContext = {
                report: {lastVisibleActionCreated: 'invalid-date'} as any,
                policy: null,
            };
            const result = compute('{report:startdate}', context);
            expect(result).toBe('');
        });

        test('should handle undefined amounts', () => {
            const context: FormulaContext = {
                report: {total: undefined} as any,
                policy: null,
            };
            const result = compute('{report:total}', context);
            expect(result).toBe('');
        });

        test('should handle missing report actions for created', () => {
            mockReportActionsUtils.getAllReportActions.mockReturnValue({});
            const context: FormulaContext = {
                report: {reportID: '123'} as any,
                policy: null,
            };

            const result = compute('{report:created}', context);
            expect(result).toBe('');
        });

        test('should handle missing transactions for startdate', () => {
            mockReportUtils.getReportTransactions.mockReturnValue([]);
            const context: FormulaContext = {
                report: {reportID: '123'} as any,
                policy: null,
            };

            const result = compute('{report:startdate}', context);
            expect(result).toBe('');
        });

        test('should call getReportTransactions with correct reportID for startdate', () => {
            const context: FormulaContext = {
                report: {reportID: 'test-report-123'} as any,
                policy: null,
            };

            compute('{report:startdate}', context);
            expect(mockReportUtils.getReportTransactions).toHaveBeenCalledWith('test-report-123');
        });

        test('should call getAllReportActions with correct reportID for created', () => {
            const context: FormulaContext = {
                report: {reportID: 'test-report-456'} as any,
                policy: null,
            };

            compute('{report:created}', context);
            expect(mockReportActionsUtils.getAllReportActions).toHaveBeenCalledWith('test-report-456');
        });
    });
});
