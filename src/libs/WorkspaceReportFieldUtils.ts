import type {FormInputErrors} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {InputID} from '@src/types/form/WorkspaceReportFieldForm';
import type {PolicyReportField, PolicyReportFieldType} from '@src/types/onyx/Policy';
import {addErrorMessage} from './ErrorUtils';
import type {FormulaPart} from './Formula';
import {isRequiredFulfilled} from './ValidationUtils';

/**
 * Gets the translation key for the report field type.
 */
function getReportFieldTypeTranslationKey(reportFieldType: PolicyReportFieldType): TranslationPaths {
    const typeTranslationKeysStrategy: Record<string, TranslationPaths> = {
        [CONST.REPORT_FIELD_TYPES.TEXT]: 'workspace.reportFields.textType',
        [CONST.REPORT_FIELD_TYPES.DATE]: 'workspace.reportFields.dateType',
        [CONST.REPORT_FIELD_TYPES.LIST]: 'workspace.reportFields.dropdownType',
        [CONST.REPORT_FIELD_TYPES.FORMULA]: 'workspace.reportFields.formulaType',
    };

    return typeTranslationKeysStrategy[reportFieldType];
}

/**
 * Generates a field ID based on the field name.
 */
function generateFieldID(name: string) {
    return `field_id_${name.replaceAll(CONST.REGEX.ANY_SPACE, '_').toUpperCase()}`;
}

/**
 * Determine if a string contains any recognized formula parts (e.g., {report:id}).
 * Only returns true when at least one parsed part is not free text.
 */
function hasFormulaPartsInInitialValue(initialValue?: string): boolean {
    if (!initialValue || typeof initialValue !== 'string') {
        return false;
    }

    // Dynamically require to avoid circular dependency with ReportActionsUtils
    const {parse, FORMULA_PART_TYPES} = require('./Formula') as {
        parse: (formula?: string) => FormulaPart[];
        FORMULA_PART_TYPES: {FREETEXT: string};
    };
    return parse(initialValue).some((part) => part.type !== FORMULA_PART_TYPES.FREETEXT);
}

/**
 * Checks if a report field name already exists in the policy's field list (case-insensitive).
 */
function isReportFieldNameExisting(fieldList: Record<string, PolicyReportField> | undefined, fieldName: string): boolean {
    return Object.values(fieldList ?? {}).some((reportField) => reportField.name.toLowerCase() === fieldName.toLowerCase());
}

/**
 * Returns the list of unsupported {report:*} formula parts in the initial value.
 * Used to validate formula report fields so unsupported tokens (e.g. {report:i}) are rejected with a clear error.
 */
function getUnsupportedReportFieldFormulaParts(initialValue?: string): string[] {
    if (!initialValue || typeof initialValue !== 'string') {
        return [];
    }

    // Dynamically require to avoid circular dependency with ReportActionsUtils
    const {parse, FORMULA_PART_TYPES} = require('./Formula') as {
        parse: (formula?: string) => FormulaPart[];
        FORMULA_PART_TYPES: {REPORT: string};
    };

    // cspell:ignore oldid
    const supportedReportFields = new Set([
        'id',
        'oldid',
        'title',
        'status',
        'displaystatus',
        'expensescount',
        'type',
        'startdate',
        'enddate',
        'total',
        'reimbursable',
        'currency',
        'policyname',
        'workspacename',
        'created',
        'approve',
        'submit',
        'autoreporting',
    ]);

    const supportedSubmitDirections = new Set(['from', 'to', 'date']);
    const supportedSubmitPersonFields = new Set(['firstname', 'lastname', 'fullname', 'email', 'userid', 'customfield1', 'payrollid', 'customfield2']);
    const supportedAutoReportingFields = new Set(['start', 'end']);

    const unsupported: string[] = [];
    const parts = parse(initialValue);

    for (const part of parts) {
        if (part.type !== FORMULA_PART_TYPES.REPORT) {
            continue;
        }

        const [field, ...rest] = part.fieldPath ?? [];
        const normalizedField = field?.trim().toLowerCase();

        if (!normalizedField || !supportedReportFields.has(normalizedField)) {
            unsupported.push(part.definition);
            continue;
        }

        if (normalizedField === 'submit') {
            const direction = rest.at(0)?.trim().toLowerCase();
            if (!direction || !supportedSubmitDirections.has(direction)) {
                unsupported.push(part.definition);
                continue;
            }

            // report:submit:from and report:submit:to are valid without subfield.
            if ((direction === 'from' || direction === 'to') && rest.length === 1) {
                continue;
            }

            // report:submit:date is valid (format is optional and validated elsewhere)
            if (direction === 'date') {
                continue;
            }

            // report:submit:from:* and report:submit:to:* need a subfield
            const submitField = rest.at(1)?.trim().toLowerCase();
            if (!submitField || !supportedSubmitPersonFields.has(submitField)) {
                unsupported.push(part.definition);
            }
            continue;
        }

        if (normalizedField === 'autoreporting') {
            const subField = rest.at(0)?.trim().toLowerCase();
            if (!subField || !supportedAutoReportingFields.has(subField)) {
                unsupported.push(part.definition);
            }
        }

        if (normalizedField === 'approve') {
            if (rest.at(0)?.trim().toLowerCase() !== 'date') {
                unsupported.push(part.definition);
            }
        }
    }

    return unsupported;
}

export {getReportFieldTypeTranslationKey, generateFieldID, getUnsupportedReportFieldFormulaParts, hasFormulaPartsInInitialValue, isReportFieldNameExisting};
