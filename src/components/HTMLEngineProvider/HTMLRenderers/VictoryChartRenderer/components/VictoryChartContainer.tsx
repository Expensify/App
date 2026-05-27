import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import useThemeStyles from '@hooks/useThemeStyles';

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const [containerWidth, setContainerWidth] = useState(0);

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasExplicitDimensions = designWidth !== undefined && designHeight !== undefined;

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    const scale = hasExplicitDimensions && designWidth && containerWidth > 0 ? Math.min(containerWidth / designWidth, 1) : 1;

    const contentStyle = useMemo(() => {
        if (hasExplicitDimensions) {
            return [chartContentStyles, {transform: [{scale}], transformOrigin: 'top left' as const}];
        }
        return [styles.chartContent, chartContentStyles];
    }, [hasExplicitDimensions, chartContentStyles, scale, styles]);

    const containerStyle = useMemo(() => {
        if (hasExplicitDimensions && designHeight) {
            return [styles.chartContainer, chartContainerStyles, {height: designHeight * scale, overflow: 'hidden' as const}];
        }
        return [styles.chartContainer, styles.mw100, chartContainerStyles];
    }, [hasExplicitDimensions, designHeight, scale, styles, chartContainerStyles]);

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
