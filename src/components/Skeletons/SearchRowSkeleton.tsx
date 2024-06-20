import React from 'react';
import {Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import ItemListSkeletonView from './ItemListSkeletonView';

type SearchRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacity?: boolean;
};

const barHeight = '10';
const shortBarWidth = '40';
const longBarWidth = '120';

function SearchRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacity = false}: SearchRowSkeletonProps) {
    const styles = useThemeStyles();

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacity={gradientOpacity}
            itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mr3, styles.ml3]}
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

SearchRowSkeleton.displayName = 'SearchRowSkeleton';

export default SearchRowSkeleton;
