import generateAndroidVersionCode from '../../.github/libs/generateAndroidVersionCode';

describe('generateAndroidVersionCode', () => {
    it('should produce a 12-digit version code', () => {
        test.each([
            ['1.0.1', '001000001000'],
            ['1.0.1-444', '001000001444'],
            ['10.11.12-345', '010011012345'],
            ['0.0.1-1', '000000001001'],
            ['100.999.666-888', '100999666888'],
        ])('generateAndroidVersionCode(%s) – %s', (input, expected) => {
            expect(generateAndroidVersionCode(input)).toBe(expected);
        });
    });
});
