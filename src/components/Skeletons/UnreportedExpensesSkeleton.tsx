import SkeletonRect from '@components/SkeletonRect';

import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React, {useCallback} from 'react';
import {View} from 'react-native';

import ItemListSkeletonView from './ItemListSkeletonView';

function getMessageSkeletonWidth(index: number) {
    switch (index % 3) {
        case 0:
            return 120;
        case 1:
            return 90;
        case 2:
            return 70;
        default:
            return 100;
    }
}

function getExpenseAmountSkeletonWidth(index: number) {
    switch (index % 3) {
        case 0:
            return 45;
        case 1:
            return 36;
        case 2:
            return 24;
        default:
            return 24;
    }
}

type UnreportedExpensesSkeletonProps = {
    fixedNumberOfItems?: number;
};

function UnreportedExpensesSkeleton({fixedNumberOfItems}: UnreportedExpensesSkeletonProps) {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth(40);
    const styles = useThemeStyles();
    // Passed only when this is the pagination-loading footer appended below already-rendered table rows, not the
    // full-page loading state, so it picks up a top divider connecting it to the real row above it instead of
    // rounding its own top corners.
    const isPaginationFooter = !!fixedNumberOfItems;

    const skeletonItem = useCallback(
        (args: {itemIndex: number}) => {
            return (
                <>
                    <SkeletonRect
                        transform={[{translateX: 16}, {translateY: 20}]}
                        width={20}
                        height={20}
                    />
                    <SkeletonRect
                        transform={[{translateX: 48}, {translateY: 10}]}
                        width={36}
                        height={40}
                    />
                    <SkeletonRect
                        transform={[{translateX: 96}, {translateY: 12}]}
                        width={getMessageSkeletonWidth(args.itemIndex)}
                        height={12}
                    />
                    <SkeletonRect
                        transform={[{translateX: 96}, {translateY: 36}]}
                        width={60}
                        height={8}
                    />
                    <SkeletonRect
                        transform={[{translateX: pageWidth - 16 - getExpenseAmountSkeletonWidth(args.itemIndex)}, {translateY: 12}]}
                        width={getExpenseAmountSkeletonWidth(args.itemIndex)}
                        height={12}
                    />
                    <SkeletonRect
                        transform={[{translateX: pageWidth - 16 - 32}, {translateY: 36}]}
                        width={32}
                        height={8}
                    />
                </>
            );
        },
        [pageWidth],
    );

    return (
        <View
            style={styles.flex1}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                itemViewHeight={variables.tableRowHeightCompact}
                itemViewStyle={[styles.highlightBG, styles.mr0]}
                itemContainerStyle={styles.borderBottom}
                style={[styles.mh5, styles.overflowHidden, styles.tableBottomRadius, isPaginationFooter && styles.borderTop]}
                shouldAnimate
                fixedNumItems={fixedNumberOfItems}
                renderSkeletonItem={skeletonItem}
            />
        </View>
    );
}

export default UnreportedExpensesSkeleton;
