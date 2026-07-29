import Icon from '@components/Icon';
import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

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
    const {isHovered, isPressed, isDisabled, isInteractive, isCompact} = useMenuItemState();

    const iconFill = StyleUtils.getIconFillColor(getButtonState(isHovered, isPressed, false, isDisabled, isInteractive), true, true);

    return (
        <View style={[styles.popoverMenuIcon, isCompact && styles.wAuto]}>
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
