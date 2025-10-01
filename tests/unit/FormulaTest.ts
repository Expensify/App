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

    describe('Function Modifiers', () => {
        const mockContext: FormulaContext = {
            report: {
                reportID: 'report123456789',
                reportName: '',
                type: 'expense',
                total: -10000, // -$100.00
                currency: 'USD',
                lastVisibleActionCreated: '2025-01-15T10:30:00Z',
                policyID: 'policy1',
            } as Report,
            policy: {
                name: 'Engineering Department Rules',
            } as Policy,
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        describe('frontpart modifier', () => {
            test('should extract front part of email', () => {
                const result = compute('{report:submit:from:email|frontpart}', mockContext);
                // Submit part extraction not implemented yet; for now, it returns the definition
                // Once implemented, this should return 'frontpart' of the email
                expect(result).toBe('{report:submit:from:email|frontpart}');
            });

            test('should extract first word from non-email text', () => {
                const result = compute('{report:policyname|frontpart}', mockContext);
                expect(result).toBe('Engineering'); // First word of "Engineering Department Rules"
            });

            test('should handle empty strings', () => {
                const contextWithEmpty: FormulaContext = {
                    report: {} as Report,
                    policy: {name: ''} as Policy,
                };
                const result = compute('{report:policyname|frontpart}', contextWithEmpty);
                expect(result).toBe('{report:policyname|frontpart}'); // Falls back to formula definition
            });
        });

        describe('domain modifier', () => {
            test('should extract domain from email', () => {
                const result = compute('{report:submit:from:email|domain}', mockContext);
                // Submit part extraction not implemented yet; for now, it returns the definition
                // Once implemented, this should return 'domain' of the email
                expect(result).toBe('');
            });

            test('should return empty for non-email text', () => {
                const result = compute('{report:policyname|domain}', mockContext);
                expect(result).toBe(''); // "Engineering Department Rules" has no @ symbol
            });

            test('should handle empty strings', () => {
                const contextWithEmpty: FormulaContext = {
                    report: {} as Report,
                    policy: {name: ''} as Policy,
                };
                const result = compute('{report:policyname|domain}', contextWithEmpty);
                expect(result).toBe(''); // Empty policy name
            });
        });

        describe('substr modifier', () => {
            test('should extract substring with start and length', () => {
                const result = compute('{report:policyname|substr:0:11}', mockContext);
                expect(result).toBe('Engineering'); // First 11 characters of "Engineering Department Rules"
            });

            test('should extract substring with only start position', () => {
                const result = compute('{report:policyname|substr:12}', mockContext);
                expect(result).toBe('Department Rules'); // From position 12 to end
            });

            test('should handle start position beyond string length', () => {
                const result = compute('{report:policyname|substr:50:10}', mockContext);
                expect(result).toBe(''); // Start position 50 is beyond string length
            });

            test('should handle length larger than remaining string', () => {
                const result = compute('{report:policyname|substr:23:50}', mockContext);
                expect(result).toBe('Rules'); // Only remaining characters
            });

            test('should handle invalid length parameter', () => {
                const result = compute('{report:policyname|substr:0:abc}', mockContext);
                expect(result).toBe(''); // Invalid length, returns empty
            });
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

    describe('Advanced Date Formatting', () => {
        const testDate = '2025-01-08T15:30:45.123Z'; // Wednesday, January 8, 2025, 3:30:45.123 PM UTC
        const mockContextWithDate: FormulaContext = {
            report: {reportID: '123'} as Report,
            policy: null as unknown as Policy,
        };

        beforeEach(() => {
            const mockTransaction = {
                transactionID: 'trans1',
                created: testDate,
                amount: -5000,
                merchant: 'Test Store',
            } as Transaction;
            mockReportUtils.getReportTransactions.mockReturnValue([mockTransaction]);

            const mockReportAction = {
                created: testDate,
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            } as unknown as ReportActions[string];
            mockReportActionsUtils.getAllReportActions.mockReturnValue({action1: mockReportAction});
        });

        describe('Year Formats', () => {
            test('should format year as 4-digit (yyyy)', () => {
                const result = compute('{report:startdate:yyyy}', mockContextWithDate);
                expect(result).toBe('2025');
            });

            test('should format year as 4-digit alternative (YYYY)', () => {
                const result = compute('{report:startdate:YYYY}', mockContextWithDate);
                expect(result).toBe('2025');
            });

            test('should format year as 2-digit (yy)', () => {
                const result = compute('{report:startdate:yy}', mockContextWithDate);
                expect(result).toBe('25');
            });

            test('should format year as 2-digit alternative (y)', () => {
                const result = compute('{report:startdate:y}', mockContextWithDate);
                expect(result).toBe('25');
            });

            test('should format year as 4-digit alternative (Y)', () => {
                const result = compute('{report:startdate:Y}', mockContextWithDate);
                expect(result).toBe('2025');
            });
        });

        describe('Month Formats', () => {
            test('should format full month name (MMMM)', () => {
                const result = compute('{report:startdate:MMMM}', mockContextWithDate);
                expect(result).toBe('January');
            });

            test('should format short month name (MMM)', () => {
                const result = compute('{report:startdate:MMM}', mockContextWithDate);
                expect(result).toBe('Jan');
            });

            test('should format month with leading zero (MM)', () => {
                const result = compute('{report:startdate:MM}', mockContextWithDate);
                expect(result).toBe('01');
            });

            test('should format month without leading zero (M)', () => {
                const result = compute('{report:startdate:M}', mockContextWithDate);
                expect(result).toBe('1');
            });

            test('should format full month name alternative (F)', () => {
                const result = compute('{report:startdate:F}', mockContextWithDate);
                expect(result).toBe('January');
            });

            test('should format month without leading zero using n', () => {
                const result = compute('{report:startdate:n}', mockContextWithDate);
                expect(result).toBe('1');
            });

            test('should format number of days in month (t)', () => {
                const result = compute('{report:startdate:t}', mockContextWithDate);
                expect(result).toBe('31'); // January has 31 days
            });
        });

        describe('Day Formats', () => {
            test('should format day with leading zero (dd)', () => {
                const result = compute('{report:startdate:dd}', mockContextWithDate);
                expect(result).toBe('08');
            });

            test('should format day with leading zero (d)', () => {
                const result = compute('{report:startdate:d}', mockContextWithDate);
                expect(result).toBe('08');
            });

            test('should format day without leading zero (j)', () => {
                const result = compute('{report:startdate:j}', mockContextWithDate);
                expect(result).toBe('8');
            });

            test('should format ordinal suffix (S)', () => {
                const result = compute('{report:startdate:S}', mockContextWithDate);
                expect(result).toBe('th');
            });

            test('should format three letter day name (D)', () => {
                const result = compute('{report:startdate:D}', mockContextWithDate);
                expect(result).toBe('Wed'); // Wednesday
            });

            test('should format abbreviated day name (ddd)', () => {
                const result = compute('{report:startdate:ddd}', mockContextWithDate);
                expect(result).toBe('Wed');
            });

            test('should format full day name (dddd)', () => {
                const result = compute('{report:startdate:dddd}', mockContextWithDate);
                expect(result).toBe('Wednesday');
            });

            test('should format full day name with l (lowercase L)', () => {
                const result = compute('{report:startdate:l}', mockContextWithDate);
                expect(result).toBe('Wednesday');
            });

            test('should format numeric day of week (w)', () => {
                const result = compute('{report:startdate:w}', mockContextWithDate);
                expect(result).toBe('3'); // Wednesday = 3 (Sunday = 0)
            });

            test('should format ISO day of week (N)', () => {
                const result = compute('{report:startdate:N}', mockContextWithDate);
                expect(result).toBe('3'); // Wednesday = 3 (Monday = 1)
            });

            test('should format day of year (z)', () => {
                const result = compute('{report:startdate:z}', mockContextWithDate);
                expect(result).toBe('7'); // January 8 = day 7 (0-indexed)
            });

            test('should format ISO week number (W)', () => {
                const result = compute('{report:startdate:W}', mockContextWithDate);
                expect(result).toBe('02'); // Second week of January
            });
        });

        describe('Complex Format Strings', () => {
            test('should handle multiple format tokens (MMMM dd, yyyy)', () => {
                const result = compute('{report:startdate:MMMM dd, yyyy}', mockContextWithDate);
                expect(result).toBe('January 08, 2025');
            });

            test('should handle dd MMM yyyy format', () => {
                const result = compute('{report:startdate:dd MMM yyyy}', mockContextWithDate);
                expect(result).toBe('08 Jan 2025');
            });

            test('should handle ordinal suffix combinations (jS)', () => {
                const result = compute('{report:startdate:jS}', mockContextWithDate);
                expect(result).toBe('8th');
            });

            test('should handle mixed format tokens correctly', () => {
                // Test that tt and t tokens work correctly together in simple cases
                const ttResult = compute('{report:created:tt}', mockContextWithDate);
                expect(ttResult).toBe('PM');

                const tResult = compute('{report:created:t}', mockContextWithDate);
                expect(tResult).toBe('31'); // Days in January

                // Test multiple tokens with spaces (avoiding colon parsing issues for now)
                const mixedResult = compute('{report:startdate:MMMM dd yyyy} at {report:created:HH} {report:created:mm} {report:created:tt}', mockContextWithDate);
                expect(mixedResult).toBe('January 08 2025 at 15 30 PM');
            });
        });

        describe('Time Formats', () => {
            // testDate = '2025-01-08T15:30:45.123Z' = 3:30:45 PM UTC

            test('should format 12-hour without leading zero (g)', () => {
                const result = compute('{report:startdate:g}', mockContextWithDate);
                expect(result).toBe('3'); // 3 PM
            });

            test('should format 24-hour without leading zero (G)', () => {
                const result = compute('{report:startdate:G}', mockContextWithDate);
                expect(result).toBe('15'); // 15:30
            });

            test('should format 12-hour with leading zero (h)', () => {
                const result = compute('{report:startdate:h}', mockContextWithDate);
                expect(result).toBe('3'); // 03 PM
            });

            test('should format 12-hour with leading zero (hh)', () => {
                const result = compute('{report:startdate:hh}', mockContextWithDate);
                expect(result).toBe('03'); // 03 PM
            });

            test('should format 24-hour with leading zero (H)', () => {
                const result = compute('{report:startdate:H}', mockContextWithDate);
                expect(result).toBe('15'); // 15:30
            });

            test('should format 24-hour with leading zero (HH)', () => {
                const result = compute('{report:startdate:HH}', mockContextWithDate);
                expect(result).toBe('15'); // 15:30
            });

            test('should format minutes (i)', () => {
                const result = compute('{report:startdate:i}', mockContextWithDate);
                expect(result).toBe('30');
            });

            test('should format minutes (mm)', () => {
                const result = compute('{report:startdate:mm}', mockContextWithDate);
                expect(result).toBe('30');
            });

            test('should format seconds (s)', () => {
                const result = compute('{report:startdate:s}', mockContextWithDate);
                expect(result).toBe('45');
            });

            test('should format seconds (ss)', () => {
                const result = compute('{report:startdate:ss}', mockContextWithDate);
                expect(result).toBe('45');
            });

            test('should format lowercase am/pm (a)', () => {
                const result = compute('{report:startdate:a}', mockContextWithDate);
                expect(result).toBe('pm');
            });

            test('should format uppercase AM/PM (A)', () => {
                const result = compute('{report:startdate:A}', mockContextWithDate);
                expect(result).toBe('PM');
            });

            test('should format AM/PM designator (tt)', () => {
                const result = compute('{report:startdate:tt}', mockContextWithDate);
                expect(result).toBe('PM');
            });

            test('should format morning time correctly', () => {
                // Create a morning date
                const morningDate = '2025-01-08T09:30:45.123Z'; // 9:30:45 AM UTC
                const mockTransaction = {
                    transactionID: 'trans1',
                    created: morningDate,
                    amount: -5000,
                    merchant: 'Test Store',
                } as Transaction;
                mockReportUtils.getReportTransactions.mockReturnValue([mockTransaction]);

                // Format: hour without leading zero : minutes with space and am/pm
                const result = compute('{report:startdate:g}:{report:startdate:i} {report:startdate:a}', mockContextWithDate);
                expect(result).toBe('9:30 am');
            });
        });
    });
});
