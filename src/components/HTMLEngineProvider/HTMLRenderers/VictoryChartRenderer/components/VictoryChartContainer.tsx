import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
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

    const contentStyle = useMemo(() => {
        if (hasExplicitDimensions && chartWidth) {
            const scaledHeight = chartWidth * (designHeight / designWidth);
            return [styles.chartContent, chartContentStyles, {width: chartWidth, height: scaledHeight}];
        }
        return [styles.chartContent, styles.mw100, chartContentStyles];
    }, [hasExplicitDimensions, chartWidth, designWidth, designHeight, styles, chartContentStyles]);

    const needsScroll = hasExplicitDimensions && estimatedContainerWidth !== null && chartWidth !== undefined && chartWidth > estimatedContainerWidth;

    const chartContent = <View style={contentStyle}>{children}</View>;

    return (
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
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
