import formatClipboardContent from '@libs/Clipboard/formatClipboardContent';
import type * as ClipboardTextWebModule from '@libs/Clipboard/getClipboardText/index';
import resolveComposerPaste from '@libs/Clipboard/resolveComposerPaste';

// Jest resolves the native clipboard text module. These cases describe the web plain-text flavor.
jest.mock('@libs/Clipboard/getClipboardText', () => jest.requireActual<typeof ClipboardTextWebModule>('@libs/Clipboard/getClipboardText/index.ts'));

describe('formatClipboardContent', () => {
    it('keeps a single message and its HTML flavor', () => {
        const source = '<div>only one</div>';

        const content = formatClipboardContent({html: source});

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
        const content = formatClipboardContent({html: '<div>a</div>\n<div>b</div>'});

        expect(content.plainText).toBe('a\nb');
    });

    it('keeps a paragraph break from consecutive break tags', () => {
        const content = formatClipboardContent({html: 'first paragraph<br><br>second paragraph'});

        expect(content.plainText).toBe('first paragraph\n\nsecond paragraph');
    });

    it('keeps a named link in HTML and copies only its readable text', () => {
        const source = '<a href="https://expensify.com">Expensify</a>';

        const content = formatClipboardContent({html: source});

        expect(content.html).toBe(source);
        expect(content.plainText).toBe('Expensify');
        expect(content.plainText).not.toContain('](');
    });

    it('strips inline formatting from plain text without adding Markdown markers', () => {
        const source = '<strong>bold</strong> and <em>italic</em>';

        const content = formatClipboardContent({html: source});

        expect(content.plainText).toBe('bold and italic');
        expect(content.html).toBe(source);
    });

    it('copies a code block as its text', () => {
        const source = '<pre>const amount = 10;</pre>';

        const content = formatClipboardContent({html: source});

        expect(content.plainText).toBe('const amount = 10;');
        expect(content.html).toBe(source);
    });

    it('copies a quote as its text', () => {
        const source = '<blockquote>quoted message</blockquote>';

        const content = formatClipboardContent({html: source});

        expect(content.plainText).toBe('quoted message');
        expect(content.html).toBe(source);
    });

    it('resolves a mention with the supplied name maps', () => {
        const source = 'hey <mention-user accountID="42"></mention-user> in <mention-report reportID="7"></mention-report>';

        const accountIDToName: Record<string, string> = {};
        accountIDToName['42'] = 'Ada Lovelace';
        const reportIDToName: Record<string, string> = {};
        reportIDToName['7'] = '#general';

        const content = formatClipboardContent(
            {html: source},
            {
                accountIDToName,
                reportIDToName,
            },
        );

        expect(content.plainText).toBe('hey @Ada Lovelace in #general');
        expect(content.html).toBe(source);
    });

    it('leaves an already plain message unchanged and writes no HTML flavor', () => {
        const source = 'Workspace <Team> & Co';

        const content = formatClipboardContent({plainText: source});

        expect(content).toEqual({html: '', plainText: source});
    });

    it('turns a break tag into a plain-text line break', () => {
        const content = formatClipboardContent({html: 'first line<br>second line'});

        expect(content.plainText).toBe('first line\nsecond line');
    });
});

describe('resolveComposerPaste', () => {
    const toMarkdown = (html: string) => (html.includes('empty') ? '   ' : `md:${html}`);

    it('uses converted HTML when the flavor has content', () => {
        expect(resolveComposerPaste('<div>first</div>', toMarkdown)).toEqual({kind: 'html', markdown: 'md:<div>first</div>'});
    });

    it('falls back when HTML is empty', () => {
        expect(resolveComposerPaste('   ', toMarkdown)).toEqual({kind: 'plain'});
    });

    it('falls back when HTML does not convert to content', () => {
        expect(resolveComposerPaste('<div>empty</div>', toMarkdown)).toEqual({kind: 'plain'});
    });

    it('keeps the native markdown input on the plain-text path', () => {
        expect(resolveComposerPaste('<p dir="ltr"><span>hello</span></p>', toMarkdown)).toEqual({kind: 'plain'});
    });
});
