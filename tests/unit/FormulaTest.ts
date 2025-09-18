// eslint-disable-next-line no-restricted-syntax -- disabled because we need CurrencyUtils to mock
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {FormulaContext} from '@libs/Formula';
import {compute, extract, parse} from '@libs/Formula';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportActionsUtils to mock
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Policy, Report, ReportActions, Transaction} from '@src/types/onyx';

jest.mock('@libs/ReportActionsUtils', () => ({
    getAllReportActions: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    getReportTransactions: jest.fn(),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    getCurrencySymbol: jest.fn(),
}));

const mockReportActionsUtils = ReportActionsUtils as jest.Mocked<typeof ReportActionsUtils>;
const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;
const mockCurrencyUtils = CurrencyUtils as jest.Mocked<typeof CurrencyUtils>;

describe('CustomFormula', () => {
    describe('extract()', () => {
        test('should extract formula parts with default braces', () => {
            expect(extract('{report:type} - {report:total}')).toEqual(['{report:type}', '{report:total}']);
        });

        test('should handle nested braces', () => {
            expect(extract('{report:{report:submit:from:firstName|substr:2}}')).toEqual(['{report:{report:submit:from:firstName|substr:2}}']);
        });

        test('should handle escaped braces', () => {
            expect(extract('\\{not-formula} {report:type}')).toEqual(['{report:type}']);
        });

        test('should handle empty formula', () => {
            expect(extract('')).toEqual([]);
        });

        test('should handle formula without braces', () => {
            expect(extract('no braces here')).toEqual([]);
        });
    });

    describe('parse()', () => {
        test('should parse report formula parts', () => {
            const parts = parse('{report:type} {report:startdate}');
            expect(parts).toHaveLength(3);
            expect(parts.at(0)).toEqual({
                definition: '{report:type}',
                type: 'report',
                fieldPath: ['type'],
                functions: [],
            });
            expect(parts.at(2)).toEqual({
                definition: '{report:startdate}',
                type: 'report',
                fieldPath: ['startdate'],
                functions: [],
            });
        });

        test('should parse field formula parts', () => {
            const parts = parse('{field:custom_field}');
            expect(parts.at(0)).toEqual({
                definition: '{field:custom_field}',
                type: 'field',
                fieldPath: ['custom_field'],
                functions: [],
            });
        });

        test('should parse user formula parts with functions', () => {
            const parts = parse('{user:email|frontPart}');
            expect(parts.at(0)).toEqual({
                definition: '{user:email|frontPart}',
                type: 'user',
                fieldPath: ['email'],
                functions: ['frontPart'],
            });
        });

        test('should handle empty formula', () => {
            expect(parse('')).toEqual([]);
        });

        test('should treat formula without braces as free text', () => {
            const parts = parse('no braces here');
            expect(parts).toHaveLength(1);
            expect(parts.at(0)?.type).toBe('freetext');
        });
    });

    describe('compute()', () => {
        const mockContext: FormulaContext = {
            report: {
                reportID: '123',
                reportName: '',
                type: 'expense',
                total: -10000, // -$100.00
                currency: 'USD',
                lastVisibleActionCreated: '2025-01-15T10:30:00Z',
                policyID: 'policy1',
            } as Report,
            policy: {
                name: 'Test Policy',
            } as Policy,
        };

        beforeEach(() => {
            jest.clearAllMocks();

            mockCurrencyUtils.getCurrencySymbol.mockImplementation((currency: string) => {
                if (currency === 'USD') {
                    return '$';
                }
                return currency;
            });

            const mockReportActions = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    created: '2025-01-10T08:00:00Z', // Oldest action
                    actionName: 'CREATED',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '2': {
                    reportActionID: '2',
                    created: '2025-01-15T10:30:00Z', // Later action
                    actionName: 'IOU',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '3': {
                    reportActionID: '3',
                    created: '2025-01-12T14:20:00Z', // Middle action
                    actionName: 'COMMENT',
                },
            } as unknown as ReportActions;

            const mockTransactions = [
                {
                    transactionID: 'trans1',
                    created: '2025-01-08T12:00:00Z', // Oldest transaction
                    amount: 5000,
                    merchant: 'ACME Ltd.',
                },
                {
                    transactionID: 'trans2',
                    created: '2025-01-14T16:45:00Z', // Later transaction
                    amount: 3000,
                    merchant: 'ACME Ltd.',
                },
                {
                    transactionID: 'trans3',
                    created: '2025-01-11T09:15:00Z', // Middle transaction
                    amount: 2000,
                    merchant: 'ACME Ltd.',
                },
            ] as Transaction[];

            mockReportActionsUtils.getAllReportActions.mockReturnValue(mockReportActions);
            mockReportUtils.getReportTransactions.mockReturnValue(mockTransactions);
        });

        test('should compute basic report formula', () => {
            const result = compute('{report:type} {report:total}', mockContext);
            expect(result).toBe('Expense Report $100.00'); // No space between parts
        });

        test('should compute startdate formula using transactions', () => {
            const result = compute('{report:startdate}', mockContext);
            expect(result).toBe('2025-01-08'); // Should use oldest transaction date (2025-01-08)
        });

        test('should compute created formula using report actions', () => {
            const result = compute('{report:created}', mockContext);
            expect(result).toBe('2025-01-10'); // Should use oldest report action date (2025-01-10)
        });

        test('should compute startdate with custom format', () => {
            const result = compute('{report:startdate:MM/dd/yyyy}', mockContext);
            expect(result).toBe('01/08/2025'); // Should use oldest transaction date with yyyy-MM-dd format
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
        });

        test('should handle unknown formula parts', () => {
            const result = compute('{report:unknown}', mockContext);
            expect(result).toBe('{report:unknown}');
        });

        test('should handle missing report data gracefully', () => {
            const contextWithMissingData: FormulaContext = {
                report: {} as unknown as Report,
                policy: null as unknown as Policy,
            };
            const result = compute('{report:total} {report:policyname}', contextWithMissingData);
            expect(result).toBe('{report:total} {report:policyname}'); // Empty data is replaced with definition
        });

        test('should preserve free text', () => {
            const result = compute('Expense Report - {report:total}', mockContext);
            expect(result).toBe('Expense Report - $100.00');
        });

        test('should preserve exact spacing around formula parts', () => {
            const result = compute('Report with type after 4 spaces   {report:type}-and no space after computed part', mockContext);
            expect(result).toBe('Report with type after 4 spaces   Expense Report-and no space after computed part');
        });
    });

    describe('Edge Cases', () => {
        test('should handle malformed braces', () => {
            const parts = parse('{incomplete');
            expect(parts.at(0)?.type).toBe('freetext');
        });

        test('should handle undefined amounts', () => {
            const context: FormulaContext = {
                report: {total: undefined} as Report,
                policy: null as unknown as Policy,
            };
            const result = compute('{report:total}', context);
            expect(result).toBe('{report:total}');
        });

        test('should handle missing report actions for created', () => {
            mockReportActionsUtils.getAllReportActions.mockReturnValue({});
            const context: FormulaContext = {
                report: {reportID: '123'} as Report,
                policy: null as unknown as Policy,
            };

            const result = compute('{report:created}', context);
            expect(result).toBe('{report:created}');
        });

        test('should handle missing transactions for startdate', () => {
            mockReportUtils.getReportTransactions.mockReturnValue([]);
            const context: FormulaContext = {
                report: {reportID: '123'} as Report,
                policy: null as unknown as Policy,
            };
            const today = new Date();
            const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const result = compute('{report:startdate}', context);
            expect(result).toBe(expected);
        });

        test('should call getReportTransactions with correct reportID for startdate', () => {
            const context: FormulaContext = {
                report: {reportID: 'test-report-123'} as Report,
                policy: null as unknown as Policy,
            };

            compute('{report:startdate}', context);
            expect(mockReportUtils.getReportTransactions).toHaveBeenCalledWith('test-report-123');
        });

        test('should call getAllReportActions with correct reportID for created', () => {
            const context: FormulaContext = {
                report: {reportID: 'test-report-456'} as Report,
                policy: null as unknown as Policy,
            };

            compute('{report:created}', context);
            expect(mockReportActionsUtils.getAllReportActions).toHaveBeenCalledWith('test-report-456');
        });

        test('should skip partial transactions (empty merchant)', () => {
            const mockTransactions = [
                {
                    transactionID: 'trans1',
                    created: '2025-01-15T12:00:00Z',
                    amount: 5000,
                    merchant: 'ACME Ltd.',
                },
                {
                    transactionID: 'trans2',
                    created: '2025-01-08T16:45:00Z', // Older but partial
                    amount: 3000,
                    merchant: '', // Empty merchant = partial
                },
                {
                    transactionID: 'trans3',
                    created: '2025-01-12T09:15:00Z', // Should be oldest valid
                    amount: 2000,
                    merchant: 'Gamma Inc.',
                },
            ] as Transaction[];

            mockReportUtils.getReportTransactions.mockReturnValue(mockTransactions);
            const context: FormulaContext = {
                report: {reportID: 'test-report-123'} as Report,
                policy: null as unknown as Policy,
            };

            const result = compute('{report:startdate}', context);
            expect(result).toBe('2025-01-12');
        });

        test('should skip partial transactions (zero amount)', () => {
            const mockTransactions = [
                {
                    transactionID: 'trans1',
                    created: '2025-01-15T12:00:00Z',
                    amount: 5000,
                    merchant: 'ACME Ltd.',
                },
                {
                    transactionID: 'trans2',
                    created: '2025-01-08T16:45:00Z', // Older but partial
                    amount: 0, // Zero amount = partial
                    merchant: 'Beta Corp.',
                    iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                },
                {
                    transactionID: 'trans3',
                    created: '2025-01-12T09:15:00Z', // Should be oldest valid
                    amount: 2000,
                    merchant: 'Gamma Inc.',
                },
            ] as Transaction[];

            mockReportUtils.getReportTransactions.mockReturnValue(mockTransactions);
            const context: FormulaContext = {
                report: {reportID: 'test-report-123'} as Report,
                policy: null as unknown as Policy,
            };

            const result = compute('{report:startdate}', context);
            expect(result).toBe('2025-01-12');
        });
    });
});
