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

/** A field stays hidden while its controlling field is hidden, so an answer left on a hidden field cannot reveal its dependents */
function isFieldVisible(field: DynamicFormField, values: DynamicFormValues, allFields: DynamicFormField[]): boolean {
    return isFieldVisibleWithin(field, values, allFields, new Set());
}

/** The fields the user sees right now, which are also the only ones validated. `allFields` is the whole form when `fields` is one page of it, since a controlling field can sit on another page. */
function getVisibleFields(fields: DynamicFormField[], values: DynamicFormValues, allFields = fields): DynamicFormField[] {
    return fields.filter((field) => isFieldVisible(field, values, allFields));
}

/** The page's only question, if it has one. Fields it reveals, such as an "Other" description, do not count, so the layout stays put when they appear. */
function getLoneField(visibleFields: DynamicFormField[]): DynamicFormField | undefined {
    const visibleKeys = new Set(visibleFields.map((field) => field.key));
    const questions = visibleFields.filter((field) => !field.showWhen || !visibleKeys.has(field.showWhen.key));
    return questions.length === 1 ? questions.at(0) : undefined;
}

export default getVisibleFields;
export {getLoneField, isFieldVisible};
