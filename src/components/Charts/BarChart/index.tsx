import React from 'react';
import {View} from 'react-native';
import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import ActivityIndicator from '@components/ActivityIndicator';
import type {BarChartProps} from '@components/Charts/types';
import colors from '@styles/theme/colors';

function BarChart(props: BarChartProps) {
    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={() => import('./BarChartContent')}
            componentProps={props}
            fallback={
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.productLight200, borderRadius: 16, padding: 20}}>
                    <ActivityIndicator size="large" />
                </View>
            }
        />
    );
}

BarChart.displayName = 'BarChart';

export default BarChart;
