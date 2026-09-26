import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import viewRef from '@src/types/utils/viewRef';

import type {ComponentType, ReactNode} from 'react';

import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import isSkiaWebSupported from './isSkiaWebSupported';
import useHasSkiaDrawn from './useHasSkiaDrawn';
import useIsSkiaSurfaceUnavailable from './useIsSkiaSurfaceUnavailable';

type SkiaWebChartProps<TProps> = {
    /** Lazily imports the Skia-backed chart component to render. */
    getComponent: () => Promise<{default: ComponentType<TProps>}>;

    /** Props forwarded to the lazily-loaded chart component. */
    componentProps: TProps;

    /** Shown while the chart engine downloads and until the chart first draws. */
    loadingFallback?: ReactNode;
};

function ChartUnavailable() {
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
            <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate('common.webGLNotSupported')}</Text>
        </View>
    );
}

/**
 * When the environment can't provide a usable WebGL/Skia surface this shows an "unable to display chart"
 * empty state instead of mounting Skia, avoiding the CanvasKit GL-init crash (see `isSkiaWebSupported`).
 */
// `object` mirrors WithSkiaWeb's own constraint; `Record<string, unknown>` would reject the
// interface-based render-html renderer props (VictoryChartRendererProps) that lack an index signature.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function SkiaWebChart<TProps extends object>({getComponent, componentProps, loadingFallback}: SkiaWebChartProps<TProps>) {
    const styles = useThemeStyles();
    const containerRef = useRef<HTMLElement | null>(null);

    // Probe once per mount (not per render) so re-rendering doesn't repeatedly create WebGL contexts,
    // while a fresh chart still re-checks capability instead of trusting a stale session-wide result.
    const [isSupported] = useState(() => isSkiaWebSupported());

    // The probe can pass while the renderer still ends up without a drawing surface.
    const isSurfaceUnavailable = useIsSkiaSurfaceUnavailable(containerRef);
    const hasDrawn = useHasSkiaDrawn(containerRef);
    const isAwaitingFirstDraw = !!loadingFallback && !hasDrawn;

    if (!isSupported || isSurfaceUnavailable) {
        return <ChartUnavailable />;
    }

    const fallback = loadingFallback ?? (
        <View style={styles.chartWebFallback}>
            <ActivityIndicator size="large" />
        </View>
    );

    return (
        <View
            ref={viewRef(containerRef)}
            style={styles.mw100}
        >
            {/* The canvas stays blank until Skia draws into it, while the parts of a chart drawn as views show at once. */}
            <View style={isAwaitingFirstDraw && styles.opacity0}>
                <WithSkiaWeb
                    opts={{locateFile: (file: string) => `/${file}`}}
                    getComponent={getComponent}
                    componentProps={componentProps}
                    fallback={fallback}
                />
            </View>
            {isAwaitingFirstDraw && <View style={[StyleSheet.absoluteFill, styles.pointerEventsNone]}>{loadingFallback}</View>}
        </View>
    );
}

export default SkiaWebChart;
