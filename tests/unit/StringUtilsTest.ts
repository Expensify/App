import StringUtils from '@libs/StringUtils';

describe('StringUtils', () => {
    describe('getAcronym', () => {
        it('should return the acronym of a string with multiple words', () => {
            const acronym = StringUtils.getAcronym('Hello World');
            expect(acronym).toBe('HW');
        });

        it('should return an acronym of a string with a single word', () => {
            const acronym = StringUtils.getAcronym('Hello');
            expect(acronym).toBe('H');
        });

        it('should return an acronym of a string when word in a string has a hyphen', () => {
            const acronym = StringUtils.getAcronym('Hello Every-One');
            expect(acronym).toBe('HEO');
        });
    });

    describe('sanitizeTrailingNewline', () => {
        test('Test trailing newline replacement', () => {
            const text = 'Test string.\r\n';
            const sanitizedText = 'Test string.';
            expect(StringUtils.sanitizeTrailingNewline(text)).toBe(sanitizedText);
        });

        test('Test leading and trailing newline replacement with multiline text', () => {
            const text = '\r\nTest\r\nstring.\r\n';
            const sanitizedText = 'Test\r\nstring.';
            expect(StringUtils.sanitizeTrailingNewline(text)).toBe(sanitizedText);
        });
    })
});
