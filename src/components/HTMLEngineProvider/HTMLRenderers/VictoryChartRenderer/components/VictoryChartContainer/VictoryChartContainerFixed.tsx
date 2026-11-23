import {CHART_TYPE, POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext, VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import scalePixels from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scalePixels';

import useTheme from '@hooks/useTheme';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {VictoryChartContainerLayout, VictoryChartContainerThemeStyles} from './types';

type VictoryChartContainerFixedProps = {
    children: React.ReactNode;
    layout: VictoryChartContainerLayout;
    themeStyles?: VictoryChartContainerThemeStyles;
};

function VictoryChartContainerFixed({children, layout, themeStyles}: VictoryChartContainerFixedProps) {
    const {chartContentStyles, chartContainerStyles, type} = useVictoryChartContext();
    const theme = useTheme();
    const {backgroundColor: rawBgColor, borderRadius, ...layoutContainerStyles} = chartContainerStyles;
    const backgroundColor = resolveChartContainerBgColor(rawBgColor, theme);
    const layoutKind = layout.kind;
    const fixedWidth = layout.kind === 'fixed' ? layout.width : undefined;
    const fixedHeight = layout.kind === 'fixed' ? layout.height : undefined;
    const scaledDesignWidth = layout.kind === 'scaled' ? layout.designWidth : undefined;
    const scaledDesignHeight = layout.kind === 'scaled' ? layout.designHeight : undefined;
    const scaledScale = layout.kind === 'scaled' ? layout.scale : undefined;
    const isPolar = type === CHART_TYPE.POLAR;

    const containerStyleBase: ViewStyle[] = [themeStyles?.mw100, themeStyles?.container, layoutContainerStyles].filter((style): style is ViewStyle => !!style);
    let containerStyle: ViewStyle[] = containerStyleBase;

    if (layoutKind === 'fixed' && fixedWidth !== undefined && fixedHeight !== undefined) {
        containerStyle = [...containerStyleBase, {width: fixedWidth, height: fixedHeight, borderRadius: 0, overflow: 'hidden'}];
    } else if (layoutKind === 'scaled' && scaledDesignWidth !== undefined && scaledDesignHeight !== undefined && scaledScale !== undefined) {
        const effectiveHeight = isPolar ? scaledDesignHeight * POLAR_CONTAINER_HEIGHT_RATIO : scaledDesignHeight;
        containerStyle = [
            ...containerStyleBase,
            {borderRadius: isPolar ? borderRadius : 0, width: scaledDesignWidth * scaledScale, height: effectiveHeight * scaledScale, overflow: 'hidden'},
        ];
    }

    const contentStyle: ViewStyle[] = [];

    if (layoutKind === 'fluid' && themeStyles?.content) {
        contentStyle.push(themeStyles.content);
    }

    contentStyle.push(chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden'});

    // A chart wider than its column is rendered at the fitted size, with every pixel value of its config scaled,
    // instead of being drawn at the design size and shrunk with a CSS transform. Skia sizes its canvas from the
    // layout size, which a transform does not change, so the browser would resample the drawing and blur its text.
    const fittedScale = layoutKind === 'scaled' && scaledScale !== undefined && scaledScale < 1 ? scaledScale : 1;

    if (fittedScale < 1 && scaledDesignWidth !== undefined && scaledDesignHeight !== undefined) {
        contentStyle.push({
            width: scaledDesignWidth * fittedScale,
            height: scaledDesignHeight * fittedScale,
            borderRadius: typeof borderRadius === 'number' ? scalePixels(borderRadius, fittedScale) : borderRadius,
        });
    }

    return (
        <View style={containerStyle}>
            <VictoryChartScaledProvider scale={fittedScale}>
                <View style={contentStyle}>{children}</View>
            </VictoryChartScaledProvider>
        </View>
    );
}

VictoryChartContainerFixed.displayName = 'VictoryChartContainerFixed';

export default VictoryChartContainerFixed;
