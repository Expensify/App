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

    /** Whether each row starts with a circle, standing in for the color dot or avatar the table's rows begin with. Defaults to true. */
    shouldShowIndicator?: boolean;

    /** Height of each row, matching the table's own rows so nothing moves when the data lands. The bars are centered in it. Defaults to a chart table's row. */
    rowHeight?: number;

    /** Space above the first row, matching what the table draws there, like its header. Defaults to a chart table's top margin. */
    topOffset?: number;
};

function InsightsDataTableSkeleton({fixedNumItems, shouldShowIndicator = true, rowHeight, topOffset}: InsightsDataTableSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();
    const {values} = useLayoutSpacing();
    const rowPaddingX = values.cardPadding;

    const barOffsetY = rowHeight === undefined ? BAR_OFFSET_Y : (rowHeight - BAR_HEIGHT) / 2;
    const textStartX = shouldShowIndicator ? rowPaddingX + INDICATOR_SIZE + INDICATOR_GAP_X : rowPaddingX;
    const amountX = Math.max(containerWidth - rowPaddingX - AMOUNT_WIDTH, textStartX + LABEL_WIDTH + AMOUNT_GAP_X);

    return (
        <View
            style={[styles.chartInlineTable, topOffset !== undefined && styles.insightsDataTableSkeletonTopOffset(topOffset)]}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                shouldAnimate
                fixedNumItems={fixedNumItems}
                itemViewHeight={rowHeight ?? ROW_HEIGHT}
                itemViewStyle={styles.mr0}
                renderSkeletonItem={() => (
                    <>
                        {shouldShowIndicator && (
                            <SkeletonRect
                                transform={[{translateX: rowPaddingX}]}
                                width={INDICATOR_SIZE}
                                height={INDICATOR_SIZE}
                                borderRadius={INDICATOR_SIZE / 2}
                            />
                        )}
                        <SkeletonRect
                            transform={[{translateX: textStartX}, {translateY: barOffsetY}]}
                            width={LABEL_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: amountX}, {translateY: barOffsetY}]}
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
