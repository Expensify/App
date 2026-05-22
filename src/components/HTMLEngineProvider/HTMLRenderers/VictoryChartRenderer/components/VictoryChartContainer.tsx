import React from 'react';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import useThemeStyles from '@hooks/useThemeStyles';

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    return (
        <View style={[styles.chartContainer, styles.flex1, chartContainerStyles]}>
            <View style={[styles.chartContent, chartContentStyles]}>{children}</View>
        </View>
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
