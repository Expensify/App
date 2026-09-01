import Icon from '@components/Icon';
import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type MenuItemIconProps = {
    /** Icon to display */
    src: IconAsset;
};

/** The leading icon cell of a `MenuItem.Row` */
function MenuItemIcon({src}: MenuItemIconProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isDisabled, isInteractive} = useMenuItemConfig();
    const {isHovered, isPressed} = useMenuItemInteraction();
    const isCompactPopover = useIsCompactPopover();

    const iconFill = StyleUtils.getIconFillColor({
        buttonState: getButtonState({isActive: isHovered, isPressed, isDisabled, isInteractive}),
        isMenuIcon: true,
        isPane: true,
    });

    return (
        <View style={[styles.popoverMenuIcon, isCompactPopover && styles.wAuto]}>
            <Icon
                contentFit="cover"
                hovered={isHovered}
                pressed={isPressed}
                src={src}
                fill={iconFill}
            />
        </View>
    );
}

export default MenuItemIcon;
