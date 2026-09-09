import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, getCartesianChartHeight} from '@components/Charts/VictoryTheme';

const TALL_LABEL_HEIGHT = 120;

describe('getCartesianChartHeight', () => {
    it('should hold one height until a measured strip exceeds the floor', () => {
        const floored = getCartesianChartHeight();

        expect(getCartesianChartHeight(0)).toBe(floored);
        expect(getCartesianChartHeight(1)).toBe(floored);
        expect(getCartesianChartHeight(TALL_LABEL_HEIGHT)).toBe(CHART_CONTENT_MIN_HEIGHT + VictoryTheme.axis.labelGap + TALL_LABEL_HEIGHT);
    });
});
