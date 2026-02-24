import times from '@src/utils/times';

describe('times', () => {
    it('should create an array of n elements', () => {
        const result = times(3);
        expect(result).toEqual([0, 1, 2]);
    });

    it('should create an array of n elements with values from the function', () => {
        const result = times(3, (i) => i * 2);
        expect(result).toEqual([0, 2, 4]);
    });

    it('should create an empty array if n is 0', () => {
        const result = times(0);
        expect(result).toEqual([]);
    });

    it('should create an array of undefined if no function is provided', () => {
        const result = times(3, () => undefined);
        expect(result).toEqual([undefined, undefined, undefined]);
    });

    it('should create an array of n elements with string values from the function', () => {
        const result = times(3, (i) => `item ${i}`);
        expect(result).toEqual(['item 0', 'item 1', 'item 2']);
    });

    it('should create an array of n elements with constant string value', () => {
        const result = times(3, () => 'constant');
        expect(result).toEqual(['constant', 'constant', 'constant']);
    });
});
