import Icon from '@components/Icon';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

/**
 * The trailing navigation indicator of a `MenuItem.Row`. Renders a right arrow,
 * dimmed until the row is hovered
 */
function MenuItemChevron() {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isDisabled} = useMenuItemConfig();
    const {isHovered} = useMenuItemInteraction();

    return (
        <View
            style={[styles.menuItemChevron, isDisabled && styles.cursorDisabled, !isHovered && styles.opacitySemiTransparent]}
            testID="menu-item-chevron"
        >
            <Icon
                src={icons.ArrowRight}
                fill={theme.icon}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );
}

export default MenuItemChevron;
