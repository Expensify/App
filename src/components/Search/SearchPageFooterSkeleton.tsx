import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const SKELETON_HEIGHT = 20;
const BAR_HEIGHT = 8;
const BAR_VERTICAL_OFFSET = (SKELETON_HEIGHT - BAR_HEIGHT) / 2;
const SKELETON_WIDTH = 110;
const skeletonContainerStyle = {height: SKELETON_HEIGHT, width: SKELETON_WIDTH};

/** Stands in for the Spend footer's total while a search recomputes it. The count beside it keeps its real value. */
function SearchPageFooterSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.overflowHidden, skeletonContainerStyle]}>
            <SkeletonViewContentLoader
                height={SKELETON_HEIGHT}
                width={SKELETON_WIDTH}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: BAR_VERTICAL_OFFSET}]}
                    width={SKELETON_WIDTH}
                    height={BAR_HEIGHT}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchPageFooterSkeleton;
