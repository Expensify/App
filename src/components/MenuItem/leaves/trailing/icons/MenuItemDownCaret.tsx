import Icon from '@components/Icon';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

/**
 * The trailing indicator of a row that picks a value rather than navigating away. Renders a down
 * arrow, the same affordance a dropdown carries, and stays at full opacity so the row reads as a
 * field with a value to choose.
 */
function MenuItemDownCaret() {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isDisabled} = useMenuItemConfig();

    return (
        <View
            style={[styles.menuItemTrailingIcon, isDisabled && styles.cursorDisabled]}
            testID="menu-item-down-caret"
        >
            <Icon
                src={icons.DownArrow}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
        </View>
    );
}

export default MenuItemDownCaret;
