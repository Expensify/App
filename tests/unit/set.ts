import set from '@src/utils/set';

describe('set', () => {
    it('should set the value at path of object', () => {
        const obj = {a: {b: 2}};
        set(obj, 'a.b', 3);
        expect(obj.a.b).toBe(3);
    });

    it('should set the value at path of object (array path)', () => {
        const obj = {a: {b: 2}};
        set(obj, ['a', 'b'], 3);
        expect(obj.a.b).toBe(3);
    });

    it('should create nested properties if they do not exist', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {a: {}};
        set(obj, 'a.b.c', 3);
        expect(obj.a.b.c).toBe(3);
    });

    it('should handle root-level properties', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {a: 1};
        set(obj, 'b', 2);
        expect(obj.b).toBe(2);
    });
});
