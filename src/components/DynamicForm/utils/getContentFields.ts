import type {DynamicFormContentItem, DynamicFormHeading} from '@src/types/onyx';

import isHeading from './isHeading';

/** The fields of a page's content, for getDynamicFieldErrors and other field-only checks */
function getContentFields<TItem extends DynamicFormContentItem>(content: TItem[]): Array<Exclude<TItem, DynamicFormHeading>> {
    return content.filter((item): item is Exclude<TItem, DynamicFormHeading> => !isHeading(item));
}

export default getContentFields;
