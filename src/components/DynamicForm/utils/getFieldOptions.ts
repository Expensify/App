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

function getChoices(options: DynamicFormFieldOption[], translate: LocalizedTranslate): DynamicFormChoice[] {
    return options.map((option) => {
        const label = getOptionLabel(option, translate);
        return {
            value: option.key,
            label,
            // Wise sends some country lists, like the account holder's country, as a `select` keyed by country codes. Each option is checked on its own,
            // so a code we don't list loses only its own code search instead of turning it off for the whole list
            searchValue: isCountryCode(option.key) ? StringUtils.sanitizeString(`${option.key}${label}`) : undefined,
        };
    });
}

function getFieldChoices(field: DynamicFormOptionField, values: DynamicFormValues, translate: LocalizedTranslate): DynamicFormChoice[] {
    return getChoices(getFieldOptions(field, values), translate);
}

/** Every country, listed and searched the way a country field lists them, for the country of an address */
function getCountryChoices(translate: LocalizedTranslate): DynamicFormChoice[] {
    return getChoices(COUNTRY_OPTIONS, translate);
}

export default getFieldOptions;
export {getCountryChoices, getFieldChoices, getOptionLabel};
export type {DynamicFormChoice};
