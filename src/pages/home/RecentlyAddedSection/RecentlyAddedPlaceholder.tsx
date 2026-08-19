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

// Reserve what the real rows occupy, so the widget does not grow and shove the rest of Home down when they land.
// A row is ReceiptCell (28x32 wide, 36x40 narrow) inside `pv3` (24px total), and narrow stacks two lines of text.
const ITEM_HEIGHT_WIDE = 56;
const ITEM_HEIGHT_NARROW = 68;
// The wide table also renders a column header above the rows; the narrow layout has none.
const HEADER_HEIGHT_WIDE = 32;
const RECEIPT_WIDTH_WIDE = 28;
const RECEIPT_HEIGHT_WIDE = 32;
const RECEIPT_WIDTH_NARROW = 36;
const RECEIPT_HEIGHT_NARROW = 40;
const BAR_HEIGHT = 12;
const AMOUNT_WIDTH = 56;
const COLUMN_GAP = 12;
// ItemListSkeletonView renders every row with `mr5` (marginRight: 20), so the drawable width is the container minus it.
// Without this offset the right-aligned amount bar is drawn past the SVG's edge and gets clipped.
const ROW_RIGHT_MARGIN = 20;
const headerSpacerStyle = {height: HEADER_HEIGHT_WIDE};

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

    const itemHeight = shouldUseNarrowLayout ? ITEM_HEIGHT_NARROW : ITEM_HEIGHT_WIDE;
    const receiptWidth = shouldUseNarrowLayout ? RECEIPT_WIDTH_NARROW : RECEIPT_WIDTH_WIDE;
    const receiptHeight = shouldUseNarrowLayout ? RECEIPT_HEIGHT_NARROW : RECEIPT_HEIGHT_WIDE;

    const renderSkeletonItem = (args: {itemIndex: number}) => {
        const merchantX = receiptWidth + COLUMN_GAP;
        const merchantWidth = getMerchantSkeletonWidth(args.itemIndex);
        const barY = (itemHeight - BAR_HEIGHT) / 2;

        return (
            <>
                <SkeletonRect
                    transform={[{translateX: 0}, {translateY: (itemHeight - receiptHeight) / 2}]}
                    width={receiptWidth}
                    height={receiptHeight}
                    borderRadius={4}
                />
                <SkeletonRect
                    transform={[{translateX: merchantX}, {translateY: barY}]}
                    width={merchantWidth}
                    height={BAR_HEIGHT}
                />
                {/* The amount is right-aligned, so it can only be placed once the container has been measured.
                    Drawing it at a guessed position first would visibly jump when the real width arrives. */}
                {containerWidth > 0 && (
                    <SkeletonRect
                        transform={[{translateX: containerWidth - AMOUNT_WIDTH}, {translateY: barY}]}
                        width={AMOUNT_WIDTH}
                        height={BAR_HEIGHT}
                    />
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
            style={shouldUseNarrowLayout ? [styles.mh5, styles.mb2] : [styles.mh8, styles.mb5]}
            onLayout={onLayout}
        >
            {/* Stands in for the wide layout's column header, which the rows render above themselves. */}
            {!shouldUseNarrowLayout && <View style={headerSpacerStyle} />}
            <ItemListSkeletonView
                itemViewHeight={itemHeight}
                fixedNumItems={CONST.HOME.SECTION_VISIBLE_LIMIT}
                renderSkeletonItem={renderSkeletonItem}
            />
        </View>
    );
}

export default RecentlyAddedPlaceholder;
