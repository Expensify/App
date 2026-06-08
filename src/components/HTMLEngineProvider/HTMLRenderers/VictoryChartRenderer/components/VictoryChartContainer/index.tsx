import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import computeChartScale from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeChartScale';
import useThemeStyles from '@hooks/useThemeStyles';

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const [containerWidth, setContainerWidth] = useState(0);

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasExplicitDimensions = designWidth !== undefined && designHeight !== undefined;

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    const scale = hasExplicitDimensions ? computeChartScale(designWidth, containerWidth) : 1;

    const {backgroundColor, borderRadius, ...layoutContainerStyles} = chartContainerStyles;

    const contentStyle = hasExplicitDimensions
        ? [chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden' as const, transform: [{scale}], transformOrigin: 'top left' as const}]
        : [styles.chartContent, chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden' as const}];

    const containerStyle =
        hasExplicitDimensions && designHeight
            ? [styles.chartContainer, styles.mw100, layoutContainerStyles, {borderRadius: 0, height: designHeight * scale, overflow: 'hidden' as const}]
            : [styles.chartContainer, styles.mw100, layoutContainerStyles];

    return (
        <View
            style={containerStyle}
            onLayout={handleLayout}
        >
            <View style={contentStyle}>{children}</View>
        </View>
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
