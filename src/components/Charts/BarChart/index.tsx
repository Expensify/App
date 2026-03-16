import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/constants';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {BarChartProps} from './BarChartContent';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    const styles = useThemeStyles();
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'BarChart.SkiaWebLoading'};

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={getBarChartContent}
            componentProps={props}
            fallback={
                <View style={[styles.chartWebFallback, props.disableDynamicHeight && {minHeight: CHART_CONTENT_MIN_HEIGHT}]}>
                    <ActivityIndicator
                        size="large"
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            }
        />
    );
}

export default BarChart;
