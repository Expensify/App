import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListItemSkeletonProps = {
    shouldAnimate?: boolean;
    renderSkeletonItem: (args: {itemIndex: number}) => React.ReactNode;
    fixedNumItems?: number;
    gradientOpacity?: boolean;
    itemViewStyle?: StyleProp<ViewStyle>;
    itemViewHeight?: number;
};

const getVerticalMargin = (style: StyleProp<ViewStyle>): number => {
    if (!style) {
        return 0;
    }
    const flattenStyle = style instanceof Array ? Object.assign({}, ...style) : style;
    return Number((flattenStyle.marginVertical || 0) + (flattenStyle.marginTop || 0) + (flattenStyle.marginBottom || 0));
};

function ItemListSkeletonView({
    shouldAnimate = true,
    renderSkeletonItem,
    fixedNumItems,
    gradientOpacity = false,
    itemViewStyle = {},
    itemViewHeight = CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT,
}: ListItemSkeletonProps) {
    const theme = useTheme();
    const themeStyles = useThemeStyles();

    const [numItems, setNumItems] = useState(fixedNumItems ?? 0);

    const totalItemHeight = itemViewHeight + getVerticalMargin(itemViewStyle);

    const handleLayout = useCallback(
        (event: LayoutChangeEvent) => {
            if (fixedNumItems) {
                return;
            }

            const totalHeight = event.nativeEvent.layout.height;

            const newNumItems = Math.ceil(totalHeight / totalItemHeight);

            if (newNumItems !== numItems) {
                setNumItems(newNumItems);
            }
        },
        [fixedNumItems, numItems, totalItemHeight],
    );

    const skeletonViewItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < numItems; i++) {
            const opacity = gradientOpacity ? 1 - i / (numItems - 1) : 1;
            items.push(
                <View
                    key={`skeletonContainer${i}`}
                    // style={[themeStyles.mr5, itemViewStyle]}
                    style={{opacity}}
                >
                    <View style={itemViewStyle}>
                        <SkeletonViewContentLoader
                            key={`skeletonViewItems${i}`}
                            animate={shouldAnimate}
                            height={itemViewHeight}
                            backgroundColor={theme.skeletonLHNIn}
                            foregroundColor={theme.skeletonLHNOut}
                        >
                            {renderSkeletonItem({itemIndex: i})}
                        </SkeletonViewContentLoader>
                    </View>
                </View>,
            );
        }
        return items;
    }, [numItems, shouldAnimate, theme, renderSkeletonItem, gradientOpacity, itemViewHeight, itemViewStyle]);

    return (
        <View
            style={[themeStyles.flex1, themeStyles.overflowHidden]}
            onLayout={handleLayout}
        >
            <View>{skeletonViewItems}</View>
        </View>
    );
}

ItemListSkeletonView.displayName = 'ListItemSkeleton';

export default ItemListSkeletonView;
