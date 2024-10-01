import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
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

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mh5]}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx="40"
                        cy="32"
                        r="20"
                    />
                    <Rect
                        x="80"
                        y="20"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="80"
                        y="36"
                        width={shortBarWidth}
                        height={barHeight}
                    />
                </>
            )}
        />
    );
}

TableListItemSkeleton.displayName = 'TableListItemSkeleton';

export default TableListItemSkeleton;
