import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Choice} from '@components/RadioButtons';

import type {DynamicFormChoiceField, DynamicFormFieldOption} from '@src/types/onyx';

import getLocalizedText from './getLocalizedText';

type DynamicFormOptionField = DynamicFormChoiceField;

function getListedOptions(field: DynamicFormChoiceField, values: DynamicFormValues): DynamicFormFieldOption[] {
    if (!field.dependsOn) {
        return field.values ?? [];
    }
    const controllingValue = values[field.dependsOn.key];
    if (typeof controllingValue !== 'string' && typeof controllingValue !== 'boolean') {
        return [];
    }
    return field.dependsOn.valuesBy[String(controllingValue)] ?? [];
}

/** The options a choice field offers right now, picked by the answer it depends on */
function getFieldOptions(field: DynamicFormOptionField, values: DynamicFormValues): DynamicFormFieldOption[] {
    return getListedOptions(field, values);
}

function getOptionLabel(option: DynamicFormFieldOption, translate: LocalizedTranslate): string {
    return getLocalizedText(translate, option.labelKey, option.label) ?? option.key;
}

function getFieldChoices(field: DynamicFormOptionField, values: DynamicFormValues, translate: LocalizedTranslate): Choice[] {
    return getFieldOptions(field, values).map((option) => ({
        value: option.key,
        label: getOptionLabel(option, translate),
    }));
}

export default getFieldOptions;
export {getFieldChoices, getOptionLabel};
