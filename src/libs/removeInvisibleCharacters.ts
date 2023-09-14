/**
 *  Remove invisible characters from a string except for spaces and format characters for emoji, and trim it.
 */
function removeInvisibleCharacters(value: string): string {
    let result = value;

    // Remove spaces:
    // - \u200B: zero-width space
    // - \u00A0: non-breaking space
    // - \u2060: word joiner
    result = result.replace(/[\u200B\u00A0\u2060]/g, '');

    // Remove all characters from the 'Other' (C) category except for format characters (Cf)
    // because some of them they are used for emojis
    result = result.replace(/[\p{Cc}\p{Cs}\p{Co}\p{Cn}]/gu, '');

    // Remove characters from the (Cf) category that are not used for emojis
    result = result.replace(/[\u200E-\u200F]/g, '');

    // Remove all characters from the 'Separator' (Z) category except for Space Separator (Zs)
    result = result.replace(/[\p{Zl}\p{Zp}]/gu, '');

    return result.trim();
}

export default removeInvisibleCharacters;
