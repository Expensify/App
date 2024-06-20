import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

/**
 * @param reportFieldType Report field type
 * @returns translation key for the unit
 */
function getReportFieldTypeTranslationKey(reportFieldType: PolicyReportFieldType): TranslationPaths {
    // TODO: Clarify type
    const typeTranslationKeysStrategy: Record<string, TranslationPaths> = {
        [CONST.REPORT_FIELD_TYPES.TEXT]: 'workspace.reportFields.textType',
        [CONST.REPORT_FIELD_TYPES.DATE]: 'workspace.reportFields.dateType',
        [CONST.REPORT_FIELD_TYPES.DROPDOWN]: 'workspace.reportFields.dropdownType',
    };

    return typeTranslationKeysStrategy[reportFieldType];
}

// eslint-disable-next-line import/prefer-default-export
export {getReportFieldTypeTranslationKey};
