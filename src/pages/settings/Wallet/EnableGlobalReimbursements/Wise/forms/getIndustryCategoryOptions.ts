import CONST from '@src/CONST';
import type {DynamicFormFieldOption} from '@src/types/onyx';

/** Wise's category names as options, labelled in plain words: SOFTWARE_DEVELOPMENT_PUBLISHING reads "Software development publishing" */
function getIndustryCategoryOptions(): DynamicFormFieldOption[] {
    return CONST.WISE.INDUSTRY_CATEGORIES.map((key) => {
        const words = key.toLowerCase().replaceAll('_', ' ');
        return {key, label: words.charAt(0).toUpperCase() + words.slice(1)};
    });
}

export default getIndustryCategoryOptions;
