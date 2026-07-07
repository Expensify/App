import getArrayDepth from '@libs/getArrayDepth';

describe('libs/getArrayDepth', () => {
    it('returns 1 for a flat array of numbers', () => {
        expect(getArrayDepth([1, 2, 3])).toBe(1);
    });

    it('returns 1 for a flat array of strings', () => {
        expect(getArrayDepth(['a', 'b', 'c'])).toBe(1);
    });

    it('returns 1 for an empty array', () => {
        expect(getArrayDepth([])).toBe(1);
    });

    it('returns 2 for a 2D array of numbers', () => {
        expect(
            getArrayDepth([
                [1, 2],
                [3, 4],
            ]),
        ).toBe(2);
    });

    it('returns 2 for a 2D array of strings', () => {
        expect(getArrayDepth([['a', 'b'], ['c']])).toBe(2);
    });

    it('returns 2 for a 2D array with empty inner arrays', () => {
        expect(getArrayDepth([[], []])).toBe(2);
    });

    it('returns 3 for a 3D array', () => {
        expect(getArrayDepth([[[1, 2]], [[3]]])).toBe(3);
    });

    it('returns the depth of the deepest branch for a jagged array', () => {
        expect(getArrayDepth([[1, 2], [[3]]] as unknown[])).toBe(3);
    });

    it('returns 1 for a single-element array', () => {
        expect(getArrayDepth([1])).toBe(1);
    });

    it('returns 4 for a 4D array', () => {
        expect(getArrayDepth([[[[1, 2]]]])).toBe(4);
    });

    it('returns the max depth for a deeply jagged array', () => {
        expect(getArrayDepth([1, [2, [3, [4]]]] as unknown[])).toBe(4);
    });

    it('returns 1 for an array of objects', () => {
        expect(getArrayDepth([{}, {a: 1}] as unknown[])).toBe(1);
    });
});
