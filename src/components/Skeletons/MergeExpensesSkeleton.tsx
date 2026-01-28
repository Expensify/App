import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
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
    useSkeletonSpan('MergeExpensesSkeleton');
    useLayoutEffect(() => {
        containerRef.current?.measure((x, y, width) => {
            setPageWidth(width - 24);
        });
    }, []);

    const skeletonItem = useCallback(() => {
        return (
            <>
                <Rect
                    transform={[{translateX: 12}, {translateY: 12}]}
                    width={36}
                    height={40}
                    rx={4}
                    ry={4}
                />
                <Rect
                    transform={[{translateX: 66}, {translateY: 22}]}
                    width={longBarWidth}
                    height={barHeight}
                />

                <Rect
                    transform={[{translateX: 66}, {translateY: 36}]}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <Rect
                    // We have to calculate this value to make sure the element is aligned to the right border.
                    transform={[{translateX: pageWidth - 12 - mediumBarWidth}, {translateY: 22}]}
                    width={mediumBarWidth}
                    height={barHeight}
                />

                <Rect
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

export default MergeExpensesSkeleton;
