// eslint-disable-next-line no-restricted-syntax -- disabled because we need CurrencyUtils to mock
import * as CurrencyUtils from '@libs/CurrencyUtils';
import {hasCircularReferences, parse} from '@libs/Formula';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';

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

    describe('Edge Cases', () => {
        test('should handle malformed braces', () => {
            const parts = parse('{incomplete');
            expect(parts.at(0)?.type).toBe('freetext');
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
