import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import useContainerWidth from '@hooks/useContainerWidth';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import EmptyState from './EmptyState';

type RecentlyAddedPlaceholderProps = {
    /** When true, renders the shimmer skeleton; when false, renders the empty state. */
    shouldShowSkeleton: boolean;
};

// Derived from the tokens RecentlyAddedRow uses rather than copied as literals, so the block keeps matching the rows
// when a token changes. A row is `pv3` around a receipt (pinned to its narrow size on both layouts) beside a merchant
// line and a muted label line separated by `gap1`, and every row but the last adds a 1px `borderBottom`.
// `pv3` on the row, top and bottom.
const ROW_VERTICAL_PADDING = 12 * 2;
const RECEIPT_WIDTH = variables.h36;
const RECEIPT_HEIGHT = variables.w40;
const MERCHANT_LINE_HEIGHT = variables.fontSizeNormalHeight;
const LABEL_LINE_HEIGHT = variables.lineHeightNormal;
const TEXT_LINE_GAP = 4;

// Every row but the last carries a 1px `borderBottom`, which the uniform loader height cannot express.
const SEPARATORS_HEIGHT = CONST.HOME.SECTION_VISIBLE_LIMIT - 1;
const ITEM_HEIGHT = ROW_VERTICAL_PADDING + Math.max(RECEIPT_HEIGHT, MERCHANT_LINE_HEIGHT + TEXT_LINE_GAP + LABEL_LINE_HEIGHT);
const COLUMN_GAP = 12;
const BAR_HEIGHT = 12;
const AMOUNT_WIDTH = 56;
const TYPE_WIDTH = 40;
const DATE_WIDTH = 64;
const separatorsSpacerStyle = {height: SEPARATORS_HEIGHT};

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
        const textBlockHeight = MERCHANT_LINE_HEIGHT + TEXT_LINE_GAP + LABEL_LINE_HEIGHT;
        const blockTop = (ITEM_HEIGHT - textBlockHeight) / 2;
        const firstLineY = blockTop + (MERCHANT_LINE_HEIGHT - BAR_HEIGHT) / 2;
        const secondLineY = blockTop + MERCHANT_LINE_HEIGHT + TEXT_LINE_GAP + (LABEL_LINE_HEIGHT - BAR_HEIGHT) / 2;

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
                <View style={separatorsSpacerStyle} />
            </View>
        </View>
    );
}

export default RecentlyAddedPlaceholder;
