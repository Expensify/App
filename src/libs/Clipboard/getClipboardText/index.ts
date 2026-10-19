import Parser from '@libs/Parser';

export default function getClipboardText(selection: string, reportIDToName?: Record<string, string>): string {
    return Parser.htmlToText(selection, {reportIDToName});
}
