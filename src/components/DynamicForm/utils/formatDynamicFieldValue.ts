import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField} from '@src/types/onyx';

import getFieldOptions, {getOptionLabel} from './getFieldOptions';
import isCountryCode from './isCountryCode';

/** An answer as the user reads it, for rows that show a value instead of an input */
function formatDynamicFieldValue(field: DynamicFormField, values: DynamicFormValues, translate: LocalizedTranslate): string {
    const answer = values[field.key];
    if (typeof answer === 'boolean') {
        return translate(answer ? 'common.yes' : 'common.no');
    }
    if (typeof answer !== 'string') {
        return '';
    }
    switch (field.type) {
        case 'select':
        case 'radio': {
            const option = getFieldOptions(field, values).find((candidate) => candidate.key === answer);
            return option ? getOptionLabel(option, translate) : answer;
        }
        case 'country':
            return isCountryCode(answer) ? translate(`allCountries.${answer}`) : answer;
        default:
            return answer;
    }
}

export default formatDynamicFieldValue;
