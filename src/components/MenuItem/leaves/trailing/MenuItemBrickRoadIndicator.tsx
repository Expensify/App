import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type MenuItemBrickRoadIndicatorProps = {
    /** The type of brick road indicator to show */
    status: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

/**
 * The red/green dot indicator cell for `MenuItem.Trailing`, signalling that the row needs attention.
 */
function MenuItemBrickRoadIndicator({status}: MenuItemBrickRoadIndicatorProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
            <Icon
                src={icons.DotIndicator}
                fill={status === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.success}
            />
        </View>
    );
}

MenuItemBrickRoadIndicator.displayName = 'MenuItemBrickRoadIndicator';

export type {MenuItemBrickRoadIndicatorProps};
export default MenuItemBrickRoadIndicator;
