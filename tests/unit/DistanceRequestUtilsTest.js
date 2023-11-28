import DistanceRequestUtils from '../../src/libs/DistanceRequestUtils';

describe('DistanceRequestUtils', () => {
    describe('getDistanceRequestAmount', () => {
        test.each([
            [350, 8605.146, 'mi', 65.5],
            [561, 8605.146, 'km', 65.1],
        ])('Correctly calculates amount %s for %s%s at a rate of %s per unit', (expectedResult, distance, unit, rate) => {
            expect(DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate)).toBe(expectedResult);
        });
    });
});
