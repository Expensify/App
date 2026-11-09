import type {DynamicFormValues} from '@components/DynamicForm/types';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';

import getAnswerKeys from './getAnswerKeys';
import getContentFields from './getContentFields';
import {isPageShown} from './getPageTitle';
import isSupportedField from './isSupportedField';

/**
 * The errors the server sent for single answers, such as a SWIFT code it does not accept, by page index and keyed by draft key like getShownPageErrors.
 * An error for an answer no shown page asks is left out, since no row could show it.
 */
function getServerPageErrors(pages: DynamicFormPage[], values: DynamicFormValues, allFields: DynamicFormField[], errorFields: ErrorFields | null | undefined): Array<Record<string, string>> {
    return pages.map((page) => {
        if (!errorFields || !isPageShown(page, values, allFields)) {
            return {};
        }
        const pageErrors: Record<string, string> = {};
        for (const field of getContentFields(page.content).filter(isSupportedField)) {
            for (const key of new Set([field.key, ...getAnswerKeys(field)])) {
                const message = getLatestErrorMessage({errors: errorFields[key]});
                if (message) {
                    pageErrors[key] = message;
                }
            }
        }
        return pageErrors;
    });
}

export default getServerPageErrors;
