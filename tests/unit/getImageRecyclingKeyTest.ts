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

    test('ignores the URI fragment so a forced reload of the same file keeps the key', () => {
        // Given a local receipt that was upgraded in place, so its URI only gains a fragment to force a reload
        const original = {uri: 'file:///receipts/receipt.jpg'};
        const upgraded = {uri: 'file:///receipts/receipt.jpg#upgraded1'};

        // When both sources are turned into recycling keys
        // Then the keys match, so expo-image keeps showing the old image instead of blanking the view while the new one decodes
        expect(getImageRecyclingKey(upgraded)).toBe(getImageRecyclingKey(original));
        expect(getImageRecyclingKey(upgraded)).toBe('file:///receipts/receipt.jpg');
    });

    test('keeps a data URI whole because a raw # in it is part of the content', () => {
        // Given an inline SVG whose colors use unencoded # characters
        const source = {uri: 'data:image/svg+xml;utf8,<svg fill="#fff"></svg>'};

        // When the source is turned into a recycling key
        // Then nothing is cut off, so two different SVGs never share a key
        expect(getImageRecyclingKey(source)).toBe(source.uri);
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
