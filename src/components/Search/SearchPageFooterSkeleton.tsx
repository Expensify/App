import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

const BAR_HEIGHT = 8;
const SKELETON_WIDTH = 110;
// Only used until the real total has been measured once, on the very first load.
const DEFAULT_SKELETON_HEIGHT = variables.lineHeightNormal;

// The whole-row stand-in, which covers the count as well as the total. Only the footer without the display selectors
// uses it, where the row is hidden behind the skeleton rather than keeping its real count on screen.
const WHOLE_ROW_HEIGHT = 20;
const COUNT_BAR_WIDTH = 80;
const BAR_GAP = 16;
const TOTAL_BAR_OFFSET = COUNT_BAR_WIDTH + BAR_GAP;
const WHOLE_ROW_WIDTH = TOTAL_BAR_OFFSET + SKELETON_WIDTH;

type SearchPageFooterSkeletonProps = {
    /** Height to stand in at. It is the height the real total occupies, so swapping the two leaves the footer's own
     * height untouched and nothing in the row shifts. */
    height?: number;

    /** Whether to stand in for the count as well as the total, which is what the footer without the selectors needs. */
    shouldStandInForWholeRow?: boolean;
};

/** Stands in for the Spend footer's total while a search recomputes it. The count beside it keeps its real value. */
function SearchPageFooterSkeleton({height = DEFAULT_SKELETON_HEIGHT, shouldStandInForWholeRow = false}: SearchPageFooterSkeletonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const skeletonHeight = shouldStandInForWholeRow ? WHOLE_ROW_HEIGHT : Math.max(height, BAR_HEIGHT);
    const skeletonWidth = shouldStandInForWholeRow ? WHOLE_ROW_WIDTH : SKELETON_WIDTH;
    const barVerticalOffset = (skeletonHeight - BAR_HEIGHT) / 2;

    return (
        <View style={[styles.overflowHidden, {height: skeletonHeight, width: skeletonWidth}]}>
            <SkeletonViewContentLoader
                height={skeletonHeight}
                width={skeletonWidth}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                {shouldStandInForWholeRow ? (
                    <>
                        <SkeletonRect
                            transform={[{translateY: barVerticalOffset}]}
                            width={COUNT_BAR_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: TOTAL_BAR_OFFSET}, {translateY: barVerticalOffset}]}
                            width={SKELETON_WIDTH}
                            height={BAR_HEIGHT}
                        />
                    </>
                ) : (
                    <SkeletonRect
                        transform={[{translateY: barVerticalOffset}]}
                        width={SKELETON_WIDTH}
                        height={BAR_HEIGHT}
                    />
                )}
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchPageFooterSkeleton;
