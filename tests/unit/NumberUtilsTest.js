const NumberUtils = require('../../src/libs/NumberUtils');

describe('libs/NumberUtils', () => {
    it('should generate a random 64-bit numeric string', () => {
        const id = NumberUtils.rand64();
        expect(Number.isNaN(id));
        // eslint-disable-next-line no-undef
        expect(BigInt(id)).toBeLessThan(BigInt(9223372036854775807));
        // eslint-disable-next-line no-undef
        expect(BigInt(id)).toBeGreaterThan(0);
    });
});

