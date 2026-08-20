import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import EmptyState from './EmptyState';

type RecentlyAddedPlaceholderProps = {
    /** Whether a search result may still arrive, in which case the slot shimmers instead of claiming there are no expenses */
    shouldShowSkeleton: boolean;
};

// Mirrors RecentlyAddedRow so the widget does not resize when the real rows replace the shimmer. A row is a 36x40
// receipt (the row pins ReceiptCell to its narrow size on both layouts) beside two stacked text lines, inside `pv3`.
const ROW_VERTICAL_PADDING = 24;
const RECEIPT_WIDTH = 36;
const RECEIPT_HEIGHT = 40;
const TEXT_LINE_HEIGHT = 20;
const TEXT_LINE_GAP = 4;
const ITEM_HEIGHT = ROW_VERTICAL_PADDING + Math.max(RECEIPT_HEIGHT, TEXT_LINE_HEIGHT * 2 + TEXT_LINE_GAP);
// `gap3` between the receipt and the text column, matching the row.
const COLUMN_GAP = 12;
const BAR_HEIGHT = 12;
const AMOUNT_WIDTH = 56;
const TYPE_WIDTH = 40;
const DATE_WIDTH = 64;
// ItemListSkeletonView renders every row with `mr5` (marginRight: 20), so the drawable width is the container minus it.
// Without this offset the right-aligned bars are drawn past the SVG's edge and get clipped.
const ROW_RIGHT_MARGIN = 20;

/** Varying the merchant width per row keeps the shimmer from reading as a rigid block. */
function getMerchantSkeletonWidth(itemIndex: number) {
    switch (itemIndex % 3) {
        case 0:
            return 120;
        case 1:
            return 96;
        default:
            return 140;
    }
}

/**
 * What the slot shows in place of rows: a shimmer while a search may still land, and the empty state once the answer is
 * settled. Sized from its own container rather than the window, because it renders inside a Home widget rather than in
 * the full-width Search pane.
 */
function RecentlyAddedPlaceholder({shouldShowSkeleton}: RecentlyAddedPlaceholderProps) {
    const {onLayout, containerWidth} = useContainerWidth(ROW_RIGHT_MARGIN);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const renderSkeletonItem = (args: {itemIndex: number}) => {
        const textX = RECEIPT_WIDTH + COLUMN_GAP;
        const merchantWidth = getMerchantSkeletonWidth(args.itemIndex);
        // The two lines are centred as a block against the taller receipt, as the row's flex column is.
        const blockTop = (ITEM_HEIGHT - (TEXT_LINE_HEIGHT * 2 + TEXT_LINE_GAP)) / 2;
        const firstLineY = blockTop + (TEXT_LINE_HEIGHT - BAR_HEIGHT) / 2;
        const secondLineY = firstLineY + TEXT_LINE_HEIGHT + TEXT_LINE_GAP;

        return (
            <>
                <SkeletonRect
                    transform={[{translateX: 0}, {translateY: (ITEM_HEIGHT - RECEIPT_HEIGHT) / 2}]}
                    width={RECEIPT_WIDTH}
                    height={RECEIPT_HEIGHT}
                    borderRadius={4}
                />
                <SkeletonRect
                    transform={[{translateX: textX}, {translateY: firstLineY}]}
                    width={merchantWidth}
                    height={BAR_HEIGHT}
                />
                <SkeletonRect
                    transform={[{translateX: textX}, {translateY: secondLineY}]}
                    width={DATE_WIDTH}
                    height={BAR_HEIGHT}
                />
                {/* The amount and the type sit at the right edge, so they can only be placed once the container has
                    been measured. Drawing them at a guessed position first would visibly jump when the width lands. */}
                {containerWidth > 0 && (
                    <>
                        <SkeletonRect
                            transform={[{translateX: containerWidth - AMOUNT_WIDTH}, {translateY: firstLineY}]}
                            width={AMOUNT_WIDTH}
                            height={BAR_HEIGHT}
                        />
                        <SkeletonRect
                            transform={[{translateX: containerWidth - TYPE_WIDTH}, {translateY: secondLineY}]}
                            width={TYPE_WIDTH}
                            height={BAR_HEIGHT}
                        />
                    </>
                )}
            </>
        );
    };

    if (!shouldShowSkeleton) {
        return <EmptyState />;
    }

    return (
        <View
            testID="recentlyAddedSkeleton"
            style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                itemViewHeight={ITEM_HEIGHT}
                fixedNumItems={CONST.HOME.SECTION_VISIBLE_LIMIT}
                renderSkeletonItem={renderSkeletonItem}
            />
        </View>
    );
}

export default RecentlyAddedPlaceholder;
