import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {PolicyTags} from '@src/types/onyx';

import {Str} from 'expensify-common';

import {escapeTagName} from './PolicyUtils';

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

/** The reason a proposed tag name is invalid. Callers translate it via `getTagNameErrorMessage`. */
type TagNameError = 'required' | 'existing' | 'invalid' | 'tooLong';

/** Normalizes a tag name by converting non-breaking spaces and trimming surrounding whitespace. */
function sanitizeTagName(name: string): string {
    return name.replaceAll(CONST.REGEX.NON_BREAKING_SPACE, ' ').trim();
}

/**
 * Validates a tag name against every rule (required, reserved, unique, length). This is the single
 * source of truth shared by the create form, the RHP edit form, and inline table editing. Pass
 * `currentName` (the decoded display name) when editing so renaming a tag to its own name isn't flagged
 * as a duplicate. Returns an error code, or undefined when the name is valid.
 */
function getTagNameError(tags: PolicyTags | undefined, newName: string, currentName?: string): TagNameError | undefined {
    const sanitized = sanitizeTagName(newName);

    if (!sanitized) {
        return 'required';
    }

    // Tags are stored under their escaped name, so escape before both the reserved-name and uniqueness checks.
    const escaped = escapeTagName(sanitized);

    if (escaped === '0') {
        return 'invalid';
    }

    if (tags?.[escaped] && sanitized !== currentName) {
        return 'existing';
    }

    // Spread to count Unicode code points rather than UTF-16 code units.
    if ([...sanitized].length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
        return 'tooLong';
    }

    return undefined;
}

/** Translates a {@link TagNameError} into a user-facing message for the given name. */
function getTagNameErrorMessage(translate: LocaleContextProps['translate'], error: TagNameError, name: string): string {
    switch (error) {
        case 'required':
            return translate('workspace.tags.tagRequiredError');
        case 'existing':
            return translate('workspace.tags.existingTagError');
        case 'invalid':
            return translate('workspace.tags.invalidTagNameError');
        case 'tooLong':
        default:
            return translate('common.error.characterLimitExceedCounter', [...sanitizeTagName(name)].length, CONST.API_TRANSACTION_TAG_MAX_LENGTH);
    }
}

export {isTagMissing, trimTag, getDecodedTagName, sanitizeTagName, getTagNameError, getTagNameErrorMessage};
export type {TagNameError};
