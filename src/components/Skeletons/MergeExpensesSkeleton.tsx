import React, {useCallback} from 'react';
import {View} from 'react-native';
import SkeletonRect from '@components/SkeletonRect';
import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import ItemListSkeletonView from './ItemListSkeletonView';

const barHeight = 7;
const longBarWidth = 120;
const mediumBarWidth = 60;
const shortBarWidth = 40;

type MergeExpensesSkeletonProps = {
    fixedNumItems?: number;
    speed?: number;
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function MergeExpensesSkeleton({fixedNumItems, speed, reasonAttributes}: MergeExpensesSkeletonProps) {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth(24);
    const styles = useThemeStyles();
    useSkeletonSpan('MergeExpensesSkeleton', reasonAttributes);

    const skeletonItem = useCallback(() => {
        return (
            <>
                <SkeletonRect
                    transform={[{translateX: 12}, {translateY: 12}]}
                    width={36}
                    height={40}
                />
                <SkeletonRect
                    transform={[{translateX: 66}, {translateY: 22}]}
                    width={longBarWidth}
                    height={barHeight}
                />

                <SkeletonRect
                    transform={[{translateX: 66}, {translateY: 36}]}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <SkeletonRect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    transform={[{translateX: pageWidth - 12 - mediumBarWidth}, {translateY: 22}]}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <SkeletonRect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    transform={[{translateX: pageWidth - 12 - shortBarWidth}, {translateY: 36}]}
                    width={shortBarWidth}
                    height={barHeight}
                />
            </>
        );
    }, [pageWidth]);

    return (
        <View
            style={styles.flex1}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                itemViewHeight={64}
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br2, styles.ml3, styles.mr3]}
                shouldAnimate
                fixedNumItems={fixedNumItems}
                renderSkeletonItem={skeletonItem}
                speed={speed}
            />
        </View>
    );
}

export default MergeExpensesSkeleton;
