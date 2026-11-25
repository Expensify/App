import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

const DASH_INTERVALS = [4, 4];

type InsightsAverageMarkerProps = {
    style?: StyleProp<ViewStyle>;
    color?: string;
};

/** Short vertical dashed mark showing an average across a bar, and in the legend that explains it */
function InsightsAverageMarker({style, color = colors.green600}: InsightsAverageMarkerProps) {
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

export default InsightsAverageMarker;
