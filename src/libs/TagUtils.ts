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
 * Splits tag using ":" but not "\:" since that is a valid character in a tag name. This is used to split multilevel tags in a rule, which are stored as "tag1:tag2:tag3"
 */
function splitTag(tag: string): string[] {
    return tag.split(/(?<!\\):/);
}

/**
 * Removes ":" from the end of a tag string, which is used as a delimiter for multilevel tags in a rule
 */
function trimTag(tag: string): string {
    return tag.replace(/:*$/, '');
}

export {isTagMissing, splitTag, trimTag};
