import React from 'react';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import computeChartScale from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeChartScale';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

// Horizontal space consumed by chat message padding, avatar, and margins (excluding safe area insets).
// Used instead of onLayout because Yoga inflates the container width to match the fixed-width chart child.
const CHAT_MESSAGE_HORIZONTAL_PADDING = 92;

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const {windowWidth} = useWindowDimensions();
    const {left: safeAreaLeft, right: safeAreaRight} = useSafeAreaInsets();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasExplicitDimensions = designWidth !== undefined && designHeight !== undefined;

    const availableWidth = windowWidth - safeAreaLeft - safeAreaRight - CHAT_MESSAGE_HORIZONTAL_PADDING;
    const scale = hasExplicitDimensions ? computeChartScale(designWidth, availableWidth) : 1;

    const {backgroundColor: rawBgColor, borderRadius, ...layoutContainerStyles} = chartContainerStyles;
    const backgroundColor = resolveChartThemeColor(typeof rawBgColor === 'string' ? rawBgColor : undefined, theme) ?? rawBgColor;

    const contentStyle = hasExplicitDimensions
        ? [chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden' as const, transform: [{scale}], transformOrigin: 'top left' as const}]
        : [styles.chartContent, chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden' as const}];

    const containerStyle =
        hasExplicitDimensions && designHeight && designWidth
            ? [{width: designWidth * scale, height: designHeight * scale, alignSelf: 'flex-start' as const, overflow: 'hidden' as const}]
            : [styles.chartContainer, styles.mw100, layoutContainerStyles];

    return (
        <View style={containerStyle}>
            <View style={contentStyle}>{children}</View>
        </View>
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
