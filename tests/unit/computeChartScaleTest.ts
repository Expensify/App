import computeChartScale from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeChartScale';

describe('computeChartScale', () => {
    it('returns 1 when designWidth is undefined', () => {
        expect(computeChartScale(undefined, 400)).toBe(1);
    });

    it('returns 1 when designWidth is 0', () => {
        expect(computeChartScale(0, 400)).toBe(1);
    });

    it('returns 1 when availableWidth is 0', () => {
        expect(computeChartScale(680, 0)).toBe(1);
    });

    it('returns 1 when availableWidth is negative', () => {
        expect(computeChartScale(680, -100)).toBe(1);
    });

    it('scales down when availableWidth is smaller than designWidth', () => {
        expect(computeChartScale(680, 340)).toBe(0.5);
    });

    it('caps at 1 when availableWidth is larger than designWidth', () => {
        expect(computeChartScale(680, 1000)).toBe(1);
    });

    it('returns 1 when availableWidth equals designWidth', () => {
        expect(computeChartScale(680, 680)).toBe(1);
    });

    it('computes correct fractional scale', () => {
        expect(computeChartScale(680, 510)).toBeCloseTo(0.75);
    });
});
