import getStyledTextArray from '../../src/libs/GetStyledTextArray';

describe('getStyledTextArray', () => {
    test('returns an array with a single object with isColored true when prefix matches entire name', () => {
        const result = getStyledTextArray('sm', 'sm');
        expect(result).toEqual([{text: 'sm', isColored: true}]);
    });

    test('returns an array with two objects, the first with isColored true, when prefix matches the beginning of name', () => {
        const result = getStyledTextArray('smile', 'sm');
        expect(result).toEqual([
            {text: 'sm', isColored: true},
            {text: 'ile', isColored: false},
        ]);
    });

    test('returns an array with three objects, the second with isColored true, when prefix matches in the middle of name', () => {
        const result = getStyledTextArray('smile', 'il');
        expect(result).toEqual([
            {text: 'sm', isColored: false},
            {text: 'il', isColored: true},
            {text: 'e', isColored: false},
        ]);
    });
});
