import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    const styles = useThemeStyles();
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'PieChart.SkiaWebLoading'};

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={getPieChartContent}
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

PieChart.displayName = 'PieChart';

export default PieChart;
