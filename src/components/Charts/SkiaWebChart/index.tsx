import ActivityIndicator from '@components/ActivityIndicator';
import {useIsInsideChartReveal, useReportChartLoading} from '@components/Charts/components/ChartReveal';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';
import {markCanvasKitLoadStarted} from '@libs/telemetry/integrations/canvasKitNoiseFilter';

import variables from '@styles/variables';

import type {TranslationPaths} from '@src/languages/types';

import type {ComponentType, LazyExoticComponent} from 'react';
import type {FallbackProps} from 'react-error-boundary';

import * as Sentry from '@sentry/react-native';
import React, {lazy, Suspense, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {View} from 'react-native';
import {LoadSkiaWeb} from 'react-native-skia/lib/module/web';

import getSkiaWebUnsupportedReason from './getSkiaWebUnsupportedReason';

type ChartLoader<TProps> = () => Promise<{default: ComponentType<TProps>}>;

type SkiaWebChartProps<TProps> = {
    /** Lazily imports the Skia-backed chart component to render. */
    getComponent: ChartLoader<TProps>;

    /** Props forwarded to the lazily-loaded chart component. */
    componentProps: TProps;
};

type ChartUnavailableProps = {
    /** Explains why the chart can't be shown. Defaults to the WebGL message. */
    description?: TranslationPaths;
};

/**
 * The CanvasKit glue asks `locateFile` where to fetch `canvaskit.wasm` from. The binary is emitted under a
 * versioned name (see `CANVASKIT_WASM_FILENAME` in `config/rsbuild/rsbuild.common.ts`) so this bundle's glue
 * can never be handed another release's binary. Every other file keeps the default root-relative path.
 */
const locateCanvasKitFile = (file: string) => (file === 'canvaskit.wasm' ? __CANVASKIT_WASM_URL__ : `/${file}`);

/**
 * One lazy component per chart loader, kept for the session. A lazy component renders without suspending only once
 * its own load has resolved, so one created per mount (as `WithSkiaWeb` does) suspends on every mount, and production
 * React commits the fallback for a few frames even when the chart's code and CanvasKit are already loaded.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each loader renders a chart with its own props, so the map holds every props type
const lazyCharts = new Map<ChartLoader<any>, LazyExoticComponent<ComponentType<any>>>();

function getLazyChart<TProps>(getComponent: ChartLoader<TProps>) {
    const cachedChart = lazyCharts.get(getComponent);
    if (cachedChart) {
        return cachedChart as LazyExoticComponent<ComponentType<TProps>>;
    }

    const LazyChart = lazy(async () => {
        try {
            markCanvasKitLoadStarted();
            await LoadSkiaWeb({locateFile: locateCanvasKitFile});
            return await getComponent();
        } catch (error) {
            // React keeps a lazy component's rejection for good, so drop it and let the next mount retry the load.
            lazyCharts.delete(getComponent);
            throw error;
        }
    });
    lazyCharts.set(getComponent, LazyChart);
    return LazyChart;
}

function ChartUnavailable({description = 'common.webGLNotSupported'}: ChartUnavailableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MonitorSyncNo']);

    // This state never loads, and Skia draws none of it, so an enclosing ChartReveal shows it at once
    useReportChartLoading(false, false);

    return (
        <View style={styles.chartWebFallback}>
            <Icon
                src={illustrations.MonitorSyncNo}
                width={variables.iconSizeSuperLarge}
                height={variables.iconSizeSuperLarge}
            />
            <Text style={styles.notFoundTextHeader}>{translate('common.unableToDisplayChart')}</Text>
            <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate(description)}</Text>
        </View>
    );
}

/**
 * Draws nothing, so an enclosing ChartReveal keeps its spinner up while Skia loads.
 * Reports loading so the reveal also holds that spinner until Skia has drawn the chart that replaces this.
 */
function ChartSkiaLoading() {
    useReportChartLoading(true);
    return null;
}

/**
 * Matches the errors react-native-skia throws when the browser cannot give its renderer a drawing surface: no
 * WebGL context (hardware acceleration disabled, GPU blocked by the browser), no graphics context on it, or no
 * 2D context for the canvas. The capability probe cannot rule these out, because the context is created only
 * after the CanvasKit WASM module has loaded and WebGL can become unavailable in between.
 *
 * They are thrown while the renderer is created, in a layout effect, where the boundary catches them. A surface
 * that cannot be created for a later draw does not throw: the view skips that frame.
 */
const SURFACE_UNAVAILABLE_ERROR_PATTERN = /webgl context|graphics context|2D context/i;

function isSurfaceUnavailableError(error: unknown): boolean {
    return error instanceof Error && SURFACE_UNAVAILABLE_ERROR_PATTERN.test(error.message);
}

/** Explains a chart that could not render: the WebGL message when there is no drawing surface, the load failure otherwise. */
function ChartErrorFallback({error}: FallbackProps) {
    return <ChartUnavailable description={isSurfaceUnavailableError(error) ? 'common.webGLNotSupported' : 'common.chartFailedToLoad'} />;
}

/**
 * Both failures the boundary catches are environmental rather than a bug in the chart. CanvasKit can fail to
 * initialize: a stale or mismatched `canvaskit.wasm` (see https://github.com/Expensify/App/issues/102042), an
 * 8 MB download failing offline, or a chunk that vanished from the CDN. The renderer can also be refused a
 * drawing surface. Report each as a warning under its own fingerprint so it stays visible in Sentry without
 * fragmenting per chart, and let the boundary show the empty state instead of crashing.
 */
const logSkiaError = (error: Error, info: {componentStack?: string | null}) => {
    const componentStack = info.componentStack ?? undefined;
    const isSurfaceUnavailable = isSurfaceUnavailableError(error);
    Log.warn(`[SkiaWebChart] ${isSurfaceUnavailable ? 'no drawing surface available' : 'failed to load CanvasKit'} - ${error.message}`, {componentStack});
    Sentry.captureException(error, {
        level: 'warning',
        tags: {context: isSurfaceUnavailable ? 'skia-web-chart-surface' : 'skia-web-chart-load'},
        fingerprint: [isSurfaceUnavailable ? 'skia-web-chart-surface-unavailable' : 'skia-web-chart-load-failure'],
        extra: {componentStack},
    });
};

/**
 * Shared web wrapper that loads CanvasKit and the chart's code for the chart entry points (Pie/Line/Bar and the Victory
 * renderer). When the environment can't provide a usable WebGL/Skia surface it shows an "unable to
 * display chart" empty state instead of mounting Skia, avoiding the CanvasKit GL-init crash (see `getSkiaWebUnsupportedReason`).
 * If CanvasKit itself fails to load or link, or the renderer is refused a drawing surface after the probe
 * passed, the error boundary degrades to the same empty state.
 */
// `object` mirrors WithSkiaWeb's own constraint; `Record<string, unknown>` would reject the
// interface-based render-html renderer props (VictoryChartRendererProps) that lack an index signature.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function SkiaWebChart<TProps extends object>({getComponent, componentProps}: SkiaWebChartProps<TProps>) {
    const styles = useThemeStyles();
    const isInsideChartReveal = useIsInsideChartReveal();

    // Probed on each mount, so a fresh chart re-checks capability instead of trusting a stale session-wide result.
    const [unsupportedReason] = useState(() => getSkiaWebUnsupportedReason());

    // Missing WebAssembly needs a different explanation from missing WebGL.
    if (unsupportedReason) {
        return <ChartUnavailable description={unsupportedReason} />;
    }

    const fallback = isInsideChartReveal ? (
        <ChartSkiaLoading />
    ) : (
        <View style={styles.chartWebFallback}>
            <ActivityIndicator size="large" />
        </View>
    );

    const LazyChart = getLazyChart(getComponent);

    return (
        <View style={styles.mw100}>
            <ErrorBoundary
                FallbackComponent={ChartErrorFallback}
                onError={logSkiaError}
            >
                <Suspense fallback={fallback}>
                    {/* eslint-disable-next-line react-hooks/static-components -- getLazyChart returns the same component for a loader on every render, so its state is never reset */}
                    <LazyChart {...componentProps} />
                </Suspense>
            </ErrorBoundary>
        </View>
    );
}

export default SkiaWebChart;
