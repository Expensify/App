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
});
