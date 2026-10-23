import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getPages} from '@components/DynamicForm/utils/paginate';

import type {ErrorFields} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import US from './forms/US';

const US_PAGES = getPages(US);

/**
 * The first onboarding page where the user can fix an answer the server rejected. A read-only answer or a key no page collects has no such page,
 * so its error is shown where the request was made.
 */
function getPageWithServerError(errorFields: ErrorFields | null | undefined) {
    return US_PAGES.find((page) =>
        getContentFields(page.content)
            .filter(isSupportedField)
            .filter((field) => !field.readonly)
            .flatMap(getAnswerKeys)
            .some((key) => !isEmptyObject(errorFields?.[key] ?? {})),
    );
}

export default getPageWithServerError;
