import React from 'react';
import { View } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import ActivityIndicator from '@components/ActivityIndicator';
import type { PieChartProps } from '@components/Charts/types';
import colors from '@styles/theme/colors';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    return (
        <WithSkiaWeb
            opts={{ locateFile: (file: string) => `/${file}` }}
            getComponent={getPieChartContent}
            componentProps={props}
            fallback={
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.productLight200,
                    borderRadius: 16,
                    padding: 20
                }}>
                    <ActivityIndicator size="large" />
                </View>
            }
        />
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
