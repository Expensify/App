import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
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

function UnreportedExpensesSkeleton({fixedNumberOfItems}: {fixedNumberOfItems?: number}) {
    const containerRef = useRef<View>(null);
    const styles = useThemeStyles();
    const [pageWidth, setPageWidth] = React.useState(0);
    useSkeletonSpan('UnreportedExpensesSkeleton');
    useLayoutEffect(() => {
        containerRef.current?.measure((x, y, width) => {
            setPageWidth(width - 40);
        });
    }, []);

    const skeletonItem = useCallback(
        (args: {itemIndex: number}) => {
            return (
                <>
                    <Rect
                        transform={[{translateX: 12}, {translateY: 22}]}
                        width={20}
                        height={20}
                        rx={4}
                        ry={4}
                    />
                    <Rect
                        transform={[{translateX: 44}, {translateY: 12}]}
                        width={36}
                        height={40}
                        rx={4}
                        ry={4}
                    />
                    <Rect
                        transform={[{translateX: 92}, {translateY: 26}]}
                        width={getMessageSkeletonWidth(args.itemIndex)}
                        height={12}
                    />
                    <Rect
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
            ref={containerRef}
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
