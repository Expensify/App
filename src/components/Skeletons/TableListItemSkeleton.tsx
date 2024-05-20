import React from 'react';
import {Rect} from 'react-native-svg';
import ItemListSkeletonView from './ItemListSkeletonView';

type TableListItemSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
};

const barHeight = '10';
const shortBarWidth = '40';
const longBarWidth = '120';

function TableListItemSkeleton({shouldAnimate = true, fixedNumItems}: TableListItemSkeletonProps) {
    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            renderSkeletonItem={() => (
                <>
                    <Rect
                        x="20"
                        y="10"
                        rx="5"
                        ry="5"
                        width="40"
                        height="40"
                    />
                    <Rect
                        x="80"
                        y="25"
                        width={shortBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="150"
                        y="25"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="320"
                        y="25"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="480"
                        y="25"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="660"
                        y="25"
                        width="100%"
                        height={barHeight}
                    />
                </>
            )}
        />
    );
}

TableListItemSkeleton.displayName = 'TableListItemSkeleton';

export default TableListItemSkeleton;
