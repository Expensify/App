import Icon from '@components/Icon';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type MenuItemTrailingIconProps = {
    /** Icon to display */
    src: IconAsset;
};

/**
 * A trailing icon of a `MenuItem.Row` that is not a navigation indicator — an "opens in a new tab"
 * arrow, for instance. Unlike `MenuItem.Chevron` it stays at full opacity when the row is not
 * hovered, since it carries meaning on its own.
 */
function MenuItemTrailingIcon({src}: MenuItemTrailingIconProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isDisabled, isInteractive} = useMenuItemConfig();
    const {isHovered, isPressed} = useMenuItemInteraction();

    return (
        <View style={[styles.menuItemChevron, isDisabled && styles.cursorDisabled]}>
            <Icon
                src={src}
                fill={StyleUtils.getIconFillColor(getButtonState(isHovered, isPressed, false, isDisabled, isInteractive))}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );
}

export default MenuItemTrailingIcon;
