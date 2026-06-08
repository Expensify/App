import {getGroupedBarCenterY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getBarGroupSeriesLayout';

describe('getGroupedBarCenterY', () => {
    it('offsets each grouped series above and below the shared category center', () => {
        const groupLayout = {
            seriesIndex: 0,
            groupSize: 2,
            barWidth: 16,
            offset: 18,
        };
        const secondSeriesLayout = {
            ...groupLayout,
            seriesIndex: 1,
        };

        expect(getGroupedBarCenterY(200, groupLayout)).toBe(183);
        expect(getGroupedBarCenterY(200, secondSeriesLayout)).toBe(217);
    });
});
