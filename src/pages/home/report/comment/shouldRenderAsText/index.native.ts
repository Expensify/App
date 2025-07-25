import {Str} from 'expensify-common';
import {containsCustomEmoji} from '@libs/EmojiUtils';

/**
 * Whether to render the report action as text
 */
export default function shouldRenderAsText(html: string, text: string): boolean {
    // On native, we render emoji as text to prevent the large emoji is cut off when the action is edited.
    // More info: https://github.com/Expensify/App/pull/35838#issuecomment-1964839350
    const htmlWithoutLineBreak = Str.replaceAll(html, '<br />', '\n');
    const htmlWithoutEmojiOpenTag = Str.replaceAll(htmlWithoutLineBreak, '<emoji>', '');
    return Str.replaceAll(htmlWithoutEmojiOpenTag, '</emoji>', '') === text && !containsCustomEmoji(text);
}
