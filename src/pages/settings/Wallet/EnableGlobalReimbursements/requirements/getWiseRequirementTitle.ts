import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {TranslationPaths} from '@src/languages/types';

const REQUIREMENT_TITLE_KEYS: Record<string, TranslationPaths> = {
    ACCOUNT_PURPOSE: 'wiseKYC.requirement.ACCOUNT_PURPOSE',
    ID_DOCUMENT: 'wiseKYC.requirement.ID_DOCUMENT',
    BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID: 'wiseKYC.requirement.BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID',
    LIVENESS_CHECK: 'wiseKYC.requirement.LIVENESS_CHECK',
};

/** Our wording for the requirement keys we know; Wise's key, made readable, for the rest */
function getWiseRequirementTitle(requirementKey: string, translate: LocalizedTranslate): string {
    const titleKey = REQUIREMENT_TITLE_KEYS[requirementKey];
    if (titleKey) {
        return translate(titleKey);
    }
    const words = requirementKey.toLowerCase().split('_').join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
}

export default getWiseRequirementTitle;
