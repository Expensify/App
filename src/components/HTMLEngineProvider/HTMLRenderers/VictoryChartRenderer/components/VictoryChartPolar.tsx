import {Canvas, Group} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {StyleSheet, View} from 'react-native';
import {Pie, PolarChart} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {POLAR_COLOR_KEY, POLAR_LABEL_KEY, POLAR_VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {getPieChartPadAngleLayout} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getPieChartPadAngleLayout';
import renderPieSliceAngularInsetElements from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/renderPieSliceAngularInsetElements';
import renderAllPieSliceLabelElements from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/renderPieSliceLabelElements';
import renderVictoryChartLabelElements from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/renderVictoryChartLabelElements';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chart: {
        flex: 1,
    },
    labelOverlay: StyleSheet.absoluteFill,
});

/**
 * Renders the PolarChart with pie data drawn from context.
 */
function VictoryChartPolar() {
    const {polarData, pieConfig, labelItems, chartContentStyles} = useVictoryChartContext();
    const typefaces = useChartDefaultTypeface();
    const [canvasSize, setCanvasSize] = useState(() => ({
        width: typeof chartContentStyles.width === 'number' ? chartContentStyles.width : 0,
        height: typeof chartContentStyles.height === 'number' ? chartContentStyles.height : 0,
    }));

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        setCanvasSize({width, height});
    }, []);

    const overlayLabelElements = useMemo(() => {
        if (!pieConfig || polarData.length === 0 || canvasSize.width <= 0 || canvasSize.height <= 0) {
            return [];
        }

        const floatingLabels = renderVictoryChartLabelElements({labelItems, typefaces});
        const sliceLabels = renderAllPieSliceLabelElements({
            polarData,
            pieConfig,
            canvasWidth: canvasSize.width,
            canvasHeight: canvasSize.height,
            typefaces,
        });
        const angularInsets = renderPieSliceAngularInsetElements({
            polarData,
            pieConfig,
            canvasWidth: canvasSize.width,
            canvasHeight: canvasSize.height,
        });

        return [...floatingLabels, ...sliceLabels, ...angularInsets];
    }, [canvasSize.height, canvasSize.width, labelItems, pieConfig, polarData, typefaces]);

    if (!pieConfig || polarData.length === 0) {
        return null;
    }

    const pieSize = pieConfig.radius ? pieConfig.radius * 2 : undefined;
    const {circleSweepDegrees, startAngle} = getPieChartPadAngleLayout(pieConfig.padAngle, polarData.length);

    return (
        <View
            style={styles.container}
            onLayout={handleLayout}
        >
            <PolarChart
                data={polarData}
                labelKey={POLAR_LABEL_KEY}
                valueKey={POLAR_VALUE_KEY}
                colorKey={POLAR_COLOR_KEY}
                containerStyle={styles.chart}
            >
                <Pie.Chart
                    innerRadius={pieConfig.innerRadius}
                    size={pieSize}
                    circleSweepDegrees={circleSweepDegrees}
                    startAngle={startAngle}
                />
            </PolarChart>
            {canvasSize.width > 0 && canvasSize.height > 0 && (
                <Canvas
                    style={styles.labelOverlay}
                    pointerEvents="none"
                >
                    <Group>{overlayLabelElements}</Group>
                </Canvas>
            )}
        </View>
    );
}

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
