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

/** The label an input shows, marked optional when the user may leave the field empty. A checkbox is not marked, since leaving it unchecked is an answer. */
function getInputLabel(field: DynamicFormField, translate: LocalizedTranslate): string {
    const label = getFieldLabel(field, translate);
    const isCheckbox = field.type === 'boolean' && field.presentation === 'checkbox';
    if (field.required || field.readonly || isCheckbox) {
        return label;
    }
    return `${label} (${translate('common.optional')})`;
}

export default getLocalizedText;
export {getFieldLabel, getInputLabel};
