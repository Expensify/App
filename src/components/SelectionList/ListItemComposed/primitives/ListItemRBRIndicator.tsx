import Icon from '@components/Icon';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import isListItemSelected from '@components/SelectionList/utils/isListItemSelected';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ListItemRBRIndicatorProps<TItem extends ListItem> = {
    /** The item whose brick road status decides visibility and dot color (info is green, everything else red) */
    item: TItem;

    /** Overrides the item-derived selection state, matching isListItemSelected */
    isSelected?: boolean;
};

/** Self-gating: renders only when the item carries a brick road status and isn't already showing its selection state. */
function ListItemRBRIndicator<TItem extends ListItem>({item, isSelected}: ListItemRBRIndicatorProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const styles = useThemeStyles();
    const theme = useTheme();

    if ((isListItemSelected(item, isSelected) && !item.canShowSeveralIndicators) || !item.brickRoadIndicator) {
        return null;
    }

    return (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml3]}>
            <Icon
                testID={CONST.DOT_INDICATOR_TEST_ID}
                src={icons.DotIndicator}
                fill={item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger}
            />
        </View>
    );
}

export default ListItemRBRIndicator;
