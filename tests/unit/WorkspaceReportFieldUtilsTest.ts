import {getUnsupportedReportFieldFormulaParts, hasFormulaPartsInInitialValue, isReportFieldNameExisting} from '@libs/WorkspaceReportFieldUtils';
import type {PolicyReportField} from '@src/types/onyx/Policy';

describe('WorkspaceReportFieldUtils.hasFormulaPartsInInitialValue', () => {
    it('returns true for recognized formula tokens', () => {
        const truthyCases = [
            '{report:id}',
            'prefix {report:type} suffix',
            'Report created on {report:created}',
            'User email {user:email}',
            'Formatted date {report:created:yyyy-MM-dd}',
            'Field value {field:customField}',
        ];

        for (const value of truthyCases) {
            expect(hasFormulaPartsInInitialValue(value)).toBe(true);
        }
    });

    it('returns false for plain text and non-formula braces', () => {
        const falsyCases = [
            '',
            'plain text',
            '{}',
            '{ not a formula }',
            '{foo}',
            '{abc:def}',
            // escaped braces should not be treated as formula
            '\\{report:id\\}',
        ];

        for (const value of falsyCases) {
            expect(hasFormulaPartsInInitialValue(value)).toBe(false);
        }
    });

    it('handles multiple parts and mixed content correctly', () => {
        expect(hasFormulaPartsInInitialValue('{report:id}{report:type}')).toBe(true);
        expect(hasFormulaPartsInInitialValue('text {abc} text')).toBe(false);
        expect(hasFormulaPartsInInitialValue('text {user:email|frontPart} text')).toBe(true);
    });
});

describe('WorkspaceReportFieldUtils.getUnsupportedReportFieldFormulaParts', () => {
    it('returns empty array for empty or non-string input', () => {
        expect(getUnsupportedReportFieldFormulaParts()).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('')).toEqual([]);
    });

    it('returns unsupported report tokens like {report:i}', () => {
        expect(getUnsupportedReportFieldFormulaParts('{report:i}')).toEqual(['{report:i}']);
        expect(getUnsupportedReportFieldFormulaParts('prefix {report:i} suffix')).toEqual(['{report:i}']);
    });

    it('returns empty array for supported report tokens', () => {
        expect(getUnsupportedReportFieldFormulaParts('{report:id}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:status}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:submit:from:firstname}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:autoreporting:start}')).toEqual([]);
    });

    it('returns only unsupported parts in mixed formulas', () => {
        expect(getUnsupportedReportFieldFormulaParts('Hello {report:id} and {report:invalid}')).toEqual(['{report:invalid}']);
        expect(getUnsupportedReportFieldFormulaParts('{report:i} {report:unknown}')).toEqual(['{report:i}', '{report:unknown}']);
    });

    it('ignores non-report parts (field, user, freetext)', () => {
        expect(getUnsupportedReportFieldFormulaParts('{field:myField}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('plain text')).toEqual([]);
    });

    it('rejects invalid submit and autoreporting subfields', () => {
        expect(getUnsupportedReportFieldFormulaParts('{report:submit:invalid}')).toEqual(['{report:submit:invalid}']);
        expect(getUnsupportedReportFieldFormulaParts('{report:autoreporting:invalid}')).toEqual(['{report:autoreporting:invalid}']);
    });
});

describe('WorkspaceReportFieldUtils.isReportFieldNameExisting', () => {
    const fieldList: Record<string, PolicyReportField> = {
        field1: {name: 'Field1', type: 'text'} as PolicyReportField,
        field2: {name: 'Field2', type: 'date'} as PolicyReportField,
    };

    it('should return false when field name does not exist', () => {
        expect(isReportFieldNameExisting(fieldList, 'Field3')).toBe(false);
    });

    it('should return true when field name exists with exact case match', () => {
        expect(isReportFieldNameExisting(fieldList, 'Field1')).toBe(true);
    });

    it('should return true when field name exists with different case', () => {
        expect(isReportFieldNameExisting(fieldList, 'FIELD1')).toBe(true);
        expect(isReportFieldNameExisting(fieldList, 'field1')).toBe(true);
    });
});
