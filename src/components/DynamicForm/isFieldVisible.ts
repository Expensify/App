import type {DynamicFormField} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

/** A field hidden by `showWhen` stays hidden while its controlling field is itself hidden, so a stale controller answer cannot leak dependents in */
function isFieldVisible(field: DynamicFormField, values: DynamicFormValues, allFields: DynamicFormField[] = [], seen = new Set<string>()): boolean {
    if (!field.showWhen) {
        return true;
    }
    const controller = allFields.find((candidate) => candidate.key === field.showWhen?.key);
    if (controller && !seen.has(controller.key) && !isFieldVisible(controller, values, allFields, new Set([...seen, field.key]))) {
        return false;
    }
    const controllingValue = values[field.showWhen.key];
    if (typeof controllingValue !== 'string' && typeof controllingValue !== 'boolean' && typeof controllingValue !== 'number') {
        return false;
    }
    return field.showWhen.equals.includes(String(controllingValue));
}

export default isFieldVisible;
