/** Loading skeleton of the Biggest changes section's rows */
import SkeletonRect from '@components/SkeletonRect';
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const NAME_WIDTH = 120;
const AMOUNT_WIDTH = 80;
const CHANGE_WIDTH = 72;
const PERCENTAGE_WIDTH = 40;

function InsightsBiggestChangesSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    return Array.from({length: CONST.INSIGHTS.BIGGEST_CHANGES_LIMIT}, (_, index) => (
        <View
            key={index}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.p4, index < CONST.INSIGHTS.BIGGEST_CHANGES_LIMIT - 1 && styles.borderBottom]}
        >
            <View
                style={[
                    StyleUtils.getWidthAndHeightStyle(variables.insightsBiggestChangeIconFrameWidth, variables.insightsBiggestChangeIconFrameHeight),
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
            >
                <SkeletonViewContentLoader
                    animate
                    width={variables.avatarSizeSmall}
                    height={variables.avatarSizeSmall}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                >
                    <SkeletonRect
                        width={variables.avatarSizeSmall}
                        height={variables.avatarSizeSmall}
                        borderRadius={variables.avatarSizeSmall / 2}
                    />
                </SkeletonViewContentLoader>
            </View>
            <View style={[styles.flex1, styles.gap1]}>
                <SkeletonTextLine
                    lineHeight={lineHeightScale.text}
                    barWidth={NAME_WIDTH}
                />
                <SkeletonTextLine
                    lineHeight={lineHeightScale.label}
                    barWidth={AMOUNT_WIDTH}
                />
            </View>
            <View style={[styles.alignItemsEnd, styles.gap1]}>
                <View style={StyleUtils.getWidthStyle(CHANGE_WIDTH)}>
                    <SkeletonTextLine
                        lineHeight={lineHeightScale.text}
                        barWidth={CHANGE_WIDTH}
                    />
                </View>
                <View style={StyleUtils.getWidthStyle(PERCENTAGE_WIDTH)}>
                    <SkeletonTextLine
                        lineHeight={lineHeightScale.label}
                        barWidth={PERCENTAGE_WIDTH}
                    />
                </View>
            </View>
        </View>
    ));
}

export default InsightsBiggestChangesSkeleton;
