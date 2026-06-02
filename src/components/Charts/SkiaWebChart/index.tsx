import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import type {ComponentType} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import isSkiaWebSupported from './isSkiaWebSupported';

type SkiaWebChartProps<TProps extends object> = {
    /** Lazily imports the Skia-backed chart component to render. */
    getComponent: () => Promise<{default: ComponentType<TProps>}>;

    /** Props forwarded to the lazily-loaded chart component. */
    componentProps: TProps;

    /** Identifies the loading skeleton span for telemetry. */
    reasonContext: string;
};

/**
 * Shared web wrapper around `WithSkiaWeb` for the chart entry points (Pie/Line/Bar charts and the
 * Victory chart renderer). It renders the chart's loading/fallback view instead of mounting
 * `WithSkiaWeb` when the environment cannot provide a usable WebGL/Skia surface, preventing the
 * uncaught `TypeError: Cannot read properties of null (reading 'rangeMin')` thrown by CanvasKit's
 * GL init on incapable devices.
 */
function SkiaWebChart<TProps extends object>({getComponent, componentProps, reasonContext}: SkiaWebChartProps<TProps>) {
    const styles = useThemeStyles();
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: reasonContext};

    const fallback = (
        <View style={styles.chartWebFallback}>
            <ActivityIndicator
                size="large"
                reasonAttributes={reasonAttributes}
            />
        </View>
    );

    if (!isSkiaWebSupported()) {
        return fallback;
    }

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={getComponent}
            componentProps={componentProps}
            fallback={fallback}
        />
    );
}

SkiaWebChart.displayName = 'SkiaWebChart';

export default SkiaWebChart;
