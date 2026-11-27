import Parser from '@libs/Parser';

// Block tags that separate messages and paragraphs. htmlToText drops these without a newline, which mashes
// `<div>first message</div><div>second message</div>` into one line. htmlToMarkdown already splits them.
const BLOCK_TAG = /<(?:div|comment|h[1-6]|p|li|blockquote|pre)\b[^>]*>|<\/(?:div|comment|h[1-6]|p|li|blockquote|pre)>/gi;

/**
 * Web plain-text flavor. Keeps message and paragraph breaks and does not add Markdown syntax.
 */
export default function getClipboardText(selection: string, reportIDToName?: Record<string, string>, accountIDToName?: Record<string, string>): string {
    if (!selection) {
        return '';
    }

    const lines: string[] = [];
    for (const chunk of selection.split(BLOCK_TAG)) {
        const text = Parser.htmlToText(chunk, {reportIDToName, accountIDToName});
        if (!text.trim()) {
            continue;
        }
        lines.push(text);
    }

    // Join block boundaries with one newline. Do not collapse longer runs: a code block can contain them on purpose.
    return lines.join('\n');
}
