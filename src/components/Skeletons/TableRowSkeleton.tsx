import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import ItemListSkeletonView from './ItemListSkeletonView';

type TableListItemSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
};

const barHeight = '8';
const shortBarWidth = '60';
const longBarWidth = '124';

function TableListItemSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false}: TableListItemSkeletonProps) {
    const styles = useThemeStyles();
    useSkeletonSpan('TableRowSkeleton');

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml5]}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx="40"
                        cy="32"
                        r="20"
                    />
                    <Rect
                        transform={[{translateX: 80}, {translateY: 20}]}
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        transform={[{translateX: 80}, {translateY: 36}]}
                        width={shortBarWidth}
                        height={barHeight}
                    />
                </>
            )}
        />
    );
}

export default TableListItemSkeleton;
