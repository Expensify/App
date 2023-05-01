import StringUtils from '../../src/libs/StringUtils';

describe('StringUtils', () => {
    describe('arrayToSpokenList', () => {
        test.each([
            [[], ''],
            [['rory'], 'rory'],
            [['rory', 'vit'], 'rory and vit'],
            [['rory', 'vit', 'jules'], 'rory, vit, and jules'],
        ])('arrayToSpokenList(%s)', (input, expectedOutput) => {
            expect(StringUtils.arrayToSpokenList(input)).toBe(expectedOutput);
        });
    });
});
