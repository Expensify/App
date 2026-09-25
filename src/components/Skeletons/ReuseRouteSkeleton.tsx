/**
 * Skeleton cards for the Reuse prior route list. Each item matches the route card shape (map block
 * on top, two icon + label/value rows below) so the loading state lands at the same height as a real card.
 */
import SkeletonRect from '@components/SkeletonRect';

import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React, {useCallback} from 'react';
import {View} from 'react-native';

import ItemListSkeletonView from './ItemListSkeletonView';

// reuseRouteCard uses mh5 (20px) on both sides.
const cardHorizontalMargin = 40;
const cardPadding = 4;
// Map area from the Figma spec: 354x192 inside the card padding.
const thumbnailAspectRatio = 1.84;
const rowHeight = 64;
const rowPaddingHorizontal = 20;
const iconSize = 20;
const iconGap = 12;
const labelBarHeight = 7;
const valueBarHeight = 10;

type ReuseRouteSkeletonProps = {
    fixedNumItems?: number;
};

function ReuseRouteSkeleton({fixedNumItems = 3}: ReuseRouteSkeletonProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth: cardWidth} = useContainerWidth(cardHorizontalMargin);
    const thumbnailHeight = (cardWidth - cardPadding * 2) / thumbnailAspectRatio;
    const contentTop = thumbnailHeight + cardPadding * 2;

    const skeletonRow = useCallback((rowTop: number, valueBarWidth: number) => {
        const barX = rowPaddingHorizontal + iconSize + iconGap;
        return (
            <>
                <SkeletonRect
                    transform={[{translateX: rowPaddingHorizontal}, {translateY: rowTop + (rowHeight - iconSize) / 2}]}
                    width={iconSize}
                    height={iconSize}
                    borderRadius={iconSize / 2}
                />
                <SkeletonRect
                    transform={[{translateX: barX}, {translateY: rowTop + 16}]}
                    width={36}
                    height={labelBarHeight}
                />
                <SkeletonRect
                    transform={[{translateX: barX}, {translateY: rowTop + 37}]}
                    width={valueBarWidth}
                    height={valueBarHeight}
                />
            </>
        );
    }, []);

    const skeletonItem = useCallback(() => {
        return (
            <>
                <SkeletonRect
                    transform={[{translateX: cardPadding}, {translateY: cardPadding}]}
                    width={cardWidth - cardPadding * 2}
                    height={thumbnailHeight}
                    borderRadius={12}
                />
                {skeletonRow(contentTop + 8, 140)}
                {skeletonRow(contentTop + 8 + rowHeight, 110)}
            </>
        );
    }, [cardWidth, thumbnailHeight, contentTop, skeletonRow]);

    return (
        <View
            style={styles.flex1}
            onLayout={onLayout}
        >
            <ItemListSkeletonView
                itemViewHeight={contentTop + 8 + rowHeight * 2 + 8}
                itemViewStyle={[styles.highlightBG, styles.mh5, styles.mb3, {borderRadius: variables.componentBorderRadiusLarge}]}
                shouldAnimate
                fixedNumItems={fixedNumItems}
                renderSkeletonItem={skeletonItem}
            />
        </View>
    );
}

export default ReuseRouteSkeleton;
