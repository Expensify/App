import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const containerRef = useRef<View>(null);
    const styles = useThemeStyles();
    const [pageWidth, setPageWidth] = React.useState(0);
    useLayoutEffect(() => {
        containerRef.current?.measure((x, y, width) => {
            setPageWidth(width - 24);
        });
    }, []);

    const skeletonItem = useCallback(() => {
        return (
            <>
                <Rect
                    x={12}
                    y={12}
                    width={36}
                    height={40}
                    rx={4}
                    ry={4}
                />
                <Rect
                    x={66}
                    y={22}
                    width={longBarWidth}
                    height={barHeight}
                />

                <Rect
                    x={66}
                    y={36}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <Rect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    x={pageWidth - 12 - mediumBarWidth}
                    y={22}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <Rect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    x={pageWidth - 12 - shortBarWidth}
                    y={36}
                    width={shortBarWidth}
                    height={barHeight}
                />
            </>
        );
    }, [pageWidth]);

    return (
        <View
            style={styles.flex1}
            ref={containerRef}
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

MergeExpensesSkeleton.displayName = 'MergeExpensesSkeleton';

export default MergeExpensesSkeleton;
