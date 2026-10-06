import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue} from '@components/Form/types';

import {isListItem} from './listItems';

function isFormValue(value: unknown): value is FormValue {
    if (typeof value === 'string' || typeof value === 'boolean' || value instanceof Date) {
        return true;
    }
    if (!Array.isArray(value)) {
        return false;
    }
    const items: unknown[] = value;
    return (
        items.every((item) => typeof item === 'string') ||
        items.every((item) => typeof item === 'boolean') ||
        items.every((item) => typeof item === 'object' && item !== null && ('name' in item || 'uri' in item)) ||
        items.every(isListItem)
    );
}

/** The answers in a form draft or a FormProvider submission. A dynamic form's keys come from the schema, so its Onyx type cannot list them. */
function toDynamicFormValues(formValues: unknown): DynamicFormValues {
    if (typeof formValues !== 'object' || formValues === null) {
        return {};
    }
    return Object.fromEntries(Object.entries(formValues).filter(([, value]) => isFormValue(value)));
}

export default toDynamicFormValues;
