import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormGroup} from './groupFieldsIntoPages';

import getDynamicFieldErrors from './getDynamicFieldErrors';

/** The first page with a missing or invalid answer, or -1 when every page is complete */
function getFirstIncompleteGroupIndex(groups: DynamicFormGroup[], values: DynamicFormValues, translate: LocalizedTranslate): number {
    return groups.findIndex((group) => Object.keys(getDynamicFieldErrors(group.fields, values, translate)).length > 0);
}

export default getFirstIncompleteGroupIndex;
