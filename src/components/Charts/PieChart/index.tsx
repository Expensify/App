import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import { View } from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import type { PieChartProps } from '@components/Charts/types';
import useThemeStyles from '@hooks/useThemeStyles';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    const styles = useThemeStyles();

    return (
        <WithSkiaWeb
            opts={{ locateFile: (file: string) => `/${file}` }}
            getComponent={getPieChartContent}
            componentProps={props}
            fallback={
                <View
                    style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.highlightBG, styles.br4, styles.p5]}
                >
                    <ActivityIndicator size="large" />
                </View>
            }
        />
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
