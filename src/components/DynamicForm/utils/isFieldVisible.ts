import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

function isFieldVisibleWithin(field: DynamicFormField, values: DynamicFormValues, allFields: DynamicFormField[], checkedKeys: Set<string>): boolean {
    if (!field.showWhen) {
        return true;
    }
    const {key, equals} = field.showWhen;
    const controller = allFields.find((candidate) => candidate.key === key);
    if (controller && !checkedKeys.has(controller.key) && !isFieldVisibleWithin(controller, values, allFields, new Set([...checkedKeys, field.key]))) {
        return false;
    }
    const controllingValue = values[key];
    if (Array.isArray(controllingValue)) {
        const chosenValues: unknown[] = controllingValue;
        return chosenValues.some((chosenValue) => typeof chosenValue === 'string' && equals.includes(chosenValue));
    }
    if (typeof controllingValue !== 'string' && typeof controllingValue !== 'boolean') {
        return false;
    }
    return equals.includes(String(controllingValue));
}

/** A field stays hidden while its controlling field is hidden, so an answer left on a hidden field cannot reveal its dependents. A list answer reveals the field when any chosen value matches. */
function isFieldVisible(field: DynamicFormField, values: DynamicFormValues, allFields: DynamicFormField[]): boolean {
    return isFieldVisibleWithin(field, values, allFields, new Set());
}

export default isFieldVisible;
