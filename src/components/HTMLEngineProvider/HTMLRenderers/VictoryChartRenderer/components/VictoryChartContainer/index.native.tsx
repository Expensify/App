import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

const NATIVE_HORIZONTAL_INSET = 92;

function VictoryChartContainer({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const {windowWidth} = useWindowDimensions();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasExplicitDimensions = designWidth !== undefined && designHeight !== undefined;

    const availableWidth = windowWidth - NATIVE_HORIZONTAL_INSET;
    const scale = hasExplicitDimensions && designWidth && availableWidth > 0 ? Math.min(availableWidth / designWidth, 1) : 1;

    const {backgroundColor, borderRadius, width: containerWidth, maxWidth: containerMaxWidth, ...cleanContainerStyles} = chartContainerStyles;

    const contentStyle = useMemo(() => {
        if (hasExplicitDimensions) {
            return [chartContentStyles, {overflow: 'hidden' as const, transform: [{scale}], transformOrigin: 'top left' as const}];
        }
        return [styles.chartContent, chartContentStyles, {overflow: 'hidden' as const}];
    }, [hasExplicitDimensions, chartContentStyles, scale, styles]);

    const containerStyle = useMemo(() => {
        if (hasExplicitDimensions && designHeight && designWidth) {
            return [
                cleanContainerStyles,
                {backgroundColor, borderRadius, width: designWidth * scale, height: designHeight * scale, alignSelf: 'flex-start' as const, overflow: 'hidden' as const},
            ];
        }
        return [styles.chartContainer, styles.mw100, chartContainerStyles];
    }, [hasExplicitDimensions, designHeight, designWidth, scale, styles, cleanContainerStyles, chartContainerStyles, backgroundColor, borderRadius]);

    return (
        <View style={containerStyle}>
            <View style={contentStyle}>{children}</View>
        </View>
    );
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
