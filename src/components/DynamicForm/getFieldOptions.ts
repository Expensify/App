import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormFieldOption} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

import isCountryCode from './isCountryCode';

const COUNTRY_OPTIONS: DynamicFormFieldOption[] = Object.keys(CONST.ALL_COUNTRIES)
    .filter(isCountryCode)
    .map((code) => ({key: code, labelKey: `allCountries.${code}`}));

/** The options a choice field offers right now, filtered by the answer it depends on */
function getFieldOptions(field: DynamicFormField, values: DynamicFormValues): DynamicFormFieldOption[] {
    if (field.type === 'country' || field.type === 'countryMultiselect') {
        return COUNTRY_OPTIONS;
    }
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
