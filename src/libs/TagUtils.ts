import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import type {PolicyTagList} from '@src/types/onyx/PolicyTag';

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
 * Removes ":" from the end of a tag string, which is used as a delimiter for multilevel tags in a rule
 */
function trimTag(tag: string): string {
    const tagWithoutEscapedColons = tag.replaceAll('\\:', '☢');
    return tagWithoutEscapedColons.replace(/:*$/, '').replaceAll('☢', '\\:');
}

/**
 * HTML-decodes a tag name so values stored with different encodings are displayed correctly (e.g. `R&amp;D` vs `R&D`)
 * Mirrors getDecodedCategoryName in CategoryUtils.
 */
function getDecodedTagName(tagName: string): string {
    return Str.htmlDecode(tagName);
}

/**
 * Checks whether any tag across the multi-level tag lists has a GL Code, so the export only includes GL Code columns when they exist.
 */
function hasAnyTagGLCode(policyTagLists: PolicyTagList[]): boolean {
    return policyTagLists.some((tagList) => Object.values(tagList.tags ?? {}).some((tag) => !!tag['GL Code']));
}

export {isTagMissing, trimTag, getDecodedTagName, hasAnyTagGLCode};
