import {sortAlphabetically} from '@libs/ListUtils';

describe('ListUtils', () => {
    describe('sortAlphabetically', () => {
        test('sorts strings alphabetically ignoring case', () => {
            const input = ['banana', 'Apple', 'cherry', 'apple'];
            const expected = ['Apple', 'apple', 'banana', 'cherry'];
            expect(sortAlphabetically(input)).toEqual(expected);
        });

        test('returns empty array when given empty array', () => {
            expect(sortAlphabetically([])).toEqual([]);
        });

        test('handles single element array', () => {
            expect(sortAlphabetically(['z'])).toEqual(['z']);
        });

        test('sorts strings with mixed uppercase and lowercase correctly', () => {
            const input = ['b', 'A', 'c', 'a'];
            const expected = ['A', 'a', 'b', 'c'];
            expect(sortAlphabetically(input)).toEqual(expected);
        });

        test('sorts strings with unicode characters correctly', () => {
            const input = ['Éclair', 'eclair', 'Banana', 'banana'];
            const expected = ['Banana', 'banana', 'Éclair', 'eclair'];
            expect(sortAlphabetically(input)).toEqual(expected);
        });
    });
});
