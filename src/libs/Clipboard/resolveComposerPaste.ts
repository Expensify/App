type ComposerPaste = {kind: 'html'; markdown: string} | {kind: 'plain'};

/**
 * The composer should use HTML only when it converts to real content.
 * Empty or unsupported HTML must not hide a valid plain-text flavor.
 */
function resolveComposerPaste(html: string, toMarkdown: (value: string) => string): ComposerPaste {
    if (!html.trim() || html.startsWith('<p dir="ltr">')) {
        return {kind: 'plain'};
    }

    const markdown = toMarkdown(html);
    if (!markdown.trim()) {
        return {kind: 'plain'};
    }

    return {kind: 'html', markdown};
}

export default resolveComposerPaste;
