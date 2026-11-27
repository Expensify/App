import formatClipboardContent from '@libs/Clipboard/formatClipboardContent';
import type * as ClipboardTextWebModule from '@libs/Clipboard/getClipboardText/index';
import resolveComposerPaste from '@libs/Clipboard/resolveComposerPaste';

// Jest resolves the native clipboard text module. These cases describe the web plain-text flavor.
jest.mock('@libs/Clipboard/getClipboardText', () => jest.requireActual<typeof ClipboardTextWebModule>('@libs/Clipboard/getClipboardText/index.ts'));

describe('formatClipboardContent', () => {
    it('keeps a single message and its HTML flavor', () => {
        // Given one copied message
        const source = '<div>only one</div>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then plain text is readable and HTML still carries the markup for a rich paste
        expect(content.plainText).toBe('only one');
        expect(content.html).toBe(source);
    });

    it('keeps a line break between messages in plain text and keeps the HTML flavor', () => {
        // Given two copied messages wrapped the way a painted selection serializes them
        const source = '<div>first message</div><div>second message</div>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then plain text keeps the boundary and HTML still carries the source
        expect(content.plainText).toBe('first message\nsecond message');
        expect(content.html).toBe(source);
        expect(content.plainText).not.toContain('\n\n\n');
    });

    it('does not turn the newline between block tags into a blank line', () => {
        // Given serialized messages separated by a newline between the tags, which is not a blank paragraph
        // When both clipboard flavors are built
        const content = formatClipboardContent({html: '<div>a</div>\n<div>b</div>'});

        // Then the messages stay on adjacent lines, because the tag boundary is not another paragraph
        expect(content.plainText).toBe('a\nb');
    });

    it('keeps a paragraph break from consecutive break tags', () => {
        // Given a message whose paragraph break is two break tags, not a block-tag boundary
        // When both clipboard flavors are built
        const content = formatClipboardContent({html: 'first paragraph<br><br>second paragraph'});

        // Then the paragraph break remains a blank line in plain text
        expect(content.plainText).toBe('first paragraph\n\nsecond paragraph');
    });

    it('keeps a named link in HTML and copies only its readable text', () => {
        // Given a named link, which a plain-text destination must not show as Markdown
        const source = '<a href="https://expensify.com">Expensify</a>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then HTML keeps the link and plain text keeps only the visible name
        expect(content.html).toBe(source);
        expect(content.plainText).toBe('Expensify');
        expect(content.plainText).not.toContain('](');
    });

    it('strips inline formatting from plain text without adding Markdown markers', () => {
        // Given inline formatting, which plain text should not restate as Markdown syntax
        const source = '<strong>bold</strong> and <em>italic</em>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then the readable words remain and the HTML flavor still carries the formatting
        expect(content.plainText).toBe('bold and italic');
        expect(content.html).toBe(source);
    });

    it('copies a code block as its text', () => {
        // Given a code block, whose text a plain-text destination should receive without fence markers
        const source = '<pre>const amount = 10;</pre>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then the code text is copied and the HTML flavor is unchanged
        expect(content.plainText).toBe('const amount = 10;');
        expect(content.html).toBe(source);
    });

    it('keeps blank lines that are part of a code block', () => {
        // Given a code block whose blank lines belong to the copied text, not to a message separator
        const source = '<pre>first\n\n\nlast</pre>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then plain text keeps every newline, because collapsing them would change the code in a plain-text paste
        expect(content.plainText).toBe('first\n\n\nlast');
        expect(content.html).toBe(source);
    });

    it('copies a quote as its text', () => {
        // Given a quote, which plain text should not prefix with Markdown quote syntax
        const source = '<blockquote>quoted message</blockquote>';

        // When both clipboard flavors are built
        const content = formatClipboardContent({html: source});

        // Then the quoted words are copied and the HTML flavor is unchanged
        expect(content.plainText).toBe('quoted message');
        expect(content.html).toBe(source);
    });

    it('resolves a mention with the supplied name maps', () => {
        // Given mention tags whose visible names are known only through the caller maps
        const source = 'hey <mention-user accountID="42"></mention-user> in <mention-report reportID="7"></mention-report>';
        const accountIDToName: Record<string, string> = {};
        accountIDToName['42'] = 'Ada Lovelace';
        const reportIDToName: Record<string, string> = {};
        reportIDToName['7'] = '#general';

        // When both clipboard flavors are built with those maps
        const content = formatClipboardContent(
            {html: source},
            {
                accountIDToName,
                reportIDToName,
            },
        );

        // Then plain text names the person and the room instead of leaving the raw tags
        expect(content.plainText).toBe('hey @Ada Lovelace in #general');
        expect(content.html).toBe(source);
    });

    it('leaves an already plain message unchanged and writes no HTML flavor', () => {
        // Given a system message that is already plain text and contains characters that look like markup
        const source = 'Workspace <Team> & Co';

        // When the plain-text clipboard path is used
        const content = formatClipboardContent({plainText: source});

        // Then the name is copied literally, because parsing it as HTML would drop the bracketed word
        expect(content).toEqual({html: '', plainText: source});
    });

    it('turns a break tag into a plain-text line break', () => {
        // Given a line break inside one message, which is not a boundary between two messages
        // When both clipboard flavors are built
        const content = formatClipboardContent({html: 'first line<br>second line'});

        // Then the break remains a newline in plain text
        expect(content.plainText).toBe('first line\nsecond line');
    });
});

describe('resolveComposerPaste', () => {
    const toMarkdown = (html: string) => (html.includes('empty') ? '   ' : `md:${html}`);

    it('uses converted HTML when the flavor has content', () => {
        // Given HTML that converts to real composer content
        // When the composer chooses a paste flavor
        const paste = resolveComposerPaste('<div>first</div>', toMarkdown);

        // Then the converted HTML is used, because that is the flavor that keeps formatting
        expect(paste).toEqual({kind: 'html', markdown: 'md:<div>first</div>'});
    });

    it('falls back when HTML is empty', () => {
        // Given an HTML flavor that is only whitespace
        // When the composer chooses a paste flavor
        const paste = resolveComposerPaste('   ', toMarkdown);

        // Then plain text is used, because empty HTML must not hide a valid plain-text flavor
        expect(paste).toEqual({kind: 'plain'});
    });

    it('falls back when HTML does not convert to content', () => {
        // Given HTML that converts to nothing the composer can insert
        // When the composer chooses a paste flavor
        const paste = resolveComposerPaste('<div>empty</div>', toMarkdown);

        // Then plain text is used, because unsupported HTML must not paste nothing
        expect(paste).toEqual({kind: 'plain'});
    });

    it('keeps the native markdown input on the plain-text path', () => {
        // Given the wrapper the native markdown input adds around stored markdown
        // When the composer chooses a paste flavor
        const paste = resolveComposerPaste('<p dir="ltr"><span>hello</span></p>', toMarkdown);

        // Then plain text is used, because converting that wrapper would replace the stored markdown
        expect(paste).toEqual({kind: 'plain'});
    });
});
