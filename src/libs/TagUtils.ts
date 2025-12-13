import {Str} from 'expensify-common';
import CONST from '@src/CONST';

/**
 * Checks if a tag value is missing/empty
 * Similar to isCategoryMissing but for tags
 */
function isTagMissing(tag: string | undefined): boolean {
    if (!tag) {
        return true;
    }
    return tag === CONST.SEARCH.TAG_EMPTY_VALUE;
}

/**
 * Decodes HTML entities in tag names for display
 * Similar to getDecodedCategoryName but for tags
 */
function getDecodedTagName(tagName: string): string {
    return Str.htmlDecode(tagName);
}

export default isTagMissing;
export {getDecodedTagName};
