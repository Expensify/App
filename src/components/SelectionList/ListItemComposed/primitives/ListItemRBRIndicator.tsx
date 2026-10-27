import Icon from '@components/Icon';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ListItemRBRIndicatorProps<TItem extends ListItem> = {
    /** The item whose brick road status decides the dot color (info is green, everything else red) */
    item: TItem;
};

/** The brick road dot shown at the end of a row. */
function ListItemRBRIndicator<TItem extends ListItem>({item}: ListItemRBRIndicatorProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const styles = useThemeStyles();
    const theme = useTheme();

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
