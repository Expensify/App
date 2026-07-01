import {clampRightPlacementTooltipLeft} from '@components/Charts/components/ChartTooltip';
import VictoryTheme from '@components/Charts/VictoryTheme';

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

describe('right-placement tooltip pointer offset', () => {
    it('keeps the pointer on the anchor when the tooltip box is clamped to the right edge', () => {
        const anchorX = 280;
        const chartWidth = 300;
        const tooltipWidth = 80;
        const clampedLeft = clampRightPlacementTooltipLeft(anchorX, chartWidth, tooltipWidth);
        const pointerOffset = anchorX - clampedLeft - VictoryTheme.tooltip.pointerWidth;

        expect(clampedLeft).toBe(220);
        expect(pointerOffset).toBe(60 - VictoryTheme.tooltip.pointerWidth);
    });
});
