import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
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

function getExpenseAmmountSkeletonWidth(index: number) {
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
    useLayoutEffect(() => {
        containerRef.current?.measure((x, y, width) => {
            setPageWidth(width - 24);
        });
    }, []);

    const skeletonItem = useCallback(
        (args: {itemIndex: number}) => {
            return (
                <>
                    <Rect
                        x={12}
                        y={22}
                        width={20}
                        height={20}
                        rx={4}
                        ry={4}
                    />
                    <Rect
                        x={44}
                        y={12}
                        width={36}
                        height={40}
                        rx={4}
                        ry={4}
                    />
                    <Rect
                        x={92}
                        y={26}
                        width={getMessageSkeletonWidth(args.itemIndex)}
                        height={12}
                    />
                    <Rect
                        x={pageWidth - 12 - getExpenseAmmountSkeletonWidth(args.itemIndex)}
                        y={26}
                        width={getExpenseAmmountSkeletonWidth(args.itemIndex)}
                        height={12}
                    />
                </>
            );
        },
        [pageWidth],
    );

    return (
        <View
            style={[styles.flex1, styles.pt3]}
            ref={containerRef}
        >
            <ItemListSkeletonView
                itemViewHeight={64}
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br2, styles.ml3, styles.mr3]}
                shouldAnimate
                fixedNumItems={fixedNumberOfItems}
                renderSkeletonItem={skeletonItem}
            />
        </View>
    );
}

UnreportedExpensesSkeleton.displayName = 'UnreportedExpensesSkeleton';

export default UnreportedExpensesSkeleton;
