import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

const MIN_CHART_WIDTH = 500;

type LayoutSnapshot = {
    containerWidth: number;
    windowWidth: number;
};

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const [layoutSnapshot, setLayoutSnapshot] = useState<LayoutSnapshot | null>(null);
    const {windowWidth} = useWindowDimensions();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasExplicitDimensions = designWidth !== undefined && designHeight !== undefined;

    const handleContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
            setLayoutSnapshot({containerWidth: event.nativeEvent.layout.width, windowWidth});
        },
        [windowWidth],
    );

    // When the window grows, react-native-render-html may cache the parent at
    // a stale (smaller) width so onLayout never fires with the new size. We
    // estimate the real available width by keeping the sidebar+margin offset
    // constant and applying the window-width delta.
    const availableWidth = useMemo(() => {
        if (!layoutSnapshot) {
            return 0;
        }
        if (windowWidth === layoutSnapshot.windowWidth) {
            return layoutSnapshot.containerWidth;
        }
        const offset = layoutSnapshot.windowWidth - layoutSnapshot.containerWidth;
        return Math.max(windowWidth - offset, 0);
    }, [windowWidth, layoutSnapshot]);

    const chartWidth = useMemo(() => {
        if (!hasExplicitDimensions || !designWidth || availableWidth <= 0) {
            return undefined;
        }
        return Math.max(Math.min(availableWidth, designWidth), Math.min(MIN_CHART_WIDTH, designWidth));
    }, [hasExplicitDimensions, availableWidth, designWidth]);

    const contentStyle = useMemo(() => {
        if (hasExplicitDimensions && chartWidth) {
            const {width: ignoredWidth, height: ignoredHeight, ...otherContentStyles} = chartContentStyles;
            return [otherContentStyles, {width: chartWidth, aspectRatio: designWidth / designHeight}];
        }
        return [styles.chartContent, styles.mw100, chartContentStyles];
    }, [hasExplicitDimensions, chartWidth, designWidth, designHeight, styles, chartContentStyles]);

    // Use the measured container width for scroll decisions so we don't add
    // a scrollbar when the estimated available width is larger but the actual
    // DOM parent hasn't expanded yet.
    const measuredWidth = layoutSnapshot?.containerWidth ?? 0;
    const needsScroll = hasExplicitDimensions && chartWidth !== undefined && measuredWidth > 0 && chartWidth > measuredWidth;

    const chartContent = <View style={contentStyle}>{children}</View>;

    // When the estimated available width exceeds the measured container width
    // (window grew but parent is cached), set an explicit width on the
    // container so the chart can expand beyond the stale parent.
    const containerWidthOverride = hasExplicitDimensions && availableWidth > measuredWidth && measuredWidth > 0 ? {width: availableWidth} : undefined;

    return (
        <View
            style={[styles.chartContainer, styles.mw100, chartContainerStyles, containerWidthOverride]}
            onLayout={handleContainerLayout}
        >
            {needsScroll ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    nestedScrollEnabled
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
