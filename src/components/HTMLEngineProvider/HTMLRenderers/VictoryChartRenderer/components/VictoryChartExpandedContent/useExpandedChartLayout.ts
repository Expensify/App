import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ExpandedChartLayout} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeExpandedChartLayout';
import computeExpandedChartLayout from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeExpandedChartLayout';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useTheme from '@hooks/useTheme';

import type {Dimensions} from '@src/types/utils/Layout';

import type {ColorValue} from 'react-native';

type ThemedExpandedChartLayout = ExpandedChartLayout & {
    /** Theme-resolved container background parsed from the chart HTML */
    backgroundColor: ColorValue | undefined;

    /** Unscaled container corner radius, for the fluid (design-size) fallback */
    designBorderRadius: number | undefined;
};

/** Reads the chart's design values from context and computes the expanded layout for the available area. */
function useExpandedChartLayout(availableSize: Dimensions): ThemedExpandedChartLayout {
    const theme = useTheme();
    const {chartContentStyles, chartContainerStyles, type} = useVictoryChartContext();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const borderRadius = typeof chartContainerStyles.borderRadius === 'number' ? chartContainerStyles.borderRadius : undefined;

    return {
        ...computeExpandedChartLayout({designWidth, designHeight, borderRadius, isPolar: type === CHART_TYPE.POLAR}, availableSize),
        backgroundColor: resolveChartContainerBgColor(chartContainerStyles.backgroundColor, theme),
        designBorderRadius: borderRadius,
    };
}

export default useExpandedChartLayout;
export type {ThemedExpandedChartLayout};
