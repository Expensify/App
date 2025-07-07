"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CategoryUtils_1 = require("@libs/CategoryUtils");
describe("isMissingCategory", function () {
    it('returns true if category is undefined', function () {
        expect((0, CategoryUtils_1.isCategoryMissing)(undefined)).toBe(true);
    });
    it('returns true if category is an empty string', function () {
        expect((0, CategoryUtils_1.isCategoryMissing)('')).toBe(true);
    });
    it('returns true if category "none" or "Uncategorized"', function () {
        expect((0, CategoryUtils_1.isCategoryMissing)('none')).toBe(true);
        expect((0, CategoryUtils_1.isCategoryMissing)('Uncategorized')).toBe(true);
    });
    it('returns false if category is a valid string', function () {
        expect((0, CategoryUtils_1.isCategoryMissing)('Travel')).toBe(false);
        expect((0, CategoryUtils_1.isCategoryMissing)('Meals')).toBe(false);
    });
});
