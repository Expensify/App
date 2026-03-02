import getImageRecyclingKey from '../../src/libs/getImageRecyclingKey';

describe('getImageRecyclingKey', () => {
    test('returns undefined for undefined source', () => {
        expect(getImageRecyclingKey(undefined)).toBeUndefined();
    });

    test('returns stringified number for numeric source', () => {
        expect(getImageRecyclingKey(42)).toBe('42');
    });

    test('returns URI from object source with uri property', () => {
        expect(getImageRecyclingKey({uri: 'https://example.com/image.png'})).toBe('https://example.com/image.png');
    });

    test('returns URI from first element of array source', () => {
        const source = [{uri: 'https://example.com/first.png'}, {uri: 'https://example.com/second.png'}];
        expect(getImageRecyclingKey(source)).toBe('https://example.com/first.png');
    });

    test('returns undefined for empty array', () => {
        expect(getImageRecyclingKey([])).toBeUndefined();
    });

    test('returns JSON string for object source with other properties but no uri', () => {
        const source = {headers: {Authorization: 'Bearer token'}};
        expect(getImageRecyclingKey(source)).toBe(JSON.stringify(source));
    });
});
