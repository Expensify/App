import {Str} from 'expensify-common';

/**
 * Default (non-iOS): Returns HTML unchanged.
 * Emoji hydration (ismedium, isOnSeparateLine) is only applied on iOS to fix a platform-specific bug.
 *
 * @param html - HTML string containing raw <emoji> tags
 * @returns HTML unchanged
 */
function hydrateEmojiHtml(html: string): string {
    return Str.replaceAll(html, '<emoji>', '<emoji ismedium>');
}

export default hydrateEmojiHtml;
