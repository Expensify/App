import get from '@src/utils/get';

describe('get', () => {
    it('should return the value at path of object', () => {
        const obj = {a: {b: 2}};
        expect(get(obj, 'a.b', 0)).toBe(2);
        expect(get(obj, ['a', 'b'], 0)).toBe(2);
    });

    it('should return undefined if path does not exist', () => {
        const obj = {a: {b: 2}};
        expect(get(obj, 'a.c')).toBeUndefined();
        expect(get(obj, ['a', 'c'])).toBeUndefined();
    });

    it('should return default value if path does not exist', () => {
        const obj = {a: {b: 2}};
        expect(get(obj, 'a.c', 3)).toBe(3);
        expect(get(obj, ['a', 'c'], 3)).toBe(3);
    });

    it('should return undefined if path is not defined or it has false value', () => {
        const obj = {a: {b: 2}};
        expect(get(obj, '', 3)).toBeUndefined();
        expect(get(obj, [], 3)).toBeUndefined();
    });
});
