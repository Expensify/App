import {VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import VictoryChartContent from '../VictoryChartContent';

type ExpandedChartBoxProps = {
    /** Rendered chart width in pixels */
    width: number;

    /** Rendered chart height in pixels (full design canvas) */
    height: number;

    /** Visible height in pixels — smaller than `height` for polar charts, whose dead bottom space is clipped */
    clippedHeight: number;

    /** Uniform factor the chart's pixel-space config is scaled by for this render size */
    providerScale: number;

    /** Whether the chart canvas should render — removed while the modal is closing to avoid a white flash */
    isVisible: boolean;

    /** Theme-resolved container background parsed from the chart HTML */
    backgroundColor: ColorValue | undefined;

    /** Container corner radius parsed from the chart HTML */
    borderRadius: number | undefined;

    /** Whether the chart is polar — its clip container keeps the rounded corners */
    isPolar: boolean;
};

/**
 * The expanded chart rendered natively at the given size: an outer clip box (hides polar dead
 * space), an inner card with the chart's themed background/rounding, and the chart itself
 * re-rendered through VictoryChartScaledProvider so every pixel-space value matches the size.
 */
function ExpandedChartBox({width, height, clippedHeight, providerScale, isVisible, backgroundColor, borderRadius, isPolar}: ExpandedChartBoxProps) {
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
                {/* The Skia canvas is removed as soon as closing starts: WebGL canvases can flash white
                when re-composited during the close animation (visible on dark themes). The card box
                stays so the modal animates out looking intact. */}
                {isVisible && (
                    <VictoryChartScaledProvider scale={providerScale}>
                        <VictoryChartContent
                            explicitSize={{width, height}}
                            headless={false}
                        />
                    </VictoryChartScaledProvider>
                )}
            </View>
        </View>
    );
}

ExpandedChartBox.displayName = 'ExpandedChartBox';

export default ExpandedChartBox;
