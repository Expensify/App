import type {DynamicFormContentItem} from '@src/types/onyx';

/** The fields of a page's content, for getDynamicFieldErrors and other field-only checks. Extract rather than Exclude, since every field is structurally a heading too. */
function getContentFields<TItem extends DynamicFormContentItem>(content: TItem[]): Array<Extract<TItem, {type: string}>> {
    // Only fields have a type, so headings and links, which have no answer, are left out
    return content.filter((item): item is Extract<TItem, {type: string}> => 'type' in item);
}

export default getContentFields;
