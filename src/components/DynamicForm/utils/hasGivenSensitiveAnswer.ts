import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import getAnswerKeys from './getAnswerKeys';
import getVisibleFields from './getVisibleFields';
import hasDraftAnswer from './hasDraftAnswer';
import hasSensitiveAnswer from './hasSensitiveAnswer';

/**
 * Whether a shown field of the fields holds a sensitive answer the user gave, such as a typed SSN. Sensitive answers live only in memory until their page is
 * saved, so leaving the page before that loses them. A sensitive answer the server already holds is not given here, since its field stays empty.
 */
function hasGivenSensitiveAnswer(fields: DynamicFormField[], values: DynamicFormValues, allFields = fields): boolean {
    return getVisibleFields(fields, values, allFields)
        .filter(hasSensitiveAnswer)
        .some((field) => getAnswerKeys(field).some((key) => hasDraftAnswer(values[key])));
}

export default hasGivenSensitiveAnswer;
