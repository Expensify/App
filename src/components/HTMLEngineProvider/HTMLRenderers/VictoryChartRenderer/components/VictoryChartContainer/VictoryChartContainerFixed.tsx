import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {VictoryChartContainerLayout, VictoryChartContainerThemeStyles} from './types';

type VictoryChartContainerFixedProps = {
    children: React.ReactNode;
    layout: VictoryChartContainerLayout;
    themeStyles?: VictoryChartContainerThemeStyles;
};

function VictoryChartContainerFixed({children, layout, themeStyles}: VictoryChartContainerFixedProps) {
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const {backgroundColor, borderRadius, ...layoutContainerStyles} = chartContainerStyles;
    const layoutKind = layout.kind;
    const fixedWidth = layout.kind === 'fixed' ? layout.width : undefined;
    const fixedHeight = layout.kind === 'fixed' ? layout.height : undefined;
    const scaledDesignHeight = layout.kind === 'scaled' ? layout.designHeight : undefined;
    const scaledScale = layout.kind === 'scaled' ? layout.scale : undefined;

    const containerStyleBase: ViewStyle[] = [themeStyles?.mw100, themeStyles?.container, layoutContainerStyles].filter((style): style is ViewStyle => !!style);
    let containerStyle: ViewStyle[] = containerStyleBase;

    if (layoutKind === 'fixed' && fixedWidth !== undefined && fixedHeight !== undefined) {
        containerStyle = [...containerStyleBase, {width: fixedWidth, height: fixedHeight, borderRadius: 0, overflow: 'hidden'}];
    } else if (layoutKind === 'scaled' && scaledDesignHeight !== undefined && scaledScale !== undefined) {
        containerStyle = [...containerStyleBase, {borderRadius: 0, height: scaledDesignHeight * scaledScale, overflow: 'hidden'}];
    }

    const contentStyle: ViewStyle[] = [];

    if (layoutKind === 'fluid' && themeStyles?.content) {
        contentStyle.push(themeStyles.content);
    }

    contentStyle.push(chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden'});

    if (layoutKind === 'scaled' && scaledScale !== undefined && scaledScale < 1) {
        contentStyle.push({transform: [{scale: scaledScale}], transformOrigin: 'top left'});
    }

    return (
        <View style={containerStyle}>
            <View style={contentStyle}>{children}</View>
        </View>
    );
}

VictoryChartContainerFixed.displayName = 'VictoryChartContainerFixed';

export default VictoryChartContainerFixed;
