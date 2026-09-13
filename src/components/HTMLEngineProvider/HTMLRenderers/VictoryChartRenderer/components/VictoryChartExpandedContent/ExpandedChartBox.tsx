import VictoryChartContent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContent';
import {VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ExpandedChartBoxProps = {
    /** Rendered chart width in pixels */
    width: number;

    /** Rendered chart height in pixels (full design canvas) */
    height: number;

    /** Visible height — smaller than `height` for polar charts, whose dead bottom space is clipped */
    clippedHeight: number;

    /** Factor the chart's pixel-space config is scaled by for this render size */
    providerScale: number;

    /** Container background, theme-resolved */
    backgroundColor: ColorValue | undefined;

    /** Container corner radius, already scaled to the render size */
    borderRadius: number | undefined;

    /** Whether the chart is polar — its clip box keeps the rounded corners */
    isPolar: boolean;
};

/** The chart card rendered natively at the given size. */
function ExpandedChartBox({width, height, clippedHeight, providerScale, backgroundColor, borderRadius, isPolar}: ExpandedChartBoxProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View
            style={[StyleUtils.getWidthAndHeightStyle(width, clippedHeight), borderRadius !== undefined && isPolar && StyleUtils.getBorderRadiusStyle(borderRadius), styles.overflowHidden]}
        >
            <View
                style={[
                    StyleUtils.getWidthAndHeightStyle(width, height),
                    backgroundColor !== undefined && StyleUtils.getBackgroundColorStyle(backgroundColor),
                    borderRadius !== undefined && StyleUtils.getBorderRadiusStyle(borderRadius),
                    styles.overflowHidden,
                ]}
            >
                <VictoryChartScaledProvider scale={providerScale}>
                    <VictoryChartContent
                        explicitSize={{width, height}}
                        headless={false}
                        shouldUseStaticCanvas
                    />
                </VictoryChartScaledProvider>
            </View>
        </View>
    );
}

ExpandedChartBox.displayName = 'ExpandedChartBox';

export default ExpandedChartBox;
