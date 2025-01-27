import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {Unit} from '@src/types/onyx/Policy';

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(),
}));

describe('DistanceRequestUtils', () => {
    describe('getDistanceRequestAmount', () => {
        test.each([
            [350, 8605.146, 'mi', 65.5],
            [561, 8605.146, 'km', 65.1],
        ] as const)('Correctly calculates amount %s for %s%s at a rate of %s per unit', (expectedResult: number, distance: number, unit: Unit, rate: number) => {
            expect(DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate)).toBe(expectedResult);
        });
    });
});
