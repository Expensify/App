import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {View} from 'react-native';

const AVATAR_SIZE = variables.avatarSizeMedium;

// 12 is the gap between the avatar and the text column, matching the row's gap3
const AVATAR_GAP = 12;

// 12 is the padding above and below the row's content, matching its pv3
const ROW_PADDING_Y = 12;

// The row's full height: the avatar with padding on both sides
const ROW_HEIGHT = AVATAR_SIZE + ROW_PADDING_Y * 2;

// 7 is the height of a bar standing in for a line of text
const BAR_HEIGHT = 7;

// Centers the avatar placeholder in the row
const AVATAR_OFFSET_Y = (ROW_HEIGHT - AVATAR_SIZE) / 2;

// 20 is where the row's first line of text sits
const TOP_LINE_OFFSET_Y = 20;

// 40 is where the row's second line of text sits
const BOTTOM_LINE_OFFSET_Y = 40;

// 120 is the width of the bar standing in for the group label
const LABEL_WIDTH = 120;

// 70 is the width of the bar standing in for the expense count
const COUNT_WIDTH = 70;

// 64 is the width of the bar standing in for the amount
const AMOUNT_WIDTH = 64;

// 84 is the width of the bar standing in for the share of spend
const SHARE_WIDTH = 84;

type InsightsDataTableSkeletonProps = {
    /** How many rows to draw. */
    fixedNumItems: number;

    /** Whether the rows being loaded carry an avatar. */
    shouldShowAvatar: boolean;
};

function InsightsDataTableSkeleton({fixedNumItems, shouldShowAvatar}: InsightsDataTableSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();

    const textStartX = shouldShowAvatar ? AVATAR_SIZE + AVATAR_GAP : 0;
    const amountX = Math.max(containerWidth - AMOUNT_WIDTH, textStartX + LABEL_WIDTH + AVATAR_GAP);
    const shareX = Math.max(containerWidth - SHARE_WIDTH, textStartX + LABEL_WIDTH + AVATAR_GAP);

    return (
        <View
            style={styles.chartInlineTable}
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
