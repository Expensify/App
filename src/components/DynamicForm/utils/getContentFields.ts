import type {DynamicFormContentItem} from '@src/types/onyx';

import isHeading from './isHeading';

/** The fields of a page's content, for getDynamicFieldErrors and other field-only checks. Extract rather than Exclude, since every field is structurally a heading too. */
function getContentFields<TItem extends DynamicFormContentItem>(content: TItem[]): Array<Extract<TItem, {type: string}>> {
    return content.filter((item): item is Extract<TItem, {type: string}> => !isHeading(item));
}

export default getContentFields;
