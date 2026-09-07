import CONST from '@src/CONST';

/**
 * Custom emojis are the private use area code points we render with our own font. These two predicates live
 * outside EmojiUtils so that components can use them without importing EmojiUtils, which renders components
 * of its own and would close an import cycle.
 */
function containsCustomEmoji(text?: string): boolean {
    if (!text) {
        return false;
    }

    const privateUseAreaRegex = CONST.REGEX.PRIVATE_USER_AREA;
    return privateUseAreaRegex.test(text);
}

function containsOnlyCustomEmoji(text?: string): boolean {
    if (!text) {
        return false;
    }

    const privateUseAreaRegex = CONST.REGEX.ONLY_PRIVATE_USER_AREA;
    return privateUseAreaRegex.test(text);
}

export {containsCustomEmoji, containsOnlyCustomEmoji};
