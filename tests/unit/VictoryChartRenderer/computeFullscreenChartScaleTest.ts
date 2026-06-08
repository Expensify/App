import computeFullscreenChartScale from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeFullscreenChartScale';

describe('computeFullscreenChartScale', () => {
    it('returns 1 when designWidth is undefined', () => {
        expect(computeFullscreenChartScale(undefined, 400)).toBe(1);
    });

    it('returns 1 when availableWidth is zero', () => {
        expect(computeFullscreenChartScale(800, 0)).toBe(1);
    });

    it('scales down when available width is smaller than design width', () => {
        expect(computeFullscreenChartScale(800, 400)).toBe(0.5);
    });

    it('scales up when available width is larger than design width', () => {
        expect(computeFullscreenChartScale(400, 800)).toBe(2);
    });

    it('returns 1 when available width matches design width', () => {
        expect(computeFullscreenChartScale(600, 600)).toBe(1);
    });
});
