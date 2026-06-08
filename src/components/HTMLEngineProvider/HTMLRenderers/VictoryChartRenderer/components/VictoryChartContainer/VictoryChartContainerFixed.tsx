import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ViewStyle} from 'react-native';
import VictoryChartExpandButton from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartExpandButton';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import useThemeStyles from '@hooks/useThemeStyles';
import type {VictoryChartContainerLayout, VictoryChartContainerThemeStyles} from './types';

type VictoryChartContainerFixedProps = {
    children: React.ReactNode;
    layout: VictoryChartContainerLayout;
    themeStyles?: VictoryChartContainerThemeStyles;
    onExpandPress?: () => void;
};

function VictoryChartContainerFixed({children, layout, themeStyles, onExpandPress}: VictoryChartContainerFixedProps) {
    const styles = useThemeStyles();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const {backgroundColor, borderRadius, ...layoutContainerStyles} = chartContainerStyles;
    const layoutKind = layout.kind;
    const fixedWidth = layout.kind === 'fixed' ? layout.width : undefined;
    const fixedHeight = layout.kind === 'fixed' ? layout.height : undefined;
    const scaledDesignHeight = layout.kind === 'scaled' ? layout.designHeight : undefined;
    const scaledScale = layout.kind === 'scaled' ? layout.scale : undefined;
    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;

    const shellStyleBase: ViewStyle[] = [themeStyles?.mw100, themeStyles?.container, layoutContainerStyles, styles.pRelative].filter((style): style is ViewStyle => !!style);
    let shellStyle: ViewStyle[] = shellStyleBase;

    if (layoutKind === 'fixed' && fixedWidth !== undefined && fixedHeight !== undefined) {
        shellStyle = [...shellStyleBase, {width: fixedWidth, height: fixedHeight, borderRadius: 0}];
    } else if (layoutKind === 'scaled' && scaledDesignHeight !== undefined && scaledScale !== undefined) {
        shellStyle = [
            ...shellStyleBase,
            {
                borderRadius: 0,
                width: designWidth !== undefined ? designWidth * scaledScale : undefined,
                height: scaledDesignHeight * scaledScale,
                alignSelf: 'flex-start',
            },
        ];
    }

    const contentStyle: ViewStyle[] = [];

    if (layoutKind === 'fluid' && themeStyles?.content) {
        contentStyle.push(themeStyles.content);
    }

    contentStyle.push(chartContentStyles, {backgroundColor, borderRadius, overflow: 'hidden'});

    if (layoutKind === 'scaled' && scaledScale !== undefined && scaledScale !== 1) {
        contentStyle.push({transform: [{scale: scaledScale}], transformOrigin: 'top left'});
    }

    const clipStyle: ViewStyle =
        layoutKind === 'fluid'
            ? {overflow: 'hidden'}
            : {
                  ...StyleSheet.absoluteFillObject,
                  overflow: 'hidden',
              };

    return (
        <View style={shellStyle}>
            <View style={clipStyle}>
                <View style={contentStyle}>{children}</View>
            </View>
            {onExpandPress && <VictoryChartExpandButton onPress={onExpandPress} />}
        </View>
    );
}

VictoryChartContainerFixed.displayName = 'VictoryChartContainerFixed';

export default VictoryChartContainerFixed;
