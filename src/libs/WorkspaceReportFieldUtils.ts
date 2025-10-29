import type {FormInputErrors} from '@components/Form/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {InputID} from '@src/types/form/WorkspaceReportFieldForm';
import type {PolicyReportField, PolicyReportFieldType} from '@src/types/onyx/Policy';
import {addErrorMessage} from './ErrorUtils';
import {FORMULA_PART_TYPES, parse} from './Formula';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
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
 * Gets the translation key for the alternative text for the report field.
 */
function getReportFieldAlternativeTextTranslationKey(reportFieldType: PolicyReportFieldType): TranslationPaths {
    const typeTranslationKeysStrategy: Record<string, TranslationPaths> = {
        [CONST.REPORT_FIELD_TYPES.TEXT]: 'workspace.reportFields.textAlternateText',
        [CONST.REPORT_FIELD_TYPES.DATE]: 'workspace.reportFields.dateAlternateText',
        [CONST.REPORT_FIELD_TYPES.LIST]: 'workspace.reportFields.dropdownAlternateText',
        [CONST.REPORT_FIELD_TYPES.FORMULA]: 'workspace.reportFields.formulaAlternateText',
    };

    return typeTranslationKeysStrategy[reportFieldType];
}

/**
 * Validates the list value name.
 */
function validateReportFieldListValueName(
    valueName: string,
    priorValueName: string,
    listValues: string[],
    inputID: InputID,
): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> {
    const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

    if (!isRequiredFulfilled(valueName)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        errors[inputID] = translateLocal('workspace.reportFields.listValueRequiredError');
    } else if (priorValueName !== valueName && listValues.some((currentValueName) => currentValueName === valueName)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        errors[inputID] = translateLocal('workspace.reportFields.existingListValueError');
    } else if ([...valueName].length > CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
        // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        addErrorMessage(errors, inputID, translateLocal('common.error.characterLimitExceedCounter', {length: [...valueName].length, limit: CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}));
    }

    return errors;
}
/**
 * Generates a field ID based on the field name.
 */
function generateFieldID(name: string) {
    return `field_id_${name.replace(CONST.REGEX.ANY_SPACE, '_').toUpperCase()}`;
}

/**
 * Gets the initial value for a report field.
 */
function getReportFieldInitialValue(reportField: PolicyReportField | null): string {
    if (!reportField) {
        return '';
    }

    if (reportField.type === CONST.REPORT_FIELD_TYPES.LIST) {
        return reportField.defaultValue ?? '';
    }

    if (reportField.type === CONST.REPORT_FIELD_TYPES.DATE) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('common.currentDate');
    }

    return reportField.value ?? reportField.defaultValue;
}

/**
 * Determine if a string contains any recognized formula parts (e.g., {report:id}).
 * Only returns true when at least one parsed part is not free text.
 */
function hasFormulaPartsInInitialValue(initialValue?: string): boolean {
    if (!initialValue || typeof initialValue !== 'string') {
        return false;
    }
    return parse(initialValue).some((part) => part.type !== FORMULA_PART_TYPES.FREETEXT);
}

export {
    getReportFieldTypeTranslationKey,
    getReportFieldAlternativeTextTranslationKey,
    validateReportFieldListValueName,
    generateFieldID,
    getReportFieldInitialValue,
    hasFormulaPartsInInitialValue,
};
