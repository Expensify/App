const NumberUtils = require('../../src/libs/NumberUtils');

const result = NumberUtils.rand64();

const max64 = 9223372036854775807;

describe('libs/NumberUtils', () => {
    it('should generate a random 64-bit numeric string', () => {
        const id = NumberUtils.rand64();
        expect(isNaN(result)).toBe(false);
        expect(result > max64).toBe(false);
    });
});

