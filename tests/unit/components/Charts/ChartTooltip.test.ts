import {clampRightPlacementTooltipLeft} from '@components/Charts/components/ChartTooltip';

describe('clampRightPlacementTooltipLeft', () => {
    it('uses the anchor x when the tooltip fits within the chart', () => {
        expect(clampRightPlacementTooltipLeft(100, 300, 80)).toBe(100);
    });

    it('clamps to the left edge when the anchor is too close to zero', () => {
        expect(clampRightPlacementTooltipLeft(10, 300, 80)).toBe(10);
        expect(clampRightPlacementTooltipLeft(-20, 300, 80)).toBe(0);
    });

    it('clamps to the right edge when the tooltip would overflow the chart', () => {
        expect(clampRightPlacementTooltipLeft(280, 300, 80)).toBe(220);
    });
});
