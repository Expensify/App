import VictoryChartContainerNative from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/index.native';
import VictoryChartContainerResponsive from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/VictoryChartContainerResponsive';

describe('VictoryChartContainer native', () => {
    it('uses the responsive container so charts scale from measured chat bubble width', () => {
        expect(VictoryChartContainerNative).toBe(VictoryChartContainerResponsive);
    });
});
