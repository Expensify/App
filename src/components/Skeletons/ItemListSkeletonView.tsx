import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
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
    const skeletonViewItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < numItems; i++) {
            const opacity = gradientOpacity ? 1 - i / numItems : 1;
            items.push(
                <View style={{opacity}}>
                    <View style={[themeStyles.mr5, itemViewStyle]}>
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
    }, [numItems, shouldAnimate, theme, themeStyles, renderSkeletonItem, gradientOpacity, itemViewHeight, itemViewStyle]);
    return (
        <View
            style={[themeStyles.flex1, themeStyles.overflowHidden]}
            onLayout={(event) => {
                if (fixedNumItems) {
                    return;
                }

                const newNumItems = Math.ceil(event.nativeEvent.layout.height / itemViewHeight);
                if (newNumItems === numItems) {
                    return;
                }
                setNumItems(newNumItems);
            }}
        >
            <View>{skeletonViewItems}</View>
        </View>
    );
}

ItemListSkeletonView.displayName = 'ListItemSkeleton';

export default ItemListSkeletonView;
