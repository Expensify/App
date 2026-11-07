import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';

import getContentFields from './getContentFields';
import getDynamicFieldErrors from './getDynamicFieldErrors';
import {isPageShown} from './getPageTitle';

/** The field errors of each page, by page index. A page the answers hide is never asked, so it has none. */
function getShownPageErrors(pages: DynamicFormPage[], values: DynamicFormValues, translate: LocalizedTranslate, allFields: DynamicFormField[]): Array<Record<string, string>> {
    return pages.map((page) => (isPageShown(page, values, allFields) ? getDynamicFieldErrors(getContentFields(page.content), values, translate, allFields) : {}));
}

export default getShownPageErrors;
