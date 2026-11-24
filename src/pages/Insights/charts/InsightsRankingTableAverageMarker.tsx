import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

const DASH_INTERVALS = [4, 4];

type InsightsRankingTableAverageMarkerProps = {
    style?: StyleProp<ViewStyle>;

    /** Defaults to the darker green the ranking table's bars are marked in */
    color?: string;
};

/** Short vertical dashed mark showing the average across a narrow ranking table row's bar, and in its legend */
function InsightsRankingTableAverageMarker({style, color = colors.green600}: InsightsRankingTableAverageMarkerProps) {
    const styles = useThemeStyles();
    const width = variables.insightsRankingTableAverageMarkerWidth;

    return (
        <View style={[styles.insightsRankingTableAverageDashedLine(width), style]}>
            <Svg
                width="100%"
                height="100%"
            >
                <Line
                    x1={width / 2}
                    y1="100%"
                    x2={width / 2}
                    y2={0}
                    stroke={color}
                    strokeWidth={width}
                    strokeDasharray={DASH_INTERVALS.join(' ')}
                />
            </Svg>
        </View>
    );
}

export default InsightsRankingTableAverageMarker;
