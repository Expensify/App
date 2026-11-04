/** Maps the field errors Auth returns for SubmitWiseBusinessOnboarding to the US onboarding page that collected those answers. */
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getPages} from '@components/DynamicForm/utils/paginate';

import type {ErrorFields} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import US from './forms/US';

const US_PAGES = getPages(US);

/**
 * The first onboarding page where the user can fix an answer Wise rejected. A read-only answer, or a key no page collects, has no such page,
 * so its error stays on the terms page.
 */
function getPageWithServerError(errorFields: ErrorFields | null | undefined) {
    return US_PAGES.find((page) =>
        getContentFields(page.content).some((field) => isSupportedField(field) && !field.readonly && getAnswerKeys(field).some((key) => !isEmptyObject(errorFields?.[key] ?? {}))),
    );
}

export default getPageWithServerError;
