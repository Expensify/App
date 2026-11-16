import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Choice} from '@components/RadioButtons';

import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type {DynamicFormChoiceField, DynamicFormCountryField, DynamicFormFieldOption, DynamicFormMultiChoiceField} from '@src/types/onyx';

import getLocalizedText from './getLocalizedText';
import isCountryCode from './isCountryCode';

type DynamicFormOptionField = DynamicFormChoiceField | DynamicFormMultiChoiceField | DynamicFormCountryField;

type DynamicFormChoice = Choice & {
    /** Text a list's search matches instead of the label. Countries list their ISO code and name, as the country selector searches them. */
    searchValue?: string;
};

const COUNTRY_OPTIONS: DynamicFormFieldOption[] = Object.keys(CONST.ALL_COUNTRIES)
    .filter(isCountryCode)
    .map((code) => ({key: code, labelKey: `allCountries.${code}`}));

function getListedOptions(field: DynamicFormChoiceField | DynamicFormMultiChoiceField, values: DynamicFormValues): DynamicFormFieldOption[] {
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
    switch (field.type) {
        case 'country':
        case 'countryMultiselect':
            return COUNTRY_OPTIONS;
        default:
            return getListedOptions(field, values);
    }
}

function getOptionLabel(option: DynamicFormFieldOption, translate: LocalizedTranslate): string {
    return getLocalizedText(translate, option.labelKey, option.label) ?? option.key;
}

function getFieldChoices(field: DynamicFormOptionField, values: DynamicFormValues, translate: LocalizedTranslate): DynamicFormChoice[] {
    const isCountryField = field.type === 'country' || field.type === 'countryMultiselect';
    return getFieldOptions(field, values).map((option) => {
        const label = getOptionLabel(option, translate);
        return {
            value: option.key,
            label,
            searchValue: isCountryField ? StringUtils.sanitizeString(`${option.key}${label}`) : undefined,
        };
    });
}

export default getFieldOptions;
export {getFieldChoices, getOptionLabel};
export type {DynamicFormChoice};
