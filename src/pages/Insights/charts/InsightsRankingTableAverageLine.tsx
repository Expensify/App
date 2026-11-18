import VictoryTheme, {DASH_INTERVALS} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

// Snaps the line to whole pixels, since the average rarely falls on one and a 1px line between two pixels is drawn blurred and paler.
// react-native-svg leaves the attribute out of its types but passes it to the DOM on web.
const CRISP_EDGES_PROPS: Record<string, string> = {shapeRendering: 'crispEdges'};

type InsightsRankingTableAverageLineProps = {
    style?: StyleProp<ViewStyle>;
};

/** Vertical dashed line marking the average through a ranking table, drawn like the average line in charts */
function InsightsRankingTableAverageLine({style}: InsightsRankingTableAverageLineProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {strokeWidth, opacity} = VictoryTheme.averageLine;

    return (
        <View style={[styles.insightsRankingTableAverageDashedLine(strokeWidth), style]}>
            <Svg
                width="100%"
                height="100%"
            >
                <Line
                    x1={strokeWidth / 2}
                    y1={0}
                    x2={strokeWidth / 2}
                    y2="100%"
                    stroke={theme.text}
                    strokeOpacity={opacity}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    {...CRISP_EDGES_PROPS}
                    strokeDasharray={DASH_INTERVALS.join(' ')}
                />
            </Svg>
        </View>
    );
}

export default InsightsRankingTableAverageLine;
