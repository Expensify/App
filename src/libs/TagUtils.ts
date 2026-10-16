import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {PolicyTags} from '@src/types/onyx';

import {Str} from 'expensify-common';

import {escapeTagName} from './PolicyUtils';
import StringUtils from './StringUtils';
import {containsHtmlTag} from './ValidationUtils';

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
type TagNameError =
    | typeof CONST.INPUT_VALIDATION_ERRORS.REQUIRED
    | typeof CONST.INPUT_VALIDATION_ERRORS.EXISTING
    | typeof CONST.INPUT_VALIDATION_ERRORS.INVALID
    | typeof CONST.INPUT_VALIDATION_ERRORS.TOO_LONG;

/**
 * Validates a tag name against every rule (required, HTML-like characters, reserved, unique, length). This is the single
 * source of truth shared by the create form, the RHP edit form, and inline table editing. Pass
 * `currentName` (the decoded display name) when editing so renaming a tag to its own name isn't flagged
 * as a duplicate. Uniqueness also matches HTML-encoded stored names such as `R&amp;D` vs `R&D`.
 * Returns an error code, or undefined when the name is valid.
 */
function getTagNameError(tags: PolicyTags | undefined, newName: string, currentName?: string): TagNameError | undefined {
    const sanitized = StringUtils.sanitizeName(newName);

    if (StringUtils.isEmptyString(sanitized)) {
        return CONST.INPUT_VALIDATION_ERRORS.REQUIRED;
    }

    // Tag name pages use strict HTML validation. Inline rename only calls this helper, so `</>` would otherwise save from the table.
    if (containsHtmlTag(sanitized, true)) {
        return CONST.INPUT_VALIDATION_ERRORS.INVALID;
    }

    // Tags are stored under their escaped name, so escape before the reserved-name, uniqueness, and length checks.
    const escaped = escapeTagName(sanitized);

    if (escaped === '0') {
        return CONST.INPUT_VALIDATION_ERRORS.INVALID;
    }

    // Tag keys may be HTML-encoded, so uniqueness compares decoded names as well as the escaped storage key.
    if (sanitized !== currentName && (tags?.[escaped] || Object.keys(tags ?? {}).some((name) => getDecodedTagName(name) === sanitized))) {
        return CONST.INPUT_VALIDATION_ERRORS.EXISTING;
    }

    // Spread to count Unicode code points rather than UTF-16 code units.
    if ([...escaped].length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
        return CONST.INPUT_VALIDATION_ERRORS.TOO_LONG;
    }

    return undefined;
}

/** Translates a {@link TagNameError} into a user-facing message for the given name. */
function getTagNameErrorMessage(translate: LocaleContextProps['translate'], error: TagNameError, name: string): string {
    switch (error) {
        case CONST.INPUT_VALIDATION_ERRORS.REQUIRED:
            return translate('workspace.tags.tagRequiredError');
        case CONST.INPUT_VALIDATION_ERRORS.EXISTING:
            return translate('workspace.tags.existingTagError');
        case CONST.INPUT_VALIDATION_ERRORS.INVALID:
            // Reserved name "0" and HTML-like names share this code. The Name page calls the latter an invalid character.
            if (containsHtmlTag(StringUtils.sanitizeName(name), true)) {
                return translate('common.error.invalidCharacter');
            }
            return translate('workspace.tags.invalidTagNameError');
        case CONST.INPUT_VALIDATION_ERRORS.TOO_LONG:
        default:
            return translate('common.error.characterLimitExceedCounter', [...escapeTagName(StringUtils.sanitizeName(name))].length, CONST.API_TRANSACTION_TAG_MAX_LENGTH);
    }
}

export {isTagMissing, trimTag, getDecodedTagName, getTagNameError, getTagNameErrorMessage};
