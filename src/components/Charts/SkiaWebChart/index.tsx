import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';

import variables from '@styles/variables';

import type {TranslationPaths} from '@src/languages/types';
import viewRef from '@src/types/utils/viewRef';

import type {ComponentType} from 'react';

import * as Sentry from '@sentry/react-native';
import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React, {useRef, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {View} from 'react-native';

import isSkiaWebSupported from './isSkiaWebSupported';
import useIsSkiaSurfaceUnavailable from './useIsSkiaSurfaceUnavailable';

type SkiaWebChartProps<TProps> = {
    /** Lazily imports the Skia-backed chart component to render. */
    getComponent: () => Promise<{default: ComponentType<TProps>}>;

    /** Props forwarded to the lazily-loaded chart component. */
    componentProps: TProps;

    /** Identifies the loading skeleton span for telemetry. */
};

type ChartUnavailableProps = {
    /** Explains why the chart can't be shown; defaults to the WebGL message. */
    description?: TranslationPaths;
};

/**
 * The CanvasKit glue asks `locateFile` where to fetch `canvaskit.wasm` from. The binary is emitted under a
 * versioned name (see `CANVASKIT_WASM_FILENAME` in `config/rsbuild/rsbuild.common.ts`) so this bundle's glue
 * can never be handed another release's binary; every other file keeps the default root-relative path.
 */
const locateCanvasKitFile = (file: string) => (file === 'canvaskit.wasm' ? __CANVASKIT_WASM_URL__ : `/${file}`);

function ChartUnavailable({description = 'common.webGLNotSupported'}: ChartUnavailableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MonitorSyncNo']);

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

function ChartFailedToLoad() {
    return <ChartUnavailable description="common.chartFailedToLoad" />;
}

/**
 * CanvasKit failing to initialize is environmental rather than a bug in the chart: a stale or mismatched
 * `canvaskit.wasm` (see https://github.com/Expensify/App/issues/102042), an 8 MB download failing offline,
 * or a chunk that vanished from the CDN. Report it as a warning under one fingerprint so it stays visible in
 * Sentry without fragmenting per chart, and let the boundary show the empty state instead of crashing.
 */
const logSkiaLoadError = (error: Error, info: {componentStack?: string | null}) => {
    const componentStack = info.componentStack ?? undefined;
    Log.warn(`[SkiaWebChart] failed to load CanvasKit - ${error.message}`, {componentStack});
    Sentry.captureException(error, {
        level: 'warning',
        tags: {context: 'skia-web-chart-load'},
        fingerprint: ['skia-web-chart-load-failure'],
        extra: {componentStack},
    });
};

/**
 * Shared web wrapper around `WithSkiaWeb` for the chart entry points (Pie/Line/Bar and the Victory
 * renderer). When the environment can't provide a usable WebGL/Skia surface it shows an "unable to
 * display chart" empty state instead of mounting Skia, avoiding the CanvasKit GL-init crash (see `isSkiaWebSupported`).
 * If CanvasKit itself fails to load or link, the error boundary degrades to the same empty state.
 */
// `object` mirrors WithSkiaWeb's own constraint; `Record<string, unknown>` would reject the
// interface-based render-html renderer props (VictoryChartRendererProps) that lack an index signature.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function SkiaWebChart<TProps extends object>({getComponent, componentProps}: SkiaWebChartProps<TProps>) {
    const styles = useThemeStyles();
    const containerRef = useRef<HTMLElement | null>(null);

    // Probe once per mount (not per render) so re-rendering doesn't repeatedly create WebGL contexts,
    // while a fresh chart still re-checks capability instead of trusting a stale session-wide result.
    const [isSupported] = useState(() => isSkiaWebSupported());

    // The probe can pass while the renderer still ends up without a drawing surface, so also listen for the
    // renderer reporting that and degrade to the empty state.
    const isSurfaceUnavailable = useIsSkiaSurfaceUnavailable(containerRef);

    // If unsupported, the device can't give CanvasKit a usable WebGL surface.
    if (!isSupported || isSurfaceUnavailable) {
        return <ChartUnavailable />;
    }

    const fallback = (
        <View style={styles.chartWebFallback}>
            <ActivityIndicator size="large" />
        </View>
    );

    return (
        <View
            ref={viewRef(containerRef)}
            style={styles.mw100}
        >
            <ErrorBoundary
                FallbackComponent={ChartFailedToLoad}
                onError={logSkiaLoadError}
            >
                {/* The glue mutates `opts` into the module object, so give each mount its own object rather than sharing one. */}
                <WithSkiaWeb
                    opts={{locateFile: locateCanvasKitFile}}
                    getComponent={getComponent}
                    componentProps={componentProps}
                    fallback={fallback}
                />
            </ErrorBoundary>
        </View>
    );
}

export default SkiaWebChart;
