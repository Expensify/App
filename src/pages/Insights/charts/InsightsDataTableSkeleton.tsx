import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useThemeStyles from '@hooks/useThemeStyles';

import {View} from 'react-native';

const INDICATOR_SIZE = 20;
const INDICATOR_GAP_X = 20;
const AMOUNT_GAP_X = 20;
const ROW_GAP_Y = 24;

const LINE_HEIGHT = 20;
const BAR_HEIGHT = 8;
const ROW_HEIGHT = LINE_HEIGHT + ROW_GAP_Y;
const BAR_OFFSET_Y = (LINE_HEIGHT - BAR_HEIGHT) / 2;

const LABEL_WIDTH = 124;
const AMOUNT_WIDTH = 80;

type InsightsDataTableSkeletonProps = {
    /** How many rows to draw. */
    fixedNumItems: number;
};

function InsightsDataTableSkeleton({fixedNumItems}: InsightsDataTableSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();
    const {values} = useLayoutSpacing();
    const rowPaddingX = values.cardPadding;

    const textStartX = rowPaddingX + INDICATOR_SIZE + INDICATOR_GAP_X;
    const amountX = Math.max(containerWidth - rowPaddingX - AMOUNT_WIDTH, textStartX + LABEL_WIDTH + AMOUNT_GAP_X);

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
                renderSkeletonItem={() => (
                    <>
                        <SkeletonRect
                            transform={[{translateX: rowPaddingX}]}
                            width={INDICATOR_SIZE}
                            height={INDICATOR_SIZE}
                            borderRadius={INDICATOR_SIZE / 2}
                        />
                        <SkeletonRect
                            transform={[{translateX: textStartX}, {translateY: BAR_OFFSET_Y}]}
                            width={LABEL_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: amountX}, {translateY: BAR_OFFSET_Y}]}
                            width={AMOUNT_WIDTH}
                            height={BAR_HEIGHT}
                        />
                    </>
                )}
            />
        </View>
    );
}

export default InsightsDataTableSkeleton;
