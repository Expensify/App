import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import type {ComponentType} from 'react';

import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React, {useState} from 'react';
import {View} from 'react-native';

import isSkiaWebSupported from './isSkiaWebSupported';

type SkiaWebChartProps<TProps> = {
    /** Lazily imports the Skia-backed chart component to render. */
    getComponent: () => Promise<{default: ComponentType<TProps>}>;

    /** Props forwarded to the lazily-loaded chart component. */
    componentProps: TProps;

    /** Identifies the loading skeleton span for telemetry. */
    reasonContext: string;
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
 * Shared web wrapper around `WithSkiaWeb` for the chart entry points (Pie/Line/Bar and the Victory
 * renderer). When the environment can't provide a usable WebGL/Skia surface it shows an "unable to
 * display chart" empty state instead of mounting Skia, avoiding the CanvasKit GL-init crash (see `isSkiaWebSupported`).
 */
// `object` mirrors WithSkiaWeb's own constraint; `Record<string, unknown>` would reject the
// interface-based render-html renderer props (VictoryChartRendererProps) that lack an index signature.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function SkiaWebChart<TProps extends object>({getComponent, componentProps, reasonContext}: SkiaWebChartProps<TProps>) {
    const styles = useThemeStyles();

    // Probe once per mount (not per render) so re-rendering doesn't repeatedly create WebGL contexts,
    // while a fresh chart still re-checks capability instead of trusting a stale session-wide result.
    const [isSupported] = useState(() => isSkiaWebSupported());

    // If unsupported, the device can't give CanvasKit a usable WebGL surface.
    if (!isSupported) {
        return <ChartUnavailable />;
    }

    const reasonAttributes: SkeletonSpanReasonAttributes = {context: reasonContext};
    const fallback = (
        <View style={styles.chartWebFallback}>
            <ActivityIndicator
                size="large"
                reasonAttributes={reasonAttributes}
            />
        </View>
    );

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={getComponent}
            componentProps={componentProps}
            fallback={fallback}
        />
    );
}

export default SkiaWebChart;
