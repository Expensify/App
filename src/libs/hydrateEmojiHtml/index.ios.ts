import {Str} from 'expensify-common';

const BLOCK_BOUNDARY_BEFORE = '(?:^|<br\\s*\\/?>|<\\/(?:div|p|blockquote|comment|h[1-6]|li|ul|ol|section|article)>)';
const BLOCK_BOUNDARY_AFTER = '(?:$|<br\\s*\\/?>|<(?:div|p|blockquote|comment|h[1-6]|li|ul|ol|section|article)\\b)';
const EMOJI_ON_SEPARATE_LINE_PATTERN = new RegExp(`(${BLOCK_BOUNDARY_BEFORE})(\\s*)(<emoji\\b)([^>]*>[^<]*</emoji>)(\\s*)(?=${BLOCK_BOUNDARY_AFTER})`, 'gi');

/**
 * Hydrates raw <emoji> tags in HTML by adding ismedium and isOnSeparateLine attributes (iOS-only).
 * - Adds ismedium to every <emoji> opening tag for consistent rendering.
 * - Adds oneline to emoji tags that appear on their own line (between block boundaries).
 *
 * @param html - HTML string containing raw <emoji> tags (e.g. <emoji>😀</emoji>)
 * @returns HTML with hydrated <emoji> tags (e.g. <emoji ismedium>😀</emoji> or <emoji ismedium isOnSeparateLine>😀</emoji> when on separate line)
 */
function hydrateEmojiHtml(html: string): string {
    let result = Str.replaceAll(html, '<emoji>', '<emoji ismedium>');
    result = result.replaceAll(EMOJI_ON_SEPARATE_LINE_PATTERN, (_match: string, boundaryBefore: string, wsBefore: string, emojiStart: string, emojiRest: string, wsAfter: string) => {
        const fullOpeningTag = emojiStart + emojiRest;
        if (!fullOpeningTag.includes('isOnSeparateLine')) {
            return `${boundaryBefore}${wsBefore}<emoji isOnSeparateLine${emojiRest}${wsAfter}`;
        }
        return _match;
    });
    return result;
}

export default hydrateEmojiHtml;
