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
    itemContainerStyle?: StyleProp<ViewStyle>;
};

function ItemListSkeletonView({shouldAnimate = true, renderSkeletonItem, fixedNumItems, itemContainerStyle}: ListItemSkeletonProps) {
    const theme = useTheme();
    const themeStyles = useThemeStyles();

    const [numItems, setNumItems] = useState(fixedNumItems ?? 0);
    const skeletonViewItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < numItems; i++) {
            items.push(
                <View style={itemContainerStyle}>
                    <SkeletonViewContentLoader
                        key={`skeletonViewItems${i}`}
                        animate={shouldAnimate}
                        height={CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT}
                        backgroundColor={theme.skeletonLHNIn}
                        foregroundColor={theme.skeletonLHNOut}
                        style={themeStyles.mr5}
                    >
                        {renderSkeletonItem({itemIndex: i})}
                    </SkeletonViewContentLoader>
                </View>,
            );
        }
        return items;
    }, [numItems, shouldAnimate, theme, themeStyles, renderSkeletonItem, itemContainerStyle]);

    return (
        <View
            style={[themeStyles.flex1, themeStyles.overflowHidden]}
            onLayout={(event) => {
                if (fixedNumItems) {
                    return;
                }

                const newNumItems = Math.ceil(event.nativeEvent.layout.height / CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT);
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
