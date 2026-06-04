import Parser from '@libs/Parser';

describe('Parser', () => {
    describe('isHTML', () => {
        test('returns true for strings containing HTML tags', () => {
            expect(Parser.isHTML('<b>bold</b>')).toBe(true);
            expect(Parser.isHTML('<a href="https://example.com">link</a>')).toBe(true);
            expect(Parser.isHTML('<h1>heading</h1>')).toBe(true);
            expect(Parser.isHTML('text with <em>emphasis</em> inside')).toBe(true);
            expect(Parser.isHTML('<br/>')).toBe(true);
            expect(Parser.isHTML('<p>paragraph</p>')).toBe(true);
        });

        test('returns false for plain text', () => {
            expect(Parser.isHTML('just plain text')).toBe(false);
            expect(Parser.isHTML('Fix the login bug')).toBe(false);
            expect(Parser.isHTML('')).toBe(false);
            expect(Parser.isHTML('100 > 50 and 20 < 30')).toBe(false);
        });

        test('returns false for strings with angle brackets that are not HTML', () => {
            expect(Parser.isHTML('a > b')).toBe(false);
            expect(Parser.isHTML('x < y')).toBe(false);
            expect(Parser.isHTML('<>')).toBe(false);
        });
    });

    describe('htmlToMarkdown', () => {
        // These cases pin the contract relied on by DescriptionField.tsx, where the description of a saved
        // transaction is stored as HTML (because `getParsedComment()` runs ExpensiMark at save time) and must
        // be normalized back to markdown before being handed to the `shouldParseTitle` MenuItem and the
        // `type="markdown"` TextInput. Without this normalization, the Split details page renders raw `<a>`
        // tags as visible text — see https://github.com/Expensify/App/issues/87519.
        test('converts an autolinked URL anchor back to a markdown link', () => {
            expect(Parser.htmlToMarkdown('<a href="https://google.com" target="_blank" rel="noreferrer noopener">google.com</a>')).toBe('[google.com](https://google.com)');
        });

        test('converts ExpensiMark-emitted bold tags back to markdown asterisks', () => {
            expect(Parser.htmlToMarkdown('<strong>hello</strong> world')).toBe('*hello* world');
        });

        test('is a no-op for plain text descriptions used by draft transactions', () => {
            expect(Parser.htmlToMarkdown('lunch')).toBe('lunch');
            expect(Parser.htmlToMarkdown('google.com')).toBe('google.com');
        });

        test('returns an empty string for an empty input', () => {
            expect(Parser.htmlToMarkdown('')).toBe('');
        });
    });
});
