import {SkeletonViewRect} from '@components/SkeletonLoader';

import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import ItemListSkeletonView from './ItemListSkeletonView';

const barHeight = 7;
const longBarWidth = 120;
const mediumBarWidth = 60;
const shortBarWidth = 40;

type MergeExpensesSkeletonProps = {
    fixedNumItems?: number;
    speed?: number;
};

function MergeExpensesSkeleton({fixedNumItems, speed}: MergeExpensesSkeletonProps) {
    const {onLayout, containerWidth: pageWidth} = useContainerWidth(24);
    const styles = useThemeStyles();

    const skeletonItem = () => {
        return (
            <>
                <SkeletonViewRect
                    x={12}
                    y={12}
                    width={36}
                    height={40}
                />
                <SkeletonViewRect
                    x={66}
                    y={22}
                    width={longBarWidth}
                    height={barHeight}
                />

                <SkeletonViewRect
                    x={66}
                    y={36}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <SkeletonViewRect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    x={pageWidth - 12 - mediumBarWidth}
                    y={22}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <SkeletonViewRect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    x={pageWidth - 12 - shortBarWidth}
                    y={36}
                    width={shortBarWidth}
                    height={barHeight}
                />
            </>
        );
    };

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
