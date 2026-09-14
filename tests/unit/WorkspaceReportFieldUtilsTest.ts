import {getUnsupportedReportFieldFormulaParts, hasFormulaPartsInInitialValue, isReportFieldImportedFromIntegration, isReportFieldNameExisting} from '@libs/WorkspaceReportFieldUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName, PolicyReportField} from '@src/types/onyx/Policy';

import createMock from '../utils/createMock';

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
    const fieldList: Record<string, PolicyReportField> = {
        field1: createMock<PolicyReportField>({name: 'Field1', type: 'text'}),
        field2: createMock<PolicyReportField>({name: 'Field2', type: 'date'}),
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

    it('should return true across targets when no expectedTarget is passed, since the backend keys fields by name regardless of target', () => {
        const mixedTargetFieldList: Record<string, PolicyReportField> = {
            invoiceField: createMock<PolicyReportField>({name: 'Test', type: 'text', target: CONST.REPORT_FIELD_TARGETS.INVOICE}),
            expenseField: createMock<PolicyReportField>({name: 'Other', type: 'text', target: CONST.REPORT_FIELD_TARGETS.EXPENSE}),
        };

        expect(isReportFieldNameExisting(mixedTargetFieldList, 'Test')).toBe(true);
        expect(isReportFieldNameExisting(mixedTargetFieldList, 'Other')).toBe(true);
    });
});

describe('WorkspaceReportFieldUtils.isReportFieldImportedFromIntegration', () => {
    const reportFieldWithOrigin = (origin: string | undefined) => createMock<PolicyReportField>({name: 'Field', type: 'text', origin});
    const policyConnectedTo = (...connectionNames: ConnectionName[]) => createMock<Policy>({connections: Object.fromEntries(connectionNames.map((connectionName) => [connectionName, {}]))});

    it('should return true for every origin an accounting integration stamps while that integration is connected', () => {
        for (const connectionName of CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES) {
            expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin(CONST.POLICY.CONNECTIONS.REPORT_FIELD_ORIGIN[connectionName]), policyConnectedTo(connectionName))).toBe(true);
        }
    });

    it('should return false once the integration that stamped the origin is no longer connected', () => {
        const netSuiteField = reportFieldWithOrigin(CONST.POLICY.CONNECTIONS.REPORT_FIELD_ORIGIN[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]);

        // The workspace disconnected accounting entirely.
        expect(isReportFieldImportedFromIntegration(netSuiteField, policyConnectedTo())).toBe(false);
        expect(isReportFieldImportedFromIntegration(netSuiteField, undefined)).toBe(false);

        // The workspace swapped NetSuite out for a different integration, so the leftover NetSuite field is no longer imported.
        expect(isReportFieldImportedFromIntegration(netSuiteField, policyConnectedTo(CONST.POLICY.CONNECTIONS.NAME.QBO))).toBe(false);
    });

    it('should return false for a connection name that is not the stamped origin', () => {
        // The backend stamps `qbo`/`qbd`/`dualentry`, not the connection names, so these must not match.
        const connectedPolicy = policyConnectedTo(CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.POLICY.CONNECTIONS.NAME.QBD, CONST.POLICY.CONNECTIONS.NAME.DUALENTRY);

        expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin(CONST.POLICY.CONNECTIONS.NAME.QBO), connectedPolicy)).toBe(false);
        expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin(CONST.POLICY.CONNECTIONS.NAME.QBD), connectedPolicy)).toBe(false);
        expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY), connectedPolicy)).toBe(false);
    });

    it('should return false for a manually-created field, an origin from a non-integration automated action, or no field', () => {
        const connectedPolicy = policyConnectedTo(CONST.POLICY.CONNECTIONS.NAME.NETSUITE);

        expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin(undefined), connectedPolicy)).toBe(false);
        expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin(''), connectedPolicy)).toBe(false);
        expect(isReportFieldImportedFromIntegration(reportFieldWithOrigin('automatedAction'), connectedPolicy)).toBe(false);
        expect(isReportFieldImportedFromIntegration(undefined, connectedPolicy)).toBe(false);
        expect(isReportFieldImportedFromIntegration(null, connectedPolicy)).toBe(false);
    });
});
