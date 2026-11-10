import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

const CHIP_WIDTH = 48;
const CHIP_HEIGHT = 24;

const TITLE_LINE_HEIGHT = lineHeightScale.text;
const SUMMARY_LINE_HEIGHT = lineHeightScale.label;
const BAR_HEIGHT = 8;

const CHIP_GAP = 8;
const SUMMARY_GAP = 12;

const TITLE_Y = CHIP_HEIGHT + CHIP_GAP;
const SUMMARY_Y = TITLE_Y + TITLE_LINE_HEIGHT + SUMMARY_GAP;
const CONTENT_HEIGHT = SUMMARY_Y + SUMMARY_LINE_HEIGHT;

const BUTTON_HEIGHT = variables.componentSizeSmall;
const BUTTON_BAR_WIDTH = 48;

/** Stands in for an AI card while the insights load. */
function InsightsAICardSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.pl3, styles.gap5]}>
            <SkeletonViewContentLoader
                animate
                width="100%"
                height={CONTENT_HEIGHT}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    width={CHIP_WIDTH}
                    height={CHIP_HEIGHT}
                    borderRadius={variables.componentBorderRadius}
                />
                <SkeletonRect
                    transform={[{translateY: TITLE_Y + (TITLE_LINE_HEIGHT - BAR_HEIGHT) / 2}]}
                    width="60%"
                    height={BAR_HEIGHT}
                />
                <SkeletonRect
                    transform={[{translateY: SUMMARY_Y + (SUMMARY_LINE_HEIGHT - BAR_HEIGHT) / 2}]}
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
                    transform={[{translateY: (BUTTON_HEIGHT - BAR_HEIGHT) / 2}]}
                    width={BUTTON_BAR_WIDTH}
                    height={BAR_HEIGHT}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default InsightsAICardSkeleton;
