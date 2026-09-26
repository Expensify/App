import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

import {getFieldOptions, getOptionLabel} from './getFieldOptions';
import isCountryCode from './isCountryCode';

/** Human-readable form of an answer for confirmation rows */
function formatDynamicFieldValue(field: DynamicFormField, values: DynamicFormValues, translate: LocalizedTranslate): string {
    const answer = values[field.key];
    if (answer === undefined || answer === null || answer === '') {
        return '';
    }
    if (typeof answer === 'boolean') {
        return translate(answer ? 'common.yes' : 'common.no');
    }
    if (Array.isArray(answer)) {
        if (field.type === 'select' || field.type === 'multiselect' || field.type === 'radio' || field.type === 'countryMultiselect') {
            const options = getFieldOptions(field, values);
            return answer
                .map((key) => options.find((option) => option.key === key))
                .map((option) => (option ? getOptionLabel(option, translate) : ''))
                .filter(Boolean)
                .join(', ');
        }
        return String(answer.length);
    }
    if (typeof answer === 'string' && (field.type === 'select' || field.type === 'radio')) {
        const option = getFieldOptions(field, values).find((candidate) => candidate.key === answer);
        return option ? getOptionLabel(option, translate) : answer;
    }
    if (typeof answer === 'string' && field.type === 'country' && isCountryCode(answer)) {
        return translate(`allCountries.${answer}`);
    }
    if (typeof answer === 'string' && field.type === 'percent') {
        return `${answer}%`;
    }
    return typeof answer === 'string' || typeof answer === 'number' ? String(answer) : '';
}

export default formatDynamicFieldValue;
