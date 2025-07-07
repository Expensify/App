"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NumberUtils = require("../../src/libs/NumberUtils");
describe('libs/NumberUtils', function () {
    it('should generate a random 64-bit numeric string', function () {
        var id = NumberUtils.rand64();
        expect(typeof id).toBe('string');
        // eslint-disable-next-line no-undef
        expect(BigInt(id)).toBeLessThanOrEqual(BigInt('9223372036854775807'));
        // eslint-disable-next-line no-undef
        expect(BigInt(id)).toBeGreaterThanOrEqual(0);
    });
});
