// eslint-disable-next-line no-restricted-syntax -- disabled because we need CurrencyUtils to mock
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {FormulaContext} from '@libs/Formula';
import {compute, hasCircularReferences, parse} from '@libs/Formula';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportActionsUtils to mock
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {PersonalDetails, Policy, Report, ReportActions, Transaction} from '@src/types/onyx';

jest.mock('@libs/ReportActionsUtils', () => ({
    getAllReportActions: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    getReportTransactions: jest.fn(),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    ...jest.requireActual<typeof CurrencyUtils>('@libs/CurrencyUtils'),
    isValidCurrencyCode: jest.fn(),
}));

const mockReportActionsUtils = ReportActionsUtils as jest.Mocked<typeof ReportActionsUtils>;
const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;
const mockCurrencyUtils = CurrencyUtils as jest.Mocked<typeof CurrencyUtils>;

describe('CustomFormula', () => {
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

            mockCurrencyUtils.isValidCurrencyCode.mockImplementation((code: string) => ['USD', 'EUR', 'JPY', 'NPR'].includes(code));

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

        test('should compute enddate formula using transactions', () => {
            const result = compute('{report:enddate}', mockContext);
            expect(result).toBe('2025-01-14'); // Should use newest transaction date (2025-01-14)
        });

        test('should compute created formula using report actions', () => {
            const result = compute('{report:created}', mockContext);
            expect(result).toBe('2025-01-10'); // Should use oldest report action date (2025-01-10)
        });

        test('should compute startdate with custom format', () => {
            const result = compute('{report:startdate:MM/dd/yyyy}', mockContext);
            expect(result).toBe('01/08/2025'); // Should use oldest transaction date with yyyy-MM-dd format
        });

        test('should compute enddate with custom format', () => {
            const result = compute('{report:enddate:MM/dd/yyyy}', mockContext);
            expect(result).toBe('01/14/2025'); // Should use newest transaction date with MM/dd/yyyy format
        });

        test('should compute created with custom format', () => {
            const result = compute('{report:created:MMMM dd, yyyy}', mockContext);
            expect(result).toBe('January 10, 2025'); // Should use oldest report action date with MMMM dd, yyyy format
        });

        test('should compute startdate with short month format', () => {
            const result = compute('{report:startdate:dd MMM yyyy}', mockContext);
            expect(result).toBe('08 Jan 2025'); // Should use oldest transaction date with dd MMM yyyy format
        });

        test('should compute enddate with short month format', () => {
            const result = compute('{report:enddate:dd MMM yyyy}', mockContext);
            expect(result).toBe('14 Jan 2025'); // Should use newest transaction date with dd MMM yyyy format
        });

        test('should compute policy name', () => {
            const result = compute('{report:policyname}', mockContext);
            expect(result).toBe('Test Policy');
        });

        test('should compute report ID in base62 format', () => {
            const result = compute('{report:id}', mockContext);
            expect(result).toBe('R0000000001z');
        });

        test('should compute report status', () => {
            const contextWithStatus: FormulaContext = {
                ...mockContext,
                report: {
                    ...mockContext.report,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                },
            };
            const result = compute('{report:status}', contextWithStatus);
            expect(result).toBe('Submitted');
        });

        test('should compute expenses count', () => {
            const result = compute('{report:expensescount}', mockContext);
            expect(result).toBe('0');
        });

        test('should compute expenses count using allTransactions from context', () => {
            const allTransactions = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                transactions_trans1: {
                    transactionID: 'trans1',
                    reportID: '123',
                    created: '2025-01-08T12:00:00Z',
                    amount: 5000,
                    merchant: 'ACME Ltd.',
                } as Transaction,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                transactions_trans2: {
                    transactionID: 'trans2',
                    reportID: '123',
                    created: '2025-01-14T16:45:00Z',
                    amount: 3000,
                    merchant: 'ACME Ltd.',
                } as Transaction,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                transactions_trans3: {
                    transactionID: 'trans3',
                    reportID: '123',
                    created: '2025-01-11T09:15:00Z',
                    amount: 2000,
                    merchant: 'ACME Ltd.',
                } as Transaction,
            };

            const contextWithAllTransactions: FormulaContext = {
                ...mockContext,
                allTransactions,
            };

            const result = compute('{report:expensescount}', contextWithAllTransactions);
            expect(result).toBe('3');
            // Verify that getReportTransactions was NOT called when allTransactions is provided
            expect(mockReportUtils.getReportTransactions).not.toHaveBeenCalled();
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

        test('should compute complex formula with multiple new parts', () => {
            const contextWithStatus: FormulaContext = {
                ...mockContext,
                report: {
                    ...mockContext.report,
                    transactionCount: 3,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                },
            };
            const result = compute('Report {report:id} has {report:expensescount} expenses and is {report:status}', contextWithStatus);
            expect(result).toBe('Report R0000000001z has 3 expenses and is Approved');
        });

        test('should handle combination of new and existing formula parts', () => {
            const contextWithStatus: FormulaContext = {
                ...mockContext,
                report: {
                    ...mockContext.report,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    transactionCount: 3,
                },
            };
            const result = compute('{report:type} {report:id} - {report:status} - Total: {report:total} ({report:expensescount} expenses)', contextWithStatus);
            expect(result).toBe('Expense Report R0000000001z - Submitted - Total: $100.00 (3 expenses)');
        });

        test('should handle different status numbers', () => {
            const testCases = [
                {statusNum: CONST.REPORT.STATUS_NUM.OPEN, expected: 'Open'},
                {statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, expected: 'Submitted'},
                {statusNum: CONST.REPORT.STATUS_NUM.CLOSED, expected: 'Closed'},
                {statusNum: CONST.REPORT.STATUS_NUM.APPROVED, expected: 'Approved'},
                {statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED, expected: 'Reimbursed'},
            ];

            for (const {statusNum, expected} of testCases) {
                const contextWithStatus: FormulaContext = {
                    ...mockContext,
                    report: {
                        ...mockContext.report,
                        statusNum,
                    },
                };
                const result = compute('{report:status}', contextWithStatus);
                expect(result).toBe(expected);
            }
        });

        test('should handle undefined status number', () => {
            const contextWithUndefinedStatus: FormulaContext = {
                ...mockContext,
                report: {
                    ...mockContext.report,
                    statusNum: undefined,
                },
            };
            const result = compute('{report:status}', contextWithUndefinedStatus);
            expect(result).toBe('{report:status}');
        });

        test('should return 0 for expensescount when no transactions exist', () => {
            mockReportUtils.getReportTransactions.mockReturnValue([]);
            const result = compute('{report:expensescount}', mockContext);
            expect(result).toBe('0');
        });

        test('should return 0 for expensescount when reportID is empty', () => {
            const contextWithEmptyReportID: FormulaContext = {
                ...mockContext,
                report: {
                    ...mockContext.report,
                    reportID: '',
                },
            };
            const result = compute('{report:expensescount}', contextWithEmptyReportID);
            expect(result).toBe('0');
        });

        test('should compute report ID with different reportID values', () => {
            const contextWithDifferentID: FormulaContext = {
                ...mockContext,
                report: {
                    ...mockContext.report,
                    reportID: '456789',
                },
            };
            const result = compute('{report:id}', contextWithDifferentID);
            expect(result).toBe('R00000001upZ');
        });
    });

    describe('Reimbursable Amount', () => {
        const reimbursableContext: FormulaContext = {
            report: {
                reportID: '123',
                reportName: '',
                type: 'expense',
                policyID: 'policy1',
            },
            policy: {
                name: 'Test Policy',
            } as Policy,
        };

        const calculateExpectedReimbursable = (total: number, nonReimbursableTotal: number) => {
            const reimbursableAmount = total - nonReimbursableTotal;
            return Math.abs(reimbursableAmount) / 100;
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should compute reimbursable amount', () => {
            reimbursableContext.report.currency = 'USD';
            reimbursableContext.report.total = -10000; // -$100.00
            reimbursableContext.report.nonReimbursableTotal = -2500; // -$25.00

            const expectedReimbursable = calculateExpectedReimbursable(reimbursableContext.report.total, reimbursableContext.report.nonReimbursableTotal);
            const result = compute('{report:reimbursable}', reimbursableContext);
            expect(result).toBe(`$${expectedReimbursable.toFixed(2)}`);
        });

        test('should compute reimbursable amount with different currency', () => {
            reimbursableContext.report.currency = 'EUR';
            reimbursableContext.report.total = -8000; // -€80.00
            reimbursableContext.report.nonReimbursableTotal = -3000; // -€30.00

            const expectedReimbursable = calculateExpectedReimbursable(reimbursableContext.report.total, reimbursableContext.report.nonReimbursableTotal);
            const result = compute('{report:reimbursable}', reimbursableContext);

            expect(result).toBe(`€${expectedReimbursable.toFixed(2)}`);
        });

        test('should handle zero reimbursable amount', () => {
            reimbursableContext.report.currency = 'USD';
            reimbursableContext.report.total = -10000; // -$100.00
            reimbursableContext.report.nonReimbursableTotal = -10000; // -$100.00 (all non-reimbursable)

            const expectedReimbursable = calculateExpectedReimbursable(reimbursableContext.report.total, reimbursableContext.report.nonReimbursableTotal);
            const result = compute('{report:reimbursable}', reimbursableContext);
            expect(result).toBe(`$${expectedReimbursable.toFixed(2)}`);
        });

        test('should handle undefined reimbursable amount', () => {
            reimbursableContext.report.currency = 'USD';
            reimbursableContext.report.total = undefined;
            reimbursableContext.report.nonReimbursableTotal = undefined;

            const result = compute('{report:reimbursable}', reimbursableContext);
            expect(result).toBe('$0.00');
        });

        test('should handle missing currency gracefully', () => {
            reimbursableContext.report.currency = undefined;
            reimbursableContext.report.total = -10000; // -100.00
            reimbursableContext.report.nonReimbursableTotal = -2500; // -25.00

            const expectedReimbursable = calculateExpectedReimbursable(reimbursableContext.report.total, reimbursableContext.report.nonReimbursableTotal);
            const result = compute('{report:reimbursable}', reimbursableContext);
            expect(result).toBe(`${expectedReimbursable.toFixed(2)}`);
        });

        describe('Currency Formatting & Conversion', () => {
            const currencyContext: FormulaContext = {
                report: {
                    reportID: '123',
                    total: -10000,
                    currency: 'USD',
                } as Report,
                policy: {} as Policy,
            };

            beforeEach(() => {
                jest.clearAllMocks();
            });

            describe('Format options', () => {
                test('nosymbol - should format without currency symbol', () => {
                    const result = compute('{report:total:nosymbol}', currencyContext);
                    expect(result).toBe('100.00');
                });
                test('same currency - should format normally (case insensitive)', () => {
                    currencyContext.report.currency = 'EUR';
                    expect(compute('{report:total:EUR}', currencyContext)).toBe('€100.00');
                    expect(compute('{report:total:eur}', currencyContext)).toBe('€100.00');
                });

                test('default (no format) - should use report currency', () => {
                    currencyContext.report.currency = 'NPR';
                    const result = compute('{report:total}', currencyContext);
                    expect(result).toBe('NPR\u00A0100.00');
                });
            });

            describe('Currency conversion (requires backend)', () => {
                test('different valid currencies - should return placeholder', () => {
                    currencyContext.report.currency = 'USD';

                    // Various currencies requiring conversion
                    expect(compute('{report:total:EUR}', currencyContext)).toBe('{report:total:EUR}');
                    expect(compute('{report:total:JPY}', currencyContext)).toBe('{report:total:JPY}');
                });

                test('case and whitespace handling - should normalize and detect conversion', () => {
                    currencyContext.report.currency = 'USD';

                    // Mixed case and whitespace
                    expect(compute('{report:total:EuR}', currencyContext)).toBe('{report:total:EuR}');
                    expect(compute('{report:total: EUR }', currencyContext)).toBe('{report:total: EUR }');
                    expect(compute('{report:total:eur }', currencyContext)).toBe('{report:total:eur }');
                });
            });

            describe('Edge cases', () => {
                test('undefined currency - should format without symbol', () => {
                    currencyContext.report.currency = undefined;
                    const result = compute('{report:total}', currencyContext);
                    expect(result).toBe('100.00');
                });

                test('invalid source currency - should return placeholder', () => {
                    currencyContext.report.currency = 'UNKNOWN';
                    const result = compute('{report:total}', currencyContext);
                    expect(result).toBe('{report:total}');
                });

                test('invalid format currency - should return placeholder', () => {
                    currencyContext.report.currency = 'EUR';
                    const result = compute('{report:total:UNKNOWN}', currencyContext);
                    expect(result).toBe('{report:total:UNKNOWN}');
                });
            });
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

    describe('Auto-reporting Frequency', () => {
        const mockReport = {reportID: '123'} as Report;
        const createMockContext = (policy: Policy): FormulaContext => ({report: mockReport, policy});

        beforeEach(() => {
            jest.clearAllMocks();
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-19T14:23:45Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should compute weekly frequency dates', () => {
            const policy = {autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY} as Policy;
            const context = createMockContext(policy);

            expect(compute('{report:autoreporting:start}', context)).toBe('2025-01-13');
            expect(compute('{report:autoreporting:end}', context)).toBe('2025-01-19');
        });

        test('should compute semi-monthly frequency dates', () => {
            jest.setSystemTime(new Date('2025-01-10T12:00:00Z'));
            const policy = {autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY} as Policy;
            const context = createMockContext(policy);

            expect(compute('{report:autoreporting:start}', context)).toBe('2025-01-01');
            expect(compute('{report:autoreporting:end}', context)).toBe('2025-01-15');

            jest.setSystemTime(new Date('2025-01-20T12:00:00Z'));
            expect(compute('{report:autoreporting:start}', context)).toBe('2025-01-16');
            expect(compute('{report:autoreporting:end}', context)).toBe('2025-01-31');
        });

        test('should compute monthly frequency with specific offset', () => {
            const policy = {
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                autoReportingOffset: 25,
            } as Policy;
            const context = createMockContext(policy);

            expect(compute('{report:autoreporting:start}', context)).toBe('2024-12-26');
            expect(compute('{report:autoreporting:end}', context)).toBe('2025-01-25');
        });

        test('should compute monthly frequency with last business day', () => {
            const policy = {
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                autoReportingOffset: CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
            } as Policy;
            const context = createMockContext(policy);

            expect(compute('{report:autoreporting:start}', context)).toBe('2025-01-01');
            expect(compute('{report:autoreporting:end}', context)).toBe('2025-01-31');
        });

        test('should compute trip frequency dates', () => {
            const mockTransactions = [
                {transactionID: 'trans1', created: '2025-01-08T12:00:00Z', merchant: 'Hotel', amount: 5000} as Transaction,
                {transactionID: 'trans2', created: '2025-01-14T16:45:00Z', merchant: 'Restaurant', amount: 3000} as Transaction,
            ];

            mockReportUtils.getReportTransactions.mockReturnValue(mockTransactions);

            const policy = {autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP} as Policy;
            const context = createMockContext(policy);

            expect(compute('{report:autoreporting:start}', context)).toBe('2025-01-08');
            expect(compute('{report:autoreporting:end}', context)).toBe('2025-01-19');
        });

        test('should apply custom date formats', () => {
            const policy = {autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY} as Policy;
            const context = createMockContext(policy);

            expect(compute('{report:autoreporting:start:MMMM dd, yyyy}', context)).toBe('January 13, 2025');
            expect(compute('{report:autoreporting:end:MM/dd/yyyy}', context)).toBe('01/19/2025');
        });

        test('should return formula definition when policy or frequency is missing', () => {
            expect(compute('{report:autoreporting:start}', {report: mockReport, policy: undefined})).toBe('{report:autoreporting:start}');
            expect(compute('{report:autoreporting:end}', createMockContext({} as Policy))).toBe('{report:autoreporting:end}');
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

        test('should handle missing transactions for enddate', () => {
            mockReportUtils.getReportTransactions.mockReturnValue([]);
            const context: FormulaContext = {
                report: {reportID: '123'} as Report,
                policy: null as unknown as Policy,
            };
            const today = new Date();
            const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const result = compute('{report:enddate}', context);
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

            const endResult = compute('{report:enddate}', context);
            expect(endResult).toBe('2025-01-15');
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

            const endResult = compute('{report:enddate}', context);
            expect(endResult).toBe('2025-01-15');
        });
    });

    describe('Date Format Tokens', () => {
        // Test date: Wednesday, January 8, 2025, 3:30:45 PM (15:30:45) UTC
        const testDate = '2025-01-08T15:30:45.123Z';
        const morningDate = '2025-01-08T09:05:02.123Z'; // 9:05:02 AM for leading zero tests

        const mockContextWithDate: FormulaContext = {
            report: {reportID: '123'} as Report,
            policy: null as unknown as Policy,
        };

        const setupMockDate = (date: string) => {
            const mockTransaction = {
                transactionID: 'trans1',
                created: date,
                amount: -5000,
                merchant: 'Test Store',
            } as Transaction;
            mockReportUtils.getReportTransactions.mockReturnValue([mockTransaction]);

            const mockReportAction = {
                created: date,
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            } as unknown as ReportActions[string];
            mockReportActionsUtils.getAllReportActions.mockReturnValue({action1: mockReportAction});
        };

        beforeEach(() => setupMockDate(testDate));

        test('year formats - yyyy/yy/Y/y/YYYY', () => {
            expect(compute('{report:startdate:yyyy}', mockContextWithDate)).toBe('2025');
            expect(compute('{report:startdate:YYYY}', mockContextWithDate)).toBe('2025');
            expect(compute('{report:startdate:Y}', mockContextWithDate)).toBe('2025');
            expect(compute('{report:startdate:yy}', mockContextWithDate)).toBe('25');
            expect(compute('{report:startdate:y}', mockContextWithDate)).toBe('25');
        });

        test('month formats - names and numbers', () => {
            expect(compute('{report:startdate:MMMM}', mockContextWithDate)).toBe('January');
            expect(compute('{report:startdate:F}', mockContextWithDate)).toBe('January');
            expect(compute('{report:startdate:MMM}', mockContextWithDate)).toBe('Jan');
            expect(compute('{report:startdate:M}', mockContextWithDate)).toBe('Jan');
            expect(compute('{report:startdate:MM}', mockContextWithDate)).toBe('01');
            expect(compute('{report:startdate:n}', mockContextWithDate)).toBe('1');
            expect(compute('{report:startdate:t}', mockContextWithDate)).toBe('31');
        });

        test('day formats - numbers and names', () => {
            expect(compute('{report:startdate:dd}', mockContextWithDate)).toBe('08');
            expect(compute('{report:startdate:d}', mockContextWithDate)).toBe('08');
            expect(compute('{report:startdate:j}', mockContextWithDate)).toBe('8');
            expect(compute('{report:startdate:S}', mockContextWithDate)).toBe('th');
            expect(compute('{report:startdate:jS}', mockContextWithDate)).toBe('8th');
            expect(compute('{report:startdate:dddd}', mockContextWithDate)).toBe('Wednesday');
            expect(compute('{report:startdate:l}', mockContextWithDate)).toBe('Wednesday');
            expect(compute('{report:startdate:ddd}', mockContextWithDate)).toBe('Wed');
            expect(compute('{report:startdate:D}', mockContextWithDate)).toBe('Wed');
            expect(compute('{report:startdate:w}', mockContextWithDate)).toBe('3');
            expect(compute('{report:startdate:N}', mockContextWithDate)).toBe('3');
            expect(compute('{report:startdate:z}', mockContextWithDate)).toBe('7');
            expect(compute('{report:startdate:W}', mockContextWithDate)).toBe('02');
        });

        test('ISO week number - first Thursday rule', () => {
            // January 1, 2021 is a Friday
            // Week 1 of 2021 contains the first Thursday (Jan 7)
            // So Jan 1-3 (Fri, Sat, Sun) belong to week 53 of 2020
            setupMockDate('2021-01-01T12:00:00Z'); // Friday, Jan 1, 2021
            expect(compute('{report:startdate:W}', mockContextWithDate)).toBe('53');

            // January 4 is Monday, which is in week 1
            setupMockDate('2021-01-04T12:00:00Z'); // Monday, Jan 4, 2021
            expect(compute('{report:startdate:W}', mockContextWithDate)).toBe('01');

            // December 31, 2020 is Thursday, should be week 53
            setupMockDate('2020-12-31T12:00:00Z'); // Thursday, Dec 31, 2020
            expect(compute('{report:startdate:W}', mockContextWithDate)).toBe('53');
        });

        test('complex date formats', () => {
            expect(compute('{report:startdate:MMMM dd, yyyy}', mockContextWithDate)).toBe('January 08, 2025');
            expect(compute('{report:startdate:dd MMM yyyy}', mockContextWithDate)).toBe('08 Jan 2025');
            expect(compute('{report:startdate:yyyy-MM-dd}', mockContextWithDate)).toBe('2025-01-08');
        });

        test('time formats - hours', () => {
            // 24-hour format: 15:30:45 (afternoon) and 09:05:02 (morning with leading zero)
            expect(compute('{report:startdate:HH}', mockContextWithDate)).toBe('15');
            expect(compute('{report:startdate:H}', mockContextWithDate)).toBe('15');
            expect(compute('{report:startdate:G}', mockContextWithDate)).toBe('15');

            setupMockDate(morningDate);
            expect(compute('{report:startdate:HH}', mockContextWithDate)).toBe('09');
            expect(compute('{report:startdate:H}', mockContextWithDate)).toBe('09'); // H has leading zeros per spec
            expect(compute('{report:startdate:G}', mockContextWithDate)).toBe('9'); // G has NO leading zeros

            // 12-hour format: 3:30 PM (afternoon) and 9:05 AM (morning)
            setupMockDate(testDate);
            expect(compute('{report:startdate:hh}', mockContextWithDate)).toBe('03');
            expect(compute('{report:startdate:h}', mockContextWithDate)).toBe('03'); // h has leading zeros per spec
            expect(compute('{report:startdate:g}', mockContextWithDate)).toBe('3'); // g has NO leading zeros

            setupMockDate(morningDate);
            expect(compute('{report:startdate:hh}', mockContextWithDate)).toBe('09');
            expect(compute('{report:startdate:h}', mockContextWithDate)).toBe('09'); // h has leading zeros per spec
            expect(compute('{report:startdate:g}', mockContextWithDate)).toBe('9'); // g has NO leading zeros
        });

        test('time formats - minutes and seconds', () => {
            // Minutes: 30 (double digit) and 05 (single digit with leading zero)
            setupMockDate(testDate);
            expect(compute('{report:startdate:mm}', mockContextWithDate)).toBe('30');
            expect(compute('{report:startdate:i}', mockContextWithDate)).toBe('30');

            setupMockDate(morningDate);
            expect(compute('{report:startdate:mm}', mockContextWithDate)).toBe('05');
            expect(compute('{report:startdate:i}', mockContextWithDate)).toBe('05');

            // Seconds: 45 (double digit) and 02 (single digit with leading zero)
            setupMockDate(testDate);
            expect(compute('{report:startdate:ss}', mockContextWithDate)).toBe('45');
            expect(compute('{report:startdate:s}', mockContextWithDate)).toBe('45');

            setupMockDate(morningDate);
            expect(compute('{report:startdate:ss}', mockContextWithDate)).toBe('02');
            expect(compute('{report:startdate:s}', mockContextWithDate)).toBe('02');
        });

        test('time formats - AM/PM', () => {
            expect(compute('{report:startdate:tt}', mockContextWithDate)).toBe('PM');
            expect(compute('{report:startdate:A}', mockContextWithDate)).toBe('PM');
            expect(compute('{report:startdate:a}', mockContextWithDate)).toBe('pm');
        });

        test('full date/time formats - c, r, U', () => {
            // ISO 8601 format (c token)
            const cResult = compute('{report:startdate:c}', mockContextWithDate);
            expect(cResult).toBe('2025-01-08T15:30:45.123Z');

            // RFC 2822 format (r token)
            const rResult = compute('{report:startdate:r}', mockContextWithDate);
            expect(rResult).toMatch(/^Wed, 08 Jan 2025 \d{2}:\d{2}:\d{2} [+-]\d{4}$/);

            // Unix timestamp (U token)
            const uResult = compute('{report:startdate:U}', mockContextWithDate);
            const expectedTimestamp = Math.floor(new Date(testDate).getTime() / 1000).toString();
            expect(uResult).toBe(expectedTimestamp);
        });

        test('format strings with colons', () => {
            expect(compute('{report:startdate:HH:mm}', mockContextWithDate)).toBe('15:30');
            expect(compute('{report:startdate:HH:mm:ss}', mockContextWithDate)).toBe('15:30:45');
            expect(compute('{report:startdate:hh:mm tt}', mockContextWithDate)).toBe('03:30 PM');
            expect(compute('{report:startdate:yyyy-MM-dd HH:mm:ss}', mockContextWithDate)).toBe('2025-01-08 15:30:45');
            expect(compute('{report:created:HH:mm:ss}', mockContextWithDate)).toBe('15:30:45');
            expect(compute('{report:startdate:g:i a}', mockContextWithDate)).toBe('3:30 pm');
        });
    });

    describe('Submission Info', () => {
        const mockSubmitter: PersonalDetails = {
            accountID: 12345,
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            login: 'john.doe@company.com',
        };

        const mockManager: PersonalDetails = {
            accountID: 67890,
            firstName: 'Jane',
            lastName: 'Smith',
            displayName: 'Jane Smith',
            login: 'jane.smith@company.com',
        };

        const mockContextWithSubmissionInfo: FormulaContext = {
            report: {
                reportID: '123',
                reportName: '',
                type: 'expense',
                ownerAccountID: 12345,
                managerID: 67890,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                created: '2025-01-15T10:30:00Z',
            } as Report,
            policy: {
                name: 'Test Policy',
                employeeList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'john.doe@company.com': {
                        email: 'john.doe@company.com',
                        employeeUserID: 'EMP001',
                        employeePayrollID: 'PAY123',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'jane.smith@company.com': {
                        email: 'jane.smith@company.com',
                        employeeUserID: 'EMP002',
                        employeePayrollID: 'PAY456',
                    },
                },
            } as unknown as Policy,
            submitterPersonalDetails: mockSubmitter,
            managerPersonalDetails: mockManager,
        };

        beforeEach(() => {
            jest.clearAllMocks();

            const mockReportActions = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    created: '2025-01-10T08:00:00Z',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '2': {
                    reportActionID: '2',
                    created: '2025-01-15T10:30:00Z',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                },
            } as unknown as ReportActions;

            mockReportActionsUtils.getAllReportActions.mockReturnValue(mockReportActions);
        });

        describe('Submitter information', () => {
            test('firstname - basic submitter first name', () => {
                expect(compute('{report:submit:from:firstname}', mockContextWithSubmissionInfo)).toBe('John');
            });

            test('lastname - basic submitter last name', () => {
                expect(compute('{report:submit:from:lastname}', mockContextWithSubmissionInfo)).toBe('Doe');
            });

            test('fullname - basic submitter full name', () => {
                expect(compute('{report:submit:from:fullname}', mockContextWithSubmissionInfo)).toBe('John Doe');
            });

            test('email - basic submitter email', () => {
                expect(compute('{report:submit:from:email}', mockContextWithSubmissionInfo)).toBe('john.doe@company.com');
            });

            test('userid - submitter employee user ID (alias for customfield1)', () => {
                expect(compute('{report:submit:from:userid}', mockContextWithSubmissionInfo)).toBe('EMP001');
            });

            test('customfield1 - submitter employee user ID from policy', () => {
                expect(compute('{report:submit:from:customfield1}', mockContextWithSubmissionInfo)).toBe('EMP001');
            });

            test('customfield2 - submitter employee payroll ID from policy', () => {
                expect(compute('{report:submit:from:customfield2}', mockContextWithSubmissionInfo)).toBe('PAY123');
            });

            test('payrollid - submitter employee payroll ID (alias for customfield2)', () => {
                expect(compute('{report:submit:from:payrollid}', mockContextWithSubmissionInfo)).toBe('PAY123');
            });

            test('name fields fall back to email when name missing', () => {
                const contextWithPartialDetails: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 111,
                        login: 'fallback@email.com',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:firstname}', contextWithPartialDetails)).toBe('fallback@email.com');
                expect(compute('{report:submit:from:lastname}', contextWithPartialDetails)).toBe('fallback@email.com');
                expect(compute('{report:submit:from:fullname}', contextWithPartialDetails)).toBe('fallback@email.com');
            });

            test('customfield1 - return empty when employeeList missing', () => {
                const contextWithoutEmployeeList: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: {
                        name: 'Test Policy',
                    } as Policy,
                    submitterPersonalDetails: mockSubmitter,
                };

                expect(compute('{report:submit:from:customfield1}', contextWithoutEmployeeList)).toBe('');
            });

            test('customfield2 - return empty when employeeList missing', () => {
                const contextWithoutEmployeeList: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: {
                        name: 'Test Policy',
                    } as Policy,
                    submitterPersonalDetails: mockSubmitter,
                };

                expect(compute('{report:submit:from:customfield2}', contextWithoutEmployeeList)).toBe('');
            });

            test('customfield1 - return empty when user not in employeeList', () => {
                const contextWithDifferentEmployee: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: {
                        name: 'Test Policy',
                        employeeList: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'other.user@company.com': {
                                email: 'other.user@company.com',
                                employeeUserID: 'EMP999',
                            },
                        },
                    } as unknown as Policy,
                    submitterPersonalDetails: mockSubmitter,
                };

                expect(compute('{report:submit:from:customfield1}', contextWithDifferentEmployee)).toBe('');
            });
        });

        describe('Manager information', () => {
            test('firstname - basic manager first name', () => {
                expect(compute('{report:submit:to:firstname}', mockContextWithSubmissionInfo)).toBe('Jane');
            });

            test('lastname - basic manager last name', () => {
                expect(compute('{report:submit:to:lastname}', mockContextWithSubmissionInfo)).toBe('Smith');
            });

            test('fullname - basic manager full name', () => {
                expect(compute('{report:submit:to:fullname}', mockContextWithSubmissionInfo)).toBe('Jane Smith');
            });

            test('email - basic manager email', () => {
                expect(compute('{report:submit:to:email}', mockContextWithSubmissionInfo)).toBe('jane.smith@company.com');
            });

            test('userid - manager employee user ID (alias for customfield1)', () => {
                expect(compute('{report:submit:to:userid}', mockContextWithSubmissionInfo)).toBe('EMP002');
            });

            test('customfield1 - manager employee user ID from policy', () => {
                expect(compute('{report:submit:to:customfield1}', mockContextWithSubmissionInfo)).toBe('EMP002');
            });

            test('customfield2 - manager employee payroll ID from policy', () => {
                expect(compute('{report:submit:to:customfield2}', mockContextWithSubmissionInfo)).toBe('PAY456');
            });

            test('payrollid - manager employee payroll ID (alias for customfield2)', () => {
                expect(compute('{report:submit:to:payrollid}', mockContextWithSubmissionInfo)).toBe('PAY456');
            });

            test('firstname - fall back to email when manager name missing', () => {
                const contextWithPartialManagerDetails: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    managerPersonalDetails: {
                        accountID: 222,
                        login: 'manager@email.com',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:to:firstname}', contextWithPartialManagerDetails)).toBe('manager@email.com');
            });

            test('fullname - fall back to email when manager displayName missing', () => {
                const contextWithPartialManagerDetails: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    managerPersonalDetails: {
                        accountID: 222,
                        login: 'manager@email.com',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:to:fullname}', contextWithPartialManagerDetails)).toBe('manager@email.com');
            });
        });

        describe('Submission date', () => {
            test('default format - yyyy-MM-dd', () => {
                expect(compute('{report:submit:date}', mockContextWithSubmissionInfo)).toBe('2025-01-15');
            });

            test('custom format - verifies date formatting works', () => {
                expect(compute('{report:submit:date:MMMM dd, yyyy}', mockContextWithSubmissionInfo)).toBe('January 15, 2025');
            });
        });

        describe('Function modifiers', () => {
            test('frontpart - extract username from submitter email', () => {
                expect(compute('{report:submit:from:email|frontpart}', mockContextWithSubmissionInfo)).toBe('john.doe');
            });

            test('domain - extract domain from submitter email', () => {
                expect(compute('{report:submit:from:email|domain}', mockContextWithSubmissionInfo)).toBe('company.com');
            });

            test('frontpart - extract username from manager email', () => {
                expect(compute('{report:submit:to:email|frontpart}', mockContextWithSubmissionInfo)).toBe('jane.smith');
            });

            test('substr - extract first 4 characters from fullname', () => {
                expect(compute('{report:submit:from:fullname|substr:0:4}', mockContextWithSubmissionInfo)).toBe('John');
            });

            test('chained modifiers - frontpart then substr on email', () => {
                expect(compute('{report:submit:from:email|frontpart|substr:0:4}', mockContextWithSubmissionInfo)).toBe('john');
            });
        });

        describe('Combined formulas', () => {
            test('submitter and manager names together', () => {
                expect(compute('{report:submit:from:firstname} -> {report:submit:to:firstname}', mockContextWithSubmissionInfo)).toBe('John -> Jane');
            });

            test('transaction date range with submission date', () => {
                const mockTransactions = [
                    {
                        transactionID: 'trans1',
                        created: '2025-01-08T12:00:00Z',
                        amount: 5000,
                        merchant: 'Store',
                    },
                ] as Transaction[];

                mockReportUtils.getReportTransactions.mockReturnValue(mockTransactions);

                expect(compute('{report:startdate} to {report:submit:date}', mockContextWithSubmissionInfo)).toBe('2025-01-08 to 2025-01-15');
            });
        });

        describe('Edge cases', () => {
            test('empty email - return empty when email empty', () => {
                const contextWithEmptyEmail: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 123,
                        login: '',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:email}', contextWithEmptyEmail)).toBe('');
            });

            test('empty email with name - return empty when name also empty', () => {
                const contextWithEmptyEmail: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 123,
                        login: '',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:firstname}', contextWithEmptyEmail)).toBe('');
            });

            test('empty firstname - fallback to email when firstname is empty string', () => {
                const contextWithEmptyFirstName: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 123,
                        firstName: '',
                        login: 'user@test.com',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:firstname}', contextWithEmptyFirstName)).toBe('user@test.com');
            });

            test('empty lastname - fallback to email when lastname is empty string', () => {
                const contextWithEmptyLastName: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 123,
                        lastName: '',
                        login: 'user@test.com',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:lastname}', contextWithEmptyLastName)).toBe('user@test.com');
            });

            test('empty displayName - fallback to email when displayName is empty string', () => {
                const contextWithEmptyDisplayName: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 123,
                        displayName: '',
                        login: 'user@test.com',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:fullname}', contextWithEmptyDisplayName)).toBe('user@test.com');
            });

            test('empty email with frontpart - return empty for empty email modifier', () => {
                const contextWithEmptyEmail: FormulaContext = {
                    report: {reportID: '123'} as Report,
                    policy: null as unknown as Policy,
                    submitterPersonalDetails: {
                        accountID: 123,
                        login: '',
                    } as PersonalDetails,
                };

                expect(compute('{report:submit:from:email|frontpart}', contextWithEmptyEmail)).toBe('');
            });

            test('unknown field - return empty for invalid field name', () => {
                expect(compute('{report:submit:from:unknown}', mockContextWithSubmissionInfo)).toBe('');
            });

            test('invalid direction - return empty for invalid from/to', () => {
                expect(compute('{report:submit:invalid:email}', mockContextWithSubmissionInfo)).toBe('');
            });
        });
    });

    describe('hasCircularReferences()', () => {
        // Given the example data of consisting of report field lists
        const fieldList = {
            test0: {name: 'test-o', defaultValue: 'test value'},
            test1: {name: 'test-a', defaultValue: '{field:test-example}'},
            test2: {name: 'test-b', defaultValue: '{field:test-a}'},
            test3: {name: 'test-c', defaultValue: '{field:test-b}'},
            test4: {name: 'test-d', defaultValue: ''},
            test6: {name: 'test-f', defaultValue: '{field:test-d}'},
        };

        // Then make sure the circular references work as expected
        test('should detect 2-level circular reference', () => {
            expect(hasCircularReferences('{field:test-b}', 'test-example', fieldList)).toBe(true);
        });

        test('should detect circular reference with mixed text', () => {
            expect(hasCircularReferences('text {field:test-a}', 'test-example', fieldList)).toBe(true);
        });

        test('should detect direct self-reference', () => {
            expect(hasCircularReferences('{field:test-example}', 'test-example', fieldList)).toBe(true);
        });

        test('should detect more than > 2 level circular reference', () => {
            expect(hasCircularReferences('{field:test-c}', 'test-example', fieldList)).toBe(true);
        });

        test('should allow when there is no circular references', () => {
            expect(hasCircularReferences('{field:test-o}', 'test-example', fieldList)).toBe(false);
        });

        test('should return false when there is no formula field', () => {
            expect(hasCircularReferences('hi test', 'test-example', fieldList)).toBe(false);
        });
    });
});
