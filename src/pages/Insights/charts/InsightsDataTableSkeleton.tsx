import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {View} from 'react-native';

const AVATAR_SIZE = variables.avatarSizeMedium;
const GAP_X = 12;
const ROW_PADDING_Y = 16;
const ROW_PADDING_X_NARROW = 20;
const ROW_PADDING_X_WIDE = 32;

const ROW_HEIGHT = AVATAR_SIZE + ROW_PADDING_Y * 2;
const BAR_HEIGHT = 8;
const TOP_LINE_HEIGHT = 20;
const BOTTOM_LINE_HEIGHT = 16;
const LINE_GAP = 4;

const TOP_LINE_OFFSET_Y = ROW_PADDING_Y + (TOP_LINE_HEIGHT - BAR_HEIGHT) / 2;
const BOTTOM_LINE_OFFSET_Y = ROW_PADDING_Y + TOP_LINE_HEIGHT + LINE_GAP + (BOTTOM_LINE_HEIGHT - BAR_HEIGHT) / 2;

const LABEL_WIDTH = 124;
const COUNT_WIDTH = 60;
const AMOUNT_WIDTH = 80;
const SHARE_WIDTH = 40;

type InsightsDataTableSkeletonProps = {
    /** How many rows to draw. */
    fixedNumItems: number;

    /** Whether the rows being loaded carry an avatar. */
    shouldShowAvatar: boolean;
};

function InsightsDataTableSkeleton({fixedNumItems, shouldShowAvatar}: InsightsDataTableSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const rowPaddingX = shouldUseNarrowLayout ? ROW_PADDING_X_NARROW : ROW_PADDING_X_WIDE;

    const textStartX = rowPaddingX + (shouldShowAvatar ? AVATAR_SIZE + GAP_X : 0);
    const contentEndX = containerWidth - rowPaddingX;
    const amountX = Math.max(contentEndX - AMOUNT_WIDTH, textStartX + LABEL_WIDTH + GAP_X);
    const shareX = Math.max(contentEndX - SHARE_WIDTH, textStartX + LABEL_WIDTH + GAP_X);

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
                                transform={[{translateX: rowPaddingX}, {translateY: ROW_PADDING_Y}]}
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

export default InsightsDataTableSkeleton;
