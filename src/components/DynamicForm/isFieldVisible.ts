import type {DynamicFormField} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

function isFieldVisible(field: DynamicFormField, values: DynamicFormValues): boolean {
    if (!field.showWhen) {
        return true;
    }
    const controllingValue = values[field.showWhen.key];
    if (typeof controllingValue !== 'string' && typeof controllingValue !== 'boolean' && typeof controllingValue !== 'number') {
        return false;
    }
    return field.showWhen.equals.includes(String(controllingValue));
}

export default isFieldVisible;
