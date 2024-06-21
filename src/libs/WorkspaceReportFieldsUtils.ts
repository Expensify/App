import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

/**
 * @param reportFieldType Report field type
 * @returns translation key for the report type
 */
function getReportFieldTypeTranslationKey(reportFieldType: PolicyReportFieldType): TranslationPaths {
    // TODO: Clarify type
    const typeTranslationKeysStrategy: Record<string, TranslationPaths> = {
        [CONST.REPORT_FIELD_TYPES.TEXT]: 'workspace.reportFields.textType',
        [CONST.REPORT_FIELD_TYPES.DATE]: 'workspace.reportFields.dateType',
        [CONST.REPORT_FIELD_TYPES.LIST]: 'workspace.reportFields.dropdownType',
    };

    return typeTranslationKeysStrategy[reportFieldType];
}

/**
 * @param reportFieldType Report field type
 * @returns translation key for the report type alternative text
 */
function getReportFieldAlternativeTextTranslationKey(reportFieldType: PolicyReportFieldType): TranslationPaths {
    // TODO: Clarify type
    const typeTranslationKeysStrategy: Record<string, TranslationPaths> = {
        [CONST.REPORT_FIELD_TYPES.TEXT]: 'workspace.reportFields.textAlternateText',
        [CONST.REPORT_FIELD_TYPES.DATE]: 'workspace.reportFields.dateAlternateText',
        [CONST.REPORT_FIELD_TYPES.LIST]: 'workspace.reportFields.dropdownAlternateText',
    };

    return typeTranslationKeysStrategy[reportFieldType];
}

export {getReportFieldTypeTranslationKey, getReportFieldAlternativeTextTranslationKey};
