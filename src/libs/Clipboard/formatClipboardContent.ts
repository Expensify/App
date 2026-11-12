import getClipboardText from './getClipboardText';

type ClipboardContent = {
    html: string;
    plainText: string;
};

type ClipboardContentExtras = {
    reportIDToName?: Record<string, string>;
    accountIDToName?: Record<string, string>;
};

type ClipboardSource = {html: string} | {plainText: string};

/**
 * Turns one copied chat string into the two clipboard flavors.
 * An HTML source keeps its markup and derives plain text through getClipboardText (readable text on web, Markdown on native).
 * A plain-text source is copied unchanged, so a name like `<Team>` is not parsed as HTML.
 */
function formatClipboardContent(source: ClipboardSource, extras?: ClipboardContentExtras): ClipboardContent {
    if ('plainText' in source) {
        return {html: '', plainText: source.plainText};
    }

    if (!source.html) {
        return {html: '', plainText: ''};
    }

    return {
        html: source.html,
        plainText: getClipboardText(source.html, extras?.reportIDToName, extras?.accountIDToName),
    };
}

export default formatClipboardContent;
