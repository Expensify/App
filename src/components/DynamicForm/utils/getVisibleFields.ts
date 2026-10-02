import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import isFieldVisible from './isFieldVisible';
import isSupportedField from './isSupportedField';

/** The fields the user sees right now, which are also the only ones validated */
function getVisibleFields(fields: DynamicFormField[], values: DynamicFormValues): DynamicFormField[] {
    const supportedFields = fields.filter(isSupportedField);
    return supportedFields.filter((field) => isFieldVisible(field, values, supportedFields));
}

export default getVisibleFields;
