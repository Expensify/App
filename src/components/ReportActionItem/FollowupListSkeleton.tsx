import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';

const BAR_HEIGHT = 40;
const BAR_GAP = 8;
const BAR_COUNT = 3;
const TOTAL_HEIGHT = BAR_HEIGHT * BAR_COUNT + BAR_GAP * (BAR_COUNT - 1);
const BAR_RADIUS = 20;

const BAR_WIDTHS = [220, 280, 180] as const;

function FollowupListSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    useSkeletonSpan('FollowupListSkeleton', {context: 'ReportScreen.ChatActionableButtons'});

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
        >
            <SkeletonViewContentLoader
                height={TOTAL_HEIGHT}
                width={BAR_WIDTHS[1]}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                style={styles.mt2}
            >
                {BAR_WIDTHS.map((width, index) => (
                    <SkeletonRect
                        key={`skeletonRect${width}`}
                        transform={[{translateY: index * (BAR_HEIGHT + BAR_GAP)}]}
                        width={width}
                        height={BAR_HEIGHT}
                        borderRadius={BAR_RADIUS}
                    />
                ))}
            </SkeletonViewContentLoader>
        </Animated.View>
    );
}

FollowupListSkeleton.displayName = 'FollowupListSkeleton';

export default FollowupListSkeleton;
