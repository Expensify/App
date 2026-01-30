import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import type {LineChartProps} from './LineChartContent';
import useThemeStyles from '@hooks/useThemeStyles';

function LineChart(props: LineChartProps) {
    const styles = useThemeStyles();

    return (
        <WithSkiaWeb
            opts={{locateFile: (file: string) => `/${file}`}}
            getComponent={() => import('./LineChartContent')}
            componentProps={props}
            fallback={
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.highlightBG, styles.br4, styles.p5]}>
                    <ActivityIndicator size="large" />
                </View>
            }
        />
    );
}

LineChart.displayName = 'LineChart';

export default LineChart;
