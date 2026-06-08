import type {ViewStyle} from 'react-native';

type ChartExplicitSize = {width: number; height: number};

/**
 * Resolves the chart's design width for overlay layout (e.g. legend centering).
 * Prefers the headless canvas size when provided so overlays match victory-native's coordinate space.
 */
function getChartDesignWidth(explicitSize: ChartExplicitSize | undefined, chartContentWidth: ViewStyle['width']): number | undefined {
    if (explicitSize?.width !== undefined) {
        return explicitSize.width;
    }

    return typeof chartContentWidth === 'number' ? chartContentWidth : undefined;
}

export default getChartDesignWidth;
