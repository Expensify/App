import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {DEFAULT_SCALE, VictoryChartScaleContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
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

    const containerScale = useMemo(() => {
        if (!hasExplicitDimensions || !designWidth || containerWidth <= 0) {
            return DEFAULT_SCALE;
        }
        const s = Math.min(containerWidth / designWidth, 1);
        return {x: s, y: s};
    }, [hasExplicitDimensions, designWidth, containerWidth]);

    const contentStyle = useMemo(() => {
        if (hasExplicitDimensions && designWidth && designHeight) {
            const {width: ignoredWidth, height: ignoredHeight, ...otherContentStyles} = chartContentStyles;
            return [otherContentStyles, {aspectRatio: designWidth / designHeight}];
        }
        return [styles.chartContent, chartContentStyles];
    }, [hasExplicitDimensions, designWidth, designHeight, styles, chartContentStyles]);

    return (
        <View
            style={[styles.chartContainer, styles.flex1, chartContainerStyles]}
            onLayout={handleLayout}
        >
            <VictoryChartScaleContext.Provider value={containerScale}>
                <View style={contentStyle}>{children}</View>
            </VictoryChartScaleContext.Provider>
        </View>
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
