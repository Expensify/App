import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

import React from 'react';
import {View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';

const BAR_HEIGHT = 40;
const BAR_PADDING = 16;
const BAR_WIDTH = 180;
const BAR_COUNT = 3;

function ActionableItemSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={styles.actionableItemButtonSkeleton}>
            <SkeletonViewContentLoader
                height={BAR_HEIGHT}
                width={BAR_WIDTH + BAR_PADDING * 2}
                backgroundColor={theme.buttonHoveredBG}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateX: BAR_PADDING}, {translateY: BAR_PADDING}]}
                    width={BAR_WIDTH}
                    height="8"
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

function FollowupListSkeleton() {
    const styles = useThemeStyles();
    useSkeletonSpan('FollowupListSkeleton', {context: 'ReportScreen.ChatActionableButtons'});

    return (
        <Animated.View entering={FadeIn}>
            <View style={[styles.gap2, styles.mt4, styles.flexColumn, styles.alignItemsStart]}>
                {Array.from({length: BAR_COUNT}, (_, index) => (
                    <ActionableItemSkeleton key={index} />
                ))}
            </View>
        </Animated.View>
    );
}

export default FollowupListSkeleton;
