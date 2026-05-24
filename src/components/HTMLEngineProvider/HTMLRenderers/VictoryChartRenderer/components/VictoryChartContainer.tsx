import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {DEFAULT_SCALE, VictoryChartScaleContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

const MIN_CHART_WIDTH = 500;

type InitialMeasurement = {
    containerWidth: number;
    windowWidth: number;
};

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const [scale, setScale] = useState(DEFAULT_SCALE);
    const [initialMeasurement, setInitialMeasurement] = useState<InitialMeasurement | null>(null);
    const {windowWidth} = useWindowDimensions();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasExplicitDimensions = designWidth !== undefined && designHeight !== undefined;

    const handleContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const w = event.nativeEvent.layout.width;
            setInitialMeasurement({containerWidth: w, windowWidth});
        },
        [windowWidth],
    );

    const estimatedContainerWidth = useMemo(() => {
        if (!initialMeasurement) {
            return null;
        }
        const ratio = initialMeasurement.containerWidth / initialMeasurement.windowWidth;
        return Math.round(windowWidth * ratio);
    }, [windowWidth, initialMeasurement]);

    const chartWidth = useMemo(() => {
        if (!hasExplicitDimensions || estimatedContainerWidth === null) {
            return designWidth;
        }
        return Math.max(Math.min(estimatedContainerWidth, designWidth), Math.min(MIN_CHART_WIDTH, designWidth));
    }, [hasExplicitDimensions, estimatedContainerWidth, designWidth]);

    const handleContentLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const {width: actualWidth, height: actualHeight} = event.nativeEvent.layout;
            if (designWidth && designHeight && actualWidth > 0 && actualHeight > 0) {
                setScale({
                    x: Math.min(actualWidth / designWidth, 1),
                    y: Math.min(actualHeight / designHeight, 1),
                });
            }
        },
        [designWidth, designHeight],
    );

    const contentStyle = useMemo(
        () => (hasExplicitDimensions && chartWidth ? [{width: chartWidth, aspectRatio: designWidth / designHeight}] : [styles.chartContent, styles.mw100, chartContentStyles]),
        [hasExplicitDimensions, chartWidth, designWidth, designHeight, styles, chartContentStyles],
    );

    const needsScroll = hasExplicitDimensions && estimatedContainerWidth !== null && chartWidth !== undefined && chartWidth > estimatedContainerWidth;

    const chartContent = (
        <View
            style={contentStyle}
            onLayout={hasExplicitDimensions ? handleContentLayout : undefined}
        >
            {children}
        </View>
    );

    return (
        <VictoryChartScaleContext.Provider value={scale}>
            <View
                style={[styles.chartContainer, styles.w100, chartContainerStyles]}
                onLayout={handleContainerLayout}
            >
                {needsScroll ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {chartContent}
                    </ScrollView>
                ) : (
                    chartContent
                )}
            </View>
        </VictoryChartScaleContext.Provider>
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
