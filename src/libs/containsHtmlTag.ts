/**
 * HTML-tag check shared with FormProvider.
 * Lives outside ValidationUtils because that module imports CardUtils, and card name validation needs this check too.
 */
import CONST from '@src/CONST';

/**
 * Returns true if the given string contains a non-whitelisted HTML-like tag.
 *
 * Mirrors the HTML-tag check in FormProvider.onValidate so callers that don't go through
 * FormProvider (e.g. inline edit-in-place sections) can produce the same `Invalid character`
 * error for inputs like `<script>...</script>` while still allowing the harmless tokens listed
 * in CONST.WHITELISTED_TAGS (`<>`, `<->`, `<br>`, etc.).
 *
 * @param strict - When true, uses STRICT_VALIDATE_FOR_HTML_TAG_REGEX, which also flags
 * non-standard angle-bracket content (e.g. `<✓>`). Defaults to the non-strict variant
 * to match FormProvider's default.
 */
function containsHtmlTag(value: string, strict = false): boolean {
    if (!value) {
        return false;
    }
    const tagRegex = strict ? CONST.STRICT_VALIDATE_FOR_HTML_TAG_REGEX : CONST.VALIDATE_FOR_HTML_TAG_REGEX;
    const foundHtmlTagIndex = value.search(tagRegex);
    const leadingSpaceIndex = value.search(CONST.VALIDATE_FOR_LEADING_SPACES_HTML_TAG_REGEX);

    if (leadingSpaceIndex === -1 && foundHtmlTagIndex === -1) {
        return false;
    }

    const matchedHtmlTags = value.match(tagRegex);
    let isWhitelisted = CONST.WHITELISTED_TAGS.some((regex) => regex.test(value));
    if (matchedHtmlTags) {
        for (const htmlTag of matchedHtmlTags) {
            isWhitelisted = CONST.WHITELISTED_TAGS.some((regex) => regex.test(htmlTag));
            if (!isWhitelisted) {
                break;
            }
        }
    }

    return !(isWhitelisted && leadingSpaceIndex === -1);
}

export default containsHtmlTag;
