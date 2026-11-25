import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {DropdownChoice} from '@components/FormDropdownField/DropdownChoiceAdapter';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type {DynamicFormChoiceField, DynamicFormCountryField, DynamicFormFieldOption, DynamicFormMultiChoiceField} from '@src/types/onyx';

import getLocalizedText from './getLocalizedText';
import isCountryCode from './isCountryCode';

type DynamicFormOptionField = DynamicFormChoiceField | DynamicFormMultiChoiceField | DynamicFormCountryField;

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

function getChoices(options: DynamicFormFieldOption[], translate: LocalizedTranslate, isCountryList: boolean): DropdownChoice[] {
    return options.map((option) => {
        const label = getOptionLabel(option, translate);
        return {
            value: option.key,
            label,
            // Countries list their ISO code and name, as the country selector searches them
            searchValue: isCountryList ? StringUtils.sanitizeString(`${option.key}${label}`) : undefined,
        };
    });
}

function getFieldChoices(field: DynamicFormOptionField, values: DynamicFormValues, translate: LocalizedTranslate): DropdownChoice[] {
    const options = getFieldOptions(field, values);
    // Wise sends some country lists, like the account holder's address country, as a `select` of country codes, so those search by code too
    const isCountryField = field.type === 'country' || field.type === 'countryMultiselect' || (options.length > 0 && options.every((option) => isCountryCode(option.key)));
    return getChoices(options, translate, isCountryField);
}

/** Every country, listed and searched the way a country field lists them, for the country of an address */
function getCountryChoices(translate: LocalizedTranslate): DropdownChoice[] {
    return getChoices(COUNTRY_OPTIONS, translate, true);
}

export default getFieldOptions;
export {getCountryChoices, getFieldChoices, getOptionLabel};
