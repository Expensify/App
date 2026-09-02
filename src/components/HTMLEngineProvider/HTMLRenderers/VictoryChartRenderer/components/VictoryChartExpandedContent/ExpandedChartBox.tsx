import VictoryChartContent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContent';
import {VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import scalePixels from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scalePixels';

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

    /** Visible height in pixels — smaller than `height` for polar charts, whose dead bottom space is clipped */
    clippedHeight: number;

    /** Uniform factor the chart's pixel-space config is scaled by for this render size */
    providerScale: number;

    /** Theme-resolved container background parsed from the chart HTML */
    backgroundColor: ColorValue | undefined;

    /** Container corner radius parsed from the chart HTML, in design-space pixels */
    borderRadius: number | undefined;

    /** Whether the chart is polar — its clip container keeps the rounded corners */
    isPolar: boolean;
};

/**
 * The expanded chart rendered natively at the given size: an outer clip box (hides polar dead
 * space), an inner card with the chart's themed background/rounding, and the chart itself
 * re-rendered through VictoryChartScaledProvider so every pixel-space value matches the size.
 */
function ExpandedChartBox({width, height, clippedHeight, providerScale, backgroundColor, borderRadius, isPolar}: ExpandedChartBoxProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // The parsed radius is in design-space pixels; scale it to the render size so the card keeps
    // the same proportions as the inline chart (which scales its whole box).
    const scaledBorderRadius = scalePixels(borderRadius, providerScale);

    return (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(width, clippedHeight),
                scaledBorderRadius !== undefined && isPolar && StyleUtils.getBorderRadiusStyle(scaledBorderRadius),
                styles.overflowHidden,
            ]}
        >
            <View
                style={[
                    StyleUtils.getWidthAndHeightStyle(width, height),
                    backgroundColor !== undefined && StyleUtils.getBackgroundColorStyle(backgroundColor),
                    scaledBorderRadius !== undefined && StyleUtils.getBorderRadiusStyle(scaledBorderRadius),
                    styles.overflowHidden,
                ]}
            >
                <VictoryChartScaledProvider scale={providerScale}>
                    <VictoryChartContent
                        explicitSize={{width, height}}
                        headless={false}
                    />
                </VictoryChartScaledProvider>
            </View>
        </View>
    );
}

ExpandedChartBox.displayName = 'ExpandedChartBox';

export default ExpandedChartBox;
