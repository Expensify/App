import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import isWebGLAvailable from '@components/Charts/utils/isWebGLAvailable';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {VictoryChartRendererProps} from './types';

const getBaseVictoryChartRenderer = () => import('./BaseVictoryChartRenderer');

function VictoryChartRenderer(props: VictoryChartRendererProps) {
    const styles = useThemeStyles();
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'VictoryChartRenderer.SkiaWebLoading'};

    // Skia/CanvasKit throws an async error ("failed to create webgl context") that escapes try/catch when WebGL2 is unavailable.
    // Precheck and degrade gracefully to the chart's reserved placeholder space instead of mounting Skia and crashing.
    if (!isWebGLAvailable()) {
        return <View style={styles.chartWebFallback} />;
    }

    // Victory Chart uses Skia internally and it uses a WASM module that must be loaded before rendering any Skia-based component.
    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={getBaseVictoryChartRenderer}
            componentProps={props}
            fallback={
                <View style={styles.chartWebFallback}>
                    <ActivityIndicator
                        size="large"
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            }
        />
    );
}

VictoryChartRenderer.displayName = 'VictoryChartRenderer';

export default VictoryChartRenderer;
