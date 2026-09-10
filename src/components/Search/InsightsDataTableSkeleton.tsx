import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const ROW_HEIGHT = 32;
const BAR_HEIGHT = 7;
const BAR_OFFSET_Y = (ROW_HEIGHT - BAR_HEIGHT) / 2;
const AVATAR_SIZE = 20;
const AVATAR_OFFSET_Y = (ROW_HEIGHT - AVATAR_SIZE) / 2;
const LABEL_WIDTH = 120;
const DETAILS_WIDTH = 160;
/** `ItemListSkeletonView` adds `mr5` to every row, so that much of the container is not drawable. */
const ROW_RIGHT_MARGIN = 20;

type InsightsDataTableSkeletonProps = {
    /** How many rows to draw. Without it the skeleton measures its own height, which is zero here. */
    fixedNumItems: number;
};

/** Placeholder rows shown in place of `InsightsDataTable` while the chart's data loads. */
function InsightsDataTableSkeleton({fixedNumItems}: InsightsDataTableSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth(ROW_RIGHT_MARGIN);

    return (
        <View
            style={styles.chartDataTable}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                shouldAnimate
                fixedNumItems={fixedNumItems}
                itemViewHeight={ROW_HEIGHT}
                itemViewStyle={styles.chartDataTableSkeletonRow}
                renderSkeletonItem={() => (
                    <>
                        <SkeletonRect
                            transform={[{translateY: AVATAR_OFFSET_Y}]}
                            width={AVATAR_SIZE}
                            height={AVATAR_SIZE}
                            borderRadius={AVATAR_SIZE / 2}
                        />
                        <SkeletonRect
                            transform={[{translateX: AVATAR_SIZE + 8}, {translateY: BAR_OFFSET_Y}]}
                            width={LABEL_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            // Calculated so the row's details line up with the right edge, the way the real row does.
                            transform={[{translateX: Math.max(containerWidth - DETAILS_WIDTH, AVATAR_SIZE + 8 + LABEL_WIDTH + 8)}, {translateY: BAR_OFFSET_Y}]}
                            width={DETAILS_WIDTH}
                            height={BAR_HEIGHT}
                        />
                    </>
                )}
            />
        </View>
    );
}

InsightsDataTableSkeleton.displayName = 'InsightsDataTableSkeleton';

export default InsightsDataTableSkeleton;
