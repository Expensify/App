import {detectAndRewritePaste, escapeLinkText, isStandaloneURL, normalizeMultilineMarkdownLinks, sanitizeUrlForMarkdown, toMarkdownLink} from '@libs/MarkdownLinkHelpers';

describe('markdownLinkHelpers', () => {
    describe('isStandaloneURL', () => {
        it('accepts a valid URL like https://example.com', () => {
            expect(isStandaloneURL('https://example.com')).toBe(true);
        });

        it('rejects a URL with whitespace like https://exa mple.com', () => {
            expect(isStandaloneURL('https://exa mple.com')).toBe(false);
        });

        it('accepts a valid URL with angle-bracket wrappers like <https://example.com>', () => {
            expect(isStandaloneURL('<https://example.com>')).toBe(true);
        });

        it('rejects an empty string', () => {
            expect(isStandaloneURL('')).toBe(false);
        });

        it('rejects text with multiple words', () => {
            expect(isStandaloneURL('hello world')).toBe(false);
        });

        it('rejects invalid URL without protocol', () => {
            expect(isStandaloneURL('example.com')).toBe(false);
        });
    });

    describe('escapeLinkText', () => {
        it('escapes opening and closing square brackets', () => {
            expect(escapeLinkText('a[b]c')).toBe('a&#91;b&#93;c');
        });

        it('collapses newlines to spaces', () => {
            expect(escapeLinkText('line1\nline2\r\nline3')).toBe('line1 line2 line3');
        });

        it('collapses repeated whitespace to single space and trims', () => {
            expect(escapeLinkText('  foo   bar  ')).toBe('foo bar');
        });

        it('handles empty string', () => {
            expect(escapeLinkText('')).toBe('');
        });

        it('does not alter text without special characters or whitespace issues', () => {
            expect(escapeLinkText('normal text')).toBe('normal text');
        });
    });

    describe('sanitizeUrlForMarkdown', () => {
        it('removes surrounding angle brackets if present', () => {
            expect(sanitizeUrlForMarkdown('<https://example.com>')).toBe('https://example.com');
        });

        it('encodes special characters', () => {
            expect(sanitizeUrlForMarkdown('https://example.com/path?query=val&other=2')).toBe('https://example.com/path?query=val&other=2');
        });

        it('handles invalid URLs gracefully without encoding', () => {
            expect(sanitizeUrlForMarkdown('invalid url')).toBe('invalid url');
        });

        it('trims whitespace', () => {
            expect(sanitizeUrlForMarkdown(' https://example.com ')).toBe('https://example.com');
        });
    });

    describe('toMarkdownLink', () => {
        it('builds a correct Markdown link with escaped text and sanitized URL', () => {
            expect(toMarkdownLink('example text', 'https://example.com')).toBe('[example text](https://example.com)');
        });

        it('escapes ] in text', () => {
            expect(toMarkdownLink('a]b', 'https://example.com')).toBe('[a&#93;b](https://example.com)');
        });

        it('collapses newlines in selected text', () => {
            expect(toMarkdownLink('line1\nline2', 'https://example.com')).toBe('[line1 line2](https://example.com)');
        });

        it('handles empty text or URL', () => {
            expect(toMarkdownLink('', 'https://example.com')).toBe('[](https://example.com)');
            expect(toMarkdownLink('text', '')).toBe('[text]()');
        });
    });

    describe('detectAndRewritePaste', () => {
        it('replaces when there is a selection and inserted text is a single URL', () => {
            const prevText = 'This is some selected text here.';
            const selectionStart = 13;
            const selectionEnd = 26;
            const insertedText = 'https://example.com';
            const result = detectAndRewritePaste(prevText, selectionStart, selectionEnd, insertedText);
            expect(result.didReplace).toBe(true);
            expect(result.text).toBe('This is some [selected text](https://example.com) here.');
        });

        it('does not replace when there is no selection', () => {
            const prevText = 'Insert here';
            const selectionStart = 7;
            const selectionEnd = 7;
            const insertedText = 'https://example.com';
            const result = detectAndRewritePaste(prevText, selectionStart, selectionEnd, insertedText);
            expect(result.didReplace).toBe(false);
            expect(result.text).toBe(null);
        });

        it('does not replace if inserted text is not a standalone URL', () => {
            const prevText = 'Selected text';
            const selectionStart = 0;
            const selectionEnd = 13;
            const insertedText = 'not a url';
            const result = detectAndRewritePaste(prevText, selectionStart, selectionEnd, insertedText);
            expect(result.didReplace).toBe(false);
            expect(result.text).toBe(null);
        });

        it('handles negative selection length gracefully', () => {
            const prevText = 'Text';
            const selectionStart = 5;
            const selectionEnd = 0;
            const insertedText = 'https://example.com';
            const result = detectAndRewritePaste(prevText, selectionStart, selectionEnd, insertedText);
            expect(result.didReplace).toBe(false);
            expect(result.text).toBe(null);
        });
    });

    describe('normalizeMultilineMarkdownLinks', () => {
        it('collapses newline in link text to space: [text\\nhere](url) -> [text here](url)', () => {
            expect(normalizeMultilineMarkdownLinks('[text\nhere](https://example.com)')).toBe('[text here](https://example.com)');
        });

        it('collapses multiple newlines in link text to single space: [text\\n\\nhere](url) -> [text here](url)', () => {
            expect(normalizeMultilineMarkdownLinks('[text\n\nhere](https://example.com)')).toBe('[text here](https://example.com)');
        });

        it('collapses newline and spaces in link text: [text\\n  here](url) -> [text here](url)', () => {
            expect(normalizeMultilineMarkdownLinks('[text\n  here](https://example.com)')).toBe('[text here](https://example.com)');
        });

        it('handles link text and URL on separate lines: [text]\\n(url) -> [text](url)', () => {
            expect(normalizeMultilineMarkdownLinks('[text]\n(https://example.com)')).toBe('[text](https://example.com)');
        });

        it('handles newline between ] and (: [text\\nhere]\\n(url) -> [text here](url)', () => {
            expect(normalizeMultilineMarkdownLinks('[text\nhere]\n(https://example.com)')).toBe('[text here](https://example.com)');
        });

        it('returns empty string unchanged', () => {
            expect(normalizeMultilineMarkdownLinks('')).toBe('');
        });

        it('returns text without markdown links unchanged', () => {
            const plain = 'plain text with no links';
            expect(normalizeMultilineMarkdownLinks(plain)).toBe(plain);
        });

        it('normalizes multiple links in the same text', () => {
            const input = 'First [link\none](https://a.com) and second [link\ntwo](https://b.com)';
            expect(normalizeMultilineMarkdownLinks(input)).toBe('First [link one](https://a.com) and second [link two](https://b.com)');
        });

        it('handles CRLF newlines in link text', () => {
            expect(normalizeMultilineMarkdownLinks('[text\r\nhere](https://example.com)')).toBe('[text here](https://example.com)');
        });
    });
});
