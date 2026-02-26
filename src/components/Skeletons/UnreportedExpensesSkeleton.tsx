import React, {useCallback} from 'react';
import {View} from 'react-native';
import SkeletonRect from '@components/SkeletonRect';
import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
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
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function UnreportedExpensesSkeleton({fixedNumberOfItems, reasonAttributes}: UnreportedExpensesSkeletonProps) {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth(40);
    const styles = useThemeStyles();
    useSkeletonSpan('UnreportedExpensesSkeleton', reasonAttributes);

    const skeletonItem = useCallback(
        (args: {itemIndex: number}) => {
            return (
                <>
                    <SkeletonRect
                        transform={[{translateX: 12}, {translateY: 22}]}
                        width={20}
                        height={20}
                    />
                    <SkeletonRect
                        transform={[{translateX: 44}, {translateY: 12}]}
                        width={36}
                        height={40}
                    />
                    <SkeletonRect
                        transform={[{translateX: 92}, {translateY: 26}]}
                        width={getMessageSkeletonWidth(args.itemIndex)}
                        height={12}
                    />
                    <SkeletonRect
                        transform={[{translateX: pageWidth - 12 - getExpenseAmountSkeletonWidth(args.itemIndex)}, {translateY: 26}]}
                        width={getExpenseAmountSkeletonWidth(args.itemIndex)}
                        height={12}
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
                itemViewHeight={64}
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br2, styles.ml5, styles.mr5]}
                shouldAnimate
                fixedNumItems={fixedNumberOfItems}
                renderSkeletonItem={skeletonItem}
            />
        </View>
    );
}

export default UnreportedExpensesSkeleton;
