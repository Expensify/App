import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');
function LineChart(props: LineChartProps) {
    const styles = useThemeStyles();
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'LineChart.SkiaWebLoading'};

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={getLineChartContent}
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

export default LineChart;
