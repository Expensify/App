import {measureFunction} from 'reassure';
import {compute, extract, parse} from '@libs/CustomFormula';
import type {FormulaContext} from '@libs/CustomFormula';

describe('[CustomFormula] Performance Tests', () => {
    const mockReport = {
        reportID: '123',
        reportName: 'Test Report',
        total: -10000, // -$100.00
        currency: 'USD',
        lastVisibleActionCreated: '2025-01-15T10:30:00Z',
        policyID: 'policy1',
    };

    const mockPolicy = {
        name: 'Test Policy',
        id: 'policy1',
    };

    const mockContext: FormulaContext = {
        report: mockReport as any,
        policy: mockPolicy,
    };

    describe('Formula Parsing Performance', () => {
        test('[CustomFormula] extract() with simple formula', async () => {
            const formula = '{report:type} - {report:total}';
            await measureFunction(() => extract(formula));
        });

        test('[CustomFormula] extract() with complex formula', async () => {
            const formula = '{report:type} - {report:startdate} - {report:total} - {report:currency} - {report:policyname} - {user:email|frontPart}';
            await measureFunction(() => extract(formula));
        });

        test('[CustomFormula] extract() with nested braces', async () => {
            const formula = '{report:created:yyyy-MM-dd} - {field:custom_field|substr:0:10} - {user:email|frontPart}';
            await measureFunction(() => extract(formula));
        });

        test('[CustomFormula] parse() with simple formula', async () => {
            const formula = '{report:type} - {report:total}';
            await measureFunction(() => parse(formula));
        });

        test('[CustomFormula] parse() with complex formula', async () => {
            const formula = '{report:type} - {report:startdate} - {report:total} - {report:currency} - {report:policyname} - {field:department} - {user:email|frontPart}';
            await measureFunction(() => parse(formula));
        });

        test('[CustomFormula] parse() with mixed content', async () => {
            const formula = 'Expense Report for {report:policyname} on {report:startdate} totaling {report:total} {report:currency} submitted by {user:email|frontPart}';
            await measureFunction(() => parse(formula));
        });
    });

    describe('Formula Computation Performance', () => {
        test('[CustomFormula] compute() with simple formula', async () => {
            const formula = '{report:type} - {report:total}';
            await measureFunction(() => compute(formula, mockContext));
        });

        test('[CustomFormula] compute() with complex formula', async () => {
            const formula = '{report:type} - {report:startdate} - {report:total} - {report:currency} - {report:policyname}';
            await measureFunction(() => compute(formula, mockContext));
        });

        test('[CustomFormula] compute() with mixed content', async () => {
            const formula = 'Expense Report for {report:policyname} on {report:startdate} totaling {report:total} {report:currency}';
            await measureFunction(() => compute(formula, mockContext));
        });

        test('[CustomFormula] compute() with missing data context', async () => {
            const formula = '{report:type} - {report:total} - {report:unknown} - {report:policyname}';
            const contextWithMissingData: FormulaContext = {
                report: {} as any,
                policy: null,
            };
            await measureFunction(() => compute(formula, contextWithMissingData));
        });
    });

    describe('Batch Processing Performance', () => {
        test('[CustomFormula] parse() batch processing 100 formulas', async () => {
            const formulas = Array.from({length: 100}, (_, i) => `{report:type} ${i} - {report:startdate} - {report:total} - {report:currency}`);

            await measureFunction(() => {
                formulas.forEach((formula) => parse(formula));
            });
        });

        test('[CustomFormula] compute() batch processing 100 computations', async () => {
            const formulas = Array.from({length: 100}, (_, i) => `{report:type} ${i} - {report:total} - {report:policyname}`);

            await measureFunction(() => {
                formulas.forEach((formula) => compute(formula, mockContext));
            });
        });

        test('[CustomFormula] end-to-end batch processing (parse + compute)', async () => {
            const formulas = Array.from({length: 50}, (_, i) => `Expense ${i}: {report:type} - {report:startdate} - {report:total} {report:currency} for {report:policyname}`);

            await measureFunction(() => {
                formulas.forEach((formula) => {
                    const parts = parse(formula);
                    const result = compute(formula, mockContext);
                    return {parts, result};
                });
            });
        });
    });

    describe('Edge Cases Performance', () => {
        test('[CustomFormula] large formula with many parts', async () => {
            const largeParts = Array.from({length: 20}, (_, i) => `{report:field${i}}`).join(' - ');
            const formula = `Large Formula: ${largeParts}`;

            await measureFunction(() => {
                parse(formula);
                compute(formula, mockContext);
            });
        });

        test('[CustomFormula] deeply nested functions', async () => {
            const formula = '{user:email|frontPart} - {field:description|substr:0:20} - {report:created:yyyy-MM-dd}';

            await measureFunction(() => {
                parse(formula);
                compute(formula, mockContext);
            });
        });

        test('[CustomFormula] formula with escaped braces', async () => {
            const formula = '\\{not-formula} {report:type} \\{escaped} {report:total} \\{more-escapes}';

            await measureFunction(() => {
                parse(formula);
                compute(formula, mockContext);
            });
        });
    });
});
