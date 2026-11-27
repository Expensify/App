/** Loading skeleton of the Recent history section's content */
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';

import useThemeStyles from '@hooks/useThemeStyles';

import {lineHeightScale} from '@styles/typography';

import React from 'react';
import {View} from 'react-native';

import {RECENT_HISTORY_PERIOD_COUNT} from './buildRecentHistoryRows';

const NAME_WIDTH = 96;
const AMOUNT_WIDTH = 80;

function InsightsRecentHistorySkeleton() {
    const styles = useThemeStyles();

    return Array.from({length: RECENT_HISTORY_PERIOD_COUNT}, (_, index) => (
        <View
            key={index}
            style={[styles.p4, styles.gap1, index < RECENT_HISTORY_PERIOD_COUNT - 1 && styles.borderBottom]}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap4]}>
                <View style={styles.flex1}>
                    <SkeletonTextLine
                        lineHeight={lineHeightScale.text}
                        barWidth={NAME_WIDTH}
                    />
                </View>
                <View style={[styles.flex2, styles.insightsRankingTableBarTrack]} />
            </View>
            <SkeletonTextLine
                lineHeight={lineHeightScale.label}
                barWidth={AMOUNT_WIDTH}
            />
        </View>
    ));
}

export default InsightsRecentHistorySkeleton;
