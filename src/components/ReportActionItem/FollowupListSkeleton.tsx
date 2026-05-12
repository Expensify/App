import React from 'react';
import {View} from 'react-native';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

const BAR_HEIGHT = 32;
const BAR_GAP = 8;
const BAR_COUNT = 3;
const TOTAL_HEIGHT = BAR_HEIGHT * BAR_COUNT + BAR_GAP * (BAR_COUNT - 1);
const BAR_RADIUS = 20;

const BAR_WIDTHS = [220, 280, 180] as const;

function FollowupListSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.mt2, styles.alignItemsStart]}>
            <SkeletonViewContentLoader
                height={TOTAL_HEIGHT}
                width={BAR_WIDTHS[1]}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                {BAR_WIDTHS.map((width, index) => (
                    <SkeletonRect
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        transform={[{translateY: index * (BAR_HEIGHT + BAR_GAP)}]}
                        width={width}
                        height={BAR_HEIGHT}
                        borderRadius={BAR_RADIUS}
                    />
                ))}
            </SkeletonViewContentLoader>
        </View>
    );
}

FollowupListSkeleton.displayName = 'FollowupListSkeleton';

export default FollowupListSkeleton;
