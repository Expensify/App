import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListItemSkeletonProps = {
    shouldAnimate?: boolean;
    renderSkeletonItem: (args: {itemIndex: number}) => React.ReactNode;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    itemViewStyle?: StyleProp<ViewStyle>;
    itemViewHeight?: number;
    speed?: number;
    style?: StyleProp<ViewStyle>;
};

const getVerticalMargin = (style: StyleProp<ViewStyle>): number => {
    if (!style) {
        return 0;
    }

    const flattenStyle = StyleSheet.flatten(style);
    const marginVertical = Number(flattenStyle?.marginVertical ?? 0);
    const marginTop = Number(flattenStyle?.marginTop ?? 0);
    const marginBottom = Number(flattenStyle?.marginBottom ?? 0);

    return marginVertical + marginTop + marginBottom;
};

function ItemListSkeletonView({
    shouldAnimate = true,
    renderSkeletonItem,
    fixedNumItems,
    gradientOpacityEnabled = false,
    itemViewStyle = {},
    itemViewHeight = CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT,
    speed,
    style,
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
            const opacity = gradientOpacityEnabled ? 1 - i / (numItems - 1) : 1;
            items.push(
                <SkeletonViewContentLoader
                    speed={speed}
                    key={`skeletonContainer${i}`}
                    animate={shouldAnimate}
                    height={itemViewHeight}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                    style={[themeStyles.mr5, itemViewStyle, {opacity}, {minHeight: itemViewHeight}]}
                >
                    {renderSkeletonItem({itemIndex: i})}
                </SkeletonViewContentLoader>,
            );
        }
        return items;
    }, [numItems, shouldAnimate, theme, themeStyles, renderSkeletonItem, gradientOpacityEnabled, itemViewHeight, itemViewStyle, speed]);

    return (
        <View
            style={[themeStyles.flex1, style]}
            onLayout={handleLayout}
        >
            {skeletonViewItems}
        </View>
    );
}

export default ItemListSkeletonView;
