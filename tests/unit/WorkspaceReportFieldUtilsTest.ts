import {generateFieldID, getUnsupportedReportFieldFormulaParts, hasFormulaPartsInInitialValue, isReportFieldNameExisting, isReportFieldTargetValid} from '@libs/WorkspaceReportFieldUtils';
import CONST from '@src/CONST';
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
        expect(getUnsupportedReportFieldFormulaParts('{report:oldID}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:title}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:status}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:displaystatus}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:approve:date}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:submit:from}')).toEqual([]);
        expect(getUnsupportedReportFieldFormulaParts('{report:submit:to}')).toEqual([]);
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
        expect(getUnsupportedReportFieldFormulaParts('{report:approve:invalid}')).toEqual(['{report:approve:invalid}']);
    });
});

describe('WorkspaceReportFieldUtils.isReportFieldNameExisting', () => {
    const baseNameField: PolicyReportField = {
        fieldID: '',
        name: '',
        type: 'text',
        values: [],
        disabledOptions: [],
        defaultValue: '',
        orderWeight: 0,
        deletable: false,
        keys: [],
        externalIDs: [],
        isTax: false,
    };
    const fieldList: Record<string, PolicyReportField> = {
        field1: {...baseNameField, name: 'Field1', type: 'text'},
        field2: {...baseNameField, name: 'Field2', type: 'date'},
        field3: {...baseNameField, name: 'Field3', type: 'text', target: CONST.REPORT_FIELD_TARGETS.EXPENSE},
        field4: {...baseNameField, name: 'Field3', type: 'text', target: CONST.REPORT_FIELD_TARGETS.INVOICE},
    };

    it('should return false when field name does not exist', () => {
        expect(isReportFieldNameExisting(fieldList, 'Field5')).toBe(false);
    });

    it('should return true when field name exists with exact case match', () => {
        expect(isReportFieldNameExisting(fieldList, 'Field1')).toBe(true);
    });

    it('should return true when field name exists with different case', () => {
        expect(isReportFieldNameExisting(fieldList, 'FIELD1')).toBe(true);
        expect(isReportFieldNameExisting(fieldList, 'field1')).toBe(true);
    });

    it('checks existing names only within the expected target', () => {
        expect(isReportFieldNameExisting(fieldList, 'Field1', CONST.REPORT_FIELD_TARGETS.INVOICE)).toBe(false);
        expect(isReportFieldNameExisting(fieldList, 'Field1', CONST.REPORT_FIELD_TARGETS.EXPENSE)).toBe(true);
        expect(isReportFieldNameExisting(fieldList, 'Field3', CONST.REPORT_FIELD_TARGETS.INVOICE)).toBe(true);
        expect(isReportFieldNameExisting(fieldList, 'Field3', CONST.REPORT_FIELD_TARGETS.EXPENSE)).toBe(true);
    });
});

describe('WorkspaceReportFieldUtils.generateFieldID', () => {
    it('keeps the existing field ID format when no target is provided', () => {
        expect(generateFieldID('Field A')).toBe('field_id_FIELD_A');
    });

    it('can include target in the field ID to avoid cross-target collisions', () => {
        expect(generateFieldID('Field A', CONST.REPORT_FIELD_TARGETS.INVOICE)).toBe('field_id_INVOICE_FIELD_A');
        expect(generateFieldID('Field A', CONST.REPORT_FIELD_TARGETS.EXPENSE)).toBe('field_id_EXPENSE_FIELD_A');
    });
});

describe('WorkspaceReportFieldUtils.isReportFieldTargetValid', () => {
    const baseField: PolicyReportField = {
        fieldID: 'field_id_1',
        name: 'Field A',
        type: CONST.REPORT_FIELD_TYPES.TEXT,
        values: [],
        disabledOptions: [],
        defaultValue: '',
        orderWeight: 1,
        deletable: true,
        keys: [],
        externalIDs: [],
        isTax: false,
    };

    it('allows expense fields without target', () => {
        expect(isReportFieldTargetValid(baseField, CONST.REPORT_FIELD_TARGETS.EXPENSE)).toBe(true);
    });

    it('blocks expense settings for invoice-targeted fields', () => {
        expect(isReportFieldTargetValid({...baseField, target: CONST.REPORT_FIELD_TARGETS.INVOICE}, CONST.REPORT_FIELD_TARGETS.EXPENSE)).toBe(false);
    });

    it('allows invoice settings for invoice-targeted fields', () => {
        expect(isReportFieldTargetValid({...baseField, target: CONST.REPORT_FIELD_TARGETS.INVOICE}, CONST.REPORT_FIELD_TARGETS.INVOICE)).toBe(true);
    });

    it('blocks invoice settings for fields without target', () => {
        expect(isReportFieldTargetValid(baseField, CONST.REPORT_FIELD_TARGETS.INVOICE)).toBe(false);
    });
});
