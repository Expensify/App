import {hasFormulaPartsInInitialValue, isReportFieldNameExisting, isReportFieldTargetValid} from '@libs/WorkspaceReportFieldUtils';
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
