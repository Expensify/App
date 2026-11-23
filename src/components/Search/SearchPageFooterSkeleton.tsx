import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

const BAR_HEIGHT = 8;
const DEFAULT_SKELETON_WIDTH = 110;
// Only used until the real total has been measured once, on the very first load.
const DEFAULT_SKELETON_HEIGHT = variables.lineHeightNormal;

type SearchPageFooterSkeletonProps = {
    /** Width to stand in at, the width the real total occupies, so a long total does not move between one line and two. */
    width?: number;

    /** Height to stand in at. It is the height the real total occupies, so swapping the two leaves the footer's own
     * height untouched and nothing in the row shifts. */
    height?: number;
};

/** Stands in for the Spend footer's total while a search recomputes it. The count beside it keeps its real value. */
function SearchPageFooterSkeleton({width = DEFAULT_SKELETON_WIDTH, height = DEFAULT_SKELETON_HEIGHT}: SearchPageFooterSkeletonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const skeletonHeight = Math.max(height, BAR_HEIGHT);
    const barVerticalOffset = (skeletonHeight - BAR_HEIGHT) / 2;

    return (
        <View style={[styles.overflowHidden, {height: skeletonHeight, width}]}>
            <SkeletonViewContentLoader
                height={skeletonHeight}
                width={width}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: barVerticalOffset}]}
                    width={width}
                    height={BAR_HEIGHT}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchPageFooterSkeleton;
