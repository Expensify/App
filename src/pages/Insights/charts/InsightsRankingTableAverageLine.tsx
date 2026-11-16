import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

const DASH_INTERVALS = [4, 4];

type InsightsRankingTableAverageLineProps = {
    style?: StyleProp<ViewStyle>;
};

/** Vertical dashed line marking the average in a ranking table */
function InsightsRankingTableAverageLine({style}: InsightsRankingTableAverageLineProps) {
    const styles = useThemeStyles();
    const lineWidth = variables.insightsRankingTableAverageLineWidth;

    return (
        <View style={[styles.insightsRankingTableAverageDashedLine, style]}>
            <Svg
                width="100%"
                height="100%"
            >
                <Line
                    x1={lineWidth / 2}
                    y1="100%"
                    x2={lineWidth / 2}
                    y2={0}
                    stroke={colors.green600}
                    strokeWidth={lineWidth}
                    strokeDasharray={DASH_INTERVALS.join(' ')}
                />
            </Svg>
        </View>
    );
}

export default InsightsRankingTableAverageLine;
