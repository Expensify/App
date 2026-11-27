import SkeletonLoader from '@components/SkeletonLoader';
import type {SkeletonAnimation} from '@components/SkeletonLoader/types';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

type ListItemSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    itemViewStyle?: StyleProp<ViewStyle>;
    itemContainerStyle?: StyleProp<ViewStyle>;
    itemViewHeight?: number;
    speed?: number;
    style?: StyleProp<ViewStyle>;
    onLayout?: (event: LayoutChangeEvent) => void;
} & (
    | {renderSkeletonItem: (args: {itemIndex: number}) => React.ReactNode; renderViewSkeletonItem?: never; animation?: never}
    | {renderSkeletonItem?: never; renderViewSkeletonItem: (args: {itemIndex: number}) => React.ReactNode; animation?: SkeletonAnimation}
);

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
    renderViewSkeletonItem,
    animation,
    fixedNumItems,
    gradientOpacityEnabled = false,
    itemViewStyle = {},
    itemContainerStyle,
    itemViewHeight = CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT,
    speed,
    style,
    onLayout,
}: ListItemSkeletonProps) {
    const theme = useTheme();
    const themeStyles = useThemeStyles();

    const [numItems, setNumItems] = useState(fixedNumItems ?? 0);

    const totalItemHeight = itemViewHeight + getVerticalMargin(itemViewStyle);

    const handleLayout = (event: LayoutChangeEvent) => {
        onLayout?.(event);

        if (fixedNumItems) {
            return;
        }

        const totalHeight = event.nativeEvent.layout.height;
        const newNumItems = Math.ceil(totalHeight / totalItemHeight);
        if (newNumItems !== numItems) {
            setNumItems(newNumItems);
        }
    };

    const items = [];
    for (let i = 0; i < numItems; i++) {
        const opacity = gradientOpacityEnabled && numItems > 1 ? 1 - i / (numItems - 1) : 1;
        // Existing callbacks contain raw SVG children, so View rendering requires an explicit opt-in.
        const Loader = renderViewSkeletonItem ? SkeletonLoader : SkeletonViewContentLoader;
        const loader = (
            <Loader
                speed={speed}
                key={`skeletonContainer${i}`}
                animate={shouldAnimate}
                height={itemViewHeight}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                {...(renderViewSkeletonItem ? {animation} : {})}
                style={[
                    themeStyles.mr5,
                    itemViewStyle,
                    {
                        opacity,
                    },
                    {
                        minHeight: itemViewHeight,
                    },
                ]}
            >
                {(renderViewSkeletonItem ?? renderSkeletonItem)?.({
                    itemIndex: i,
                })}
            </Loader>
        );
        if (itemContainerStyle) {
            const isLastItem = i === numItems - 1;
            items.push(
                <View
                    key={`skeletonContainer${i}`}
                    style={[
                        itemContainerStyle,
                        isLastItem && {
                            borderBottomWidth: 0,
                        },
                    ]}
                >
                    {loader}
                </View>,
            );
        } else {
            items.push(loader);
        }
    }
    const skeletonViewItems = items;

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
