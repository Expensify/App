import Parser from '@libs/Parser';

export default function getClipboardText(selection: string): string {
    return Parser.htmlToMarkdown(selection);
}
