import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField, DynamicFormFieldOption} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

/** The options a choice field offers right now, filtered by the answer it depends on */
function getFieldOptions(field: DynamicFormField, values: DynamicFormValues): DynamicFormFieldOption[] {
    if (!field.dependsOn) {
        return field.values ?? [];
    }
    const controllingValue = values[field.dependsOn.key];
    return typeof controllingValue === 'string' ? (field.dependsOn.valuesBy[controllingValue] ?? []) : [];
}

function getOptionLabel(option: DynamicFormFieldOption, translate: LocalizedTranslate): string {
    return option.labelKey ? translate(option.labelKey) : (option.label ?? option.key);
}

export {getFieldOptions, getOptionLabel};
