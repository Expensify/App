import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

const LINE_HEIGHT = variables.lineHeightSizeH2;
const BAR_HEIGHT = 16;
const BAR_OFFSET_Y = (LINE_HEIGHT - BAR_HEIGHT) / 2;

const BUTTON_HEIGHT = variables.componentSizeSmall;
const BUTTON_BAR_WIDTH = 48;
const BUTTON_BAR_HEIGHT = 8;

/** Stands in for an AI card's narration while the dashboard loads. */
function InsightsAICardSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.pl3, styles.gap6]}>
            <SkeletonViewContentLoader
                animate
                width={variables.insightsAICardTextWidth}
                height={LINE_HEIGHT * 2}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: BAR_OFFSET_Y}]}
                    width="100%"
                    height={BAR_HEIGHT}
                />
                <SkeletonRect
                    transform={[{translateY: LINE_HEIGHT + BAR_OFFSET_Y}]}
                    width="80%"
                    height={BAR_HEIGHT}
                />
            </SkeletonViewContentLoader>
            <SkeletonViewContentLoader
                animate
                width={BUTTON_BAR_WIDTH}
                height={BUTTON_HEIGHT}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: (BUTTON_HEIGHT - BUTTON_BAR_HEIGHT) / 2}]}
                    width={BUTTON_BAR_WIDTH}
                    height={BUTTON_BAR_HEIGHT}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default InsightsAICardSkeleton;
