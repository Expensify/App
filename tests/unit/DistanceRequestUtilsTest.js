"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
describe('DistanceRequestUtils', function () {
    describe('getDistanceRequestAmount', function () {
        test.each([
            [350, 8605.146, 'mi', 65.5],
            [561, 8605.146, 'km', 65.1],
        ])('Correctly calculates amount %s for %s%s at a rate of %s per unit', function (expectedResult, distance, unit, rate) {
            expect(DistanceRequestUtils_1.default.getDistanceRequestAmount(distance, unit, rate)).toBe(expectedResult);
        });
    });
});
