import {Str} from 'expensify-common';

/**
 * Whether to render the report action as text
 */
export default function shouldRenderAsText(html: string, text: string): boolean {
    return Str.replaceAll(html, '<br />', '\n') === text;
}
