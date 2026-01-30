import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import type {BarChartProps} from '@components/Charts/types';
import useThemeStyles from '@hooks/useThemeStyles';

function BarChart(props: BarChartProps) {
    const styles = useThemeStyles();

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={() => import('./BarChartContent')}
            componentProps={props}
            fallback={
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.highlightBG, styles.br4, styles.p5]}>
                    <ActivityIndicator size="large" />
                </View>
            }
        />
    );
}

BarChart.displayName = 'BarChart';

export default BarChart;
