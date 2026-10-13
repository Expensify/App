import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {TranslationPaths} from '@src/languages/types';
import type {DynamicFormField} from '@src/types/onyx';

/** Our translation when the schema names one, otherwise the schema author's wording */
function getLocalizedText(translate: LocalizedTranslate, translationKey: TranslationPaths | undefined, text: string | undefined): string | undefined {
    return translationKey ? translate(translationKey) : text;
}

function getFieldLabel(field: DynamicFormField, translate: LocalizedTranslate): string {
    return getLocalizedText(translate, field.labelKey, field.label) ?? field.key;
}

export default getLocalizedText;
export {getFieldLabel};
