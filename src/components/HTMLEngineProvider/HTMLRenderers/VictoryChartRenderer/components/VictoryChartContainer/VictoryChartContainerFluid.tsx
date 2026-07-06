import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type VictoryChartContainerFluidProps = {
    children: React.ReactNode;
};

/**
 * Lets the Skia chart re-render at the container's measured width instead of CSS-scaling
 * a fixed design-size canvas. Omits HTML parent maxWidth so the chart can fill wide modals.
 */
function VictoryChartContainerFluid({children}: VictoryChartContainerFluidProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {chartContainerStyles} = useVictoryChartContext();
    const {backgroundColor: rawBgColor, borderRadius, maxWidth: _maxWidth, ...fluidContainerStyles} = chartContainerStyles;
    const backgroundColor = resolveChartContainerBgColor(rawBgColor, theme);

    return <View style={[styles.mw100, styles.chartContainer, fluidContainerStyles, {backgroundColor, borderRadius, overflow: 'hidden'}]}>{children}</View>;
}

VictoryChartContainerFluid.displayName = 'VictoryChartContainerFluid';

export default VictoryChartContainerFluid;
