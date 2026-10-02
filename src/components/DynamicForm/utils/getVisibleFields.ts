import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import isFieldVisible from './isFieldVisible';
import isSupportedField from './isSupportedField';

/** The fields the user sees right now, which are also the only ones validated */
function getVisibleFields(fields: DynamicFormField[], values: DynamicFormValues): DynamicFormField[] {
    const supportedFields = fields.filter(isSupportedField);
    return supportedFields.filter((field) => isFieldVisible(field, values, supportedFields));
}

/** The page's only question, if it has one. Fields it reveals, such as an "Other" description, do not count, so the layout stays put when they appear. */
function getLoneField(visibleFields: DynamicFormField[]): DynamicFormField | undefined {
    const visibleKeys = new Set(visibleFields.map((field) => field.key));
    const questions = visibleFields.filter((field) => !field.showWhen || !visibleKeys.has(field.showWhen.key));
    return questions.length === 1 ? questions.at(0) : undefined;
}

export default getVisibleFields;
export {getLoneField};
