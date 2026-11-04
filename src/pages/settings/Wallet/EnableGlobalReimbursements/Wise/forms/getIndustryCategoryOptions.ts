import CONST from '@src/CONST';
import type {DynamicFormFieldOption} from '@src/types/onyx';

/** Wise's industry categories, each labelled with its translation */
function getIndustryCategoryOptions(): DynamicFormFieldOption[] {
    return CONST.WISE.INDUSTRY_CATEGORIES.map((key) => ({key, labelKey: `walletPage.wiseOnboarding.business.industryCategoryOptions.${key}` as const}));
}

export default getIndustryCategoryOptions;
