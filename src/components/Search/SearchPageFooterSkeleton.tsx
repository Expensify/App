import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

import React from 'react';
import {View} from 'react-native';

const SKELETON_HEIGHT = 20;
const BAR_HEIGHT = 8;
const BAR_VERTICAL_OFFSET = (SKELETON_HEIGHT - BAR_HEIGHT) / 2;
const COUNT_BAR_WIDTH = 80;
const TOTAL_BAR_WIDTH = 110;
const TOTAL_BAR_OFFSET = COUNT_BAR_WIDTH + 16;
const SKELETON_WIDTH = TOTAL_BAR_OFFSET + TOTAL_BAR_WIDTH;

type SearchPageFooterSkeletonProps = {
    /** Context describing why the skeleton is rendered, for telemetry */
    reasonAttributes: SkeletonSpanReasonAttributes;
};

function SearchPageFooterSkeleton({reasonAttributes}: SearchPageFooterSkeletonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    useSkeletonSpan('SearchPageFooterSkeleton', reasonAttributes);

    return (
        <View style={[styles.overflowHidden, {height: SKELETON_HEIGHT, width: SKELETON_WIDTH}]}>
            <SkeletonViewContentLoader
                height={SKELETON_HEIGHT}
                width={SKELETON_WIDTH}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: BAR_VERTICAL_OFFSET}]}
                    width={COUNT_BAR_WIDTH}
                    height={BAR_HEIGHT}
                />
                <SkeletonRect
                    transform={[{translateX: TOTAL_BAR_OFFSET}, {translateY: BAR_VERTICAL_OFFSET}]}
                    width={TOTAL_BAR_WIDTH}
                    height={BAR_HEIGHT}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchPageFooterSkeleton;
