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
    shouldShowSkeleton: boolean;
};

// Mirrors RecentlyAddedRow so the widget does not resize when the real rows land: a 36x40 receipt (the row pins
// ReceiptCell to its narrow size on both layouts) beside two stacked text lines, inside `pv3`.
const ROW_VERTICAL_PADDING = 24;
const RECEIPT_WIDTH = 36;
const RECEIPT_HEIGHT = 40;
const TEXT_LINE_HEIGHT = 20;
const TEXT_LINE_GAP = 4;
const ITEM_HEIGHT = ROW_VERTICAL_PADDING + Math.max(RECEIPT_HEIGHT, TEXT_LINE_HEIGHT * 2 + TEXT_LINE_GAP);
const COLUMN_GAP = 12;
const BAR_HEIGHT = 12;
const AMOUNT_WIDTH = 56;
const TYPE_WIDTH = 40;
const DATE_WIDTH = 64;
// ItemListSkeletonView adds `mr5` to every row, so without this offset the right-aligned bars land past the svg and clip.
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
 * Shimmer while a search may still land, empty state once the answer is settled. Measures its own container rather than
 * the window, because it sits in a Home widget and not in the full-width Search pane.
 */
function RecentlyAddedPlaceholder({shouldShowSkeleton}: RecentlyAddedPlaceholderProps) {
    const {onLayout, containerWidth} = useContainerWidth(ROW_RIGHT_MARGIN);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const renderSkeletonItem = (args: {itemIndex: number}) => {
        const textX = RECEIPT_WIDTH + COLUMN_GAP;
        const merchantWidth = getMerchantSkeletonWidth(args.itemIndex);
        // Centred as a block against the taller receipt, as the row's flex column is.
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
                {/* Right-aligned, so they can only be placed once measured; a guessed position would visibly jump. */}
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
        >
            {/* Measured without padding: the padded parent's width includes the inset, which pushes the right-aligned bars off the svg. */}
            <View
                style={styles.flex1}
                onLayout={onLayout}
            >
                <ItemListSkeletonView
                    itemViewHeight={ITEM_HEIGHT}
                    fixedNumItems={CONST.HOME.SECTION_VISIBLE_LIMIT}
                    renderSkeletonItem={renderSkeletonItem}
                />
            </View>
        </View>
    );
}

export default RecentlyAddedPlaceholder;
