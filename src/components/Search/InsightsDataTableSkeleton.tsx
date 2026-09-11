import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/** Mirrors the real row: `pv3` on both sides around a 40px avatar. */
const ROW_HEIGHT = 64;
const BAR_HEIGHT = 7;
const AVATAR_SIZE = 40;
const AVATAR_OFFSET_Y = (ROW_HEIGHT - AVATAR_SIZE) / 2;
const AVATAR_GAP = 12;
/** Where each of the row's two text lines sits, so the bars land on the lines they stand in for. */
const TOP_LINE_OFFSET_Y = 20;
const BOTTOM_LINE_OFFSET_Y = 40;
const LABEL_WIDTH = 120;
const COUNT_WIDTH = 70;
const AMOUNT_WIDTH = 64;
const SHARE_WIDTH = 84;

type InsightsDataTableSkeletonProps = {
    /** How many rows to draw. Without it the skeleton measures its own height, which is zero here. */
    fixedNumItems: number;

    /** Whether the rows being loaded carry an avatar, so the placeholder matches what arrives. */
    shouldShowAvatar: boolean;
};

/** Placeholder rows shown in place of `InsightsDataTable` while the chart's data loads. */
function InsightsDataTableSkeleton({fixedNumItems, shouldShowAvatar}: InsightsDataTableSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();

    const textStartX = shouldShowAvatar ? AVATAR_SIZE + AVATAR_GAP : 0;
    // Right-aligned bars, the way the row's amount and share are.
    const amountX = Math.max(containerWidth - AMOUNT_WIDTH, textStartX + LABEL_WIDTH + AVATAR_GAP);
    const shareX = Math.max(containerWidth - SHARE_WIDTH, textStartX + LABEL_WIDTH + AVATAR_GAP);

    return (
        <View
            style={styles.chartDataTable}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                shouldAnimate
                fixedNumItems={fixedNumItems}
                itemViewHeight={ROW_HEIGHT}
                itemViewStyle={styles.mr0}
                itemContainerStyle={styles.borderBottom}
                renderSkeletonItem={() => (
                    <>
                        {shouldShowAvatar && (
                            <SkeletonRect
                                transform={[{translateY: AVATAR_OFFSET_Y}]}
                                width={AVATAR_SIZE}
                                height={AVATAR_SIZE}
                                borderRadius={AVATAR_SIZE / 2}
                            />
                        )}
                        <SkeletonRect
                            transform={[{translateX: textStartX}, {translateY: TOP_LINE_OFFSET_Y}]}
                            width={LABEL_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: textStartX}, {translateY: BOTTOM_LINE_OFFSET_Y}]}
                            width={COUNT_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: amountX}, {translateY: TOP_LINE_OFFSET_Y}]}
                            width={AMOUNT_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: shareX}, {translateY: BOTTOM_LINE_OFFSET_Y}]}
                            width={SHARE_WIDTH}
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
