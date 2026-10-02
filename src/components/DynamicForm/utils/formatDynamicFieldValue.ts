import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField} from '@src/types/onyx';

import getAddressInputKeys from './getAddressInputKeys';
import getFieldOptions, {getOptionLabel} from './getFieldOptions';
import isCountryCode from './isCountryCode';

/** Street, then city, then state and zip, as in "1 Main Street, Springfield, IL 62701" */
function formatAddress(fieldKey: string, values: DynamicFormValues): string {
    const addressKeys = getAddressInputKeys(fieldKey);
    const getPart = (partKey: string) => {
        const part = values[partKey];
        return typeof part === 'string' ? part : '';
    };
    const stateAndZip = [getPart(addressKeys.state), getPart(addressKeys.zipCode)].filter(Boolean).join(' ');
    return [getPart(addressKeys.street), getPart(addressKeys.street2), getPart(addressKeys.city), stateAndZip].filter(Boolean).join(', ');
}

function getFileNames(files: unknown[]): string[] {
    return files.flatMap((file) => (typeof file === 'object' && file !== null && 'name' in file && typeof file.name === 'string' ? [file.name] : []));
}

/** An answer as the user reads it, for rows that show a value instead of an input */
function formatDynamicFieldValue(field: DynamicFormField, values: DynamicFormValues, translate: LocalizedTranslate): string {
    const answer = values[field.key];
    if (typeof answer === 'boolean') {
        return translate(answer ? 'common.yes' : 'common.no');
    }
    if (Array.isArray(answer)) {
        const items: unknown[] = answer;
        if (field.type === 'file') {
            return getFileNames(items).join(', ');
        }
        if (field.type !== 'multiselect' && field.type !== 'countryMultiselect') {
            return '';
        }
        const options = getFieldOptions(field, values);
        return items
            .flatMap((key) => options.filter((option) => option.key === key))
            .map((option) => getOptionLabel(option, translate))
            .join(', ');
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
        case 'percent':
            return `${answer}%`;
        case 'address':
            return formatAddress(field.key, values);
        default:
            return answer;
    }
}

export default formatDynamicFieldValue;
