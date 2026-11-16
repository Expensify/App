import Icon from '@components/Icon';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';

import getButtonState from '@libs/getButtonState';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type MenuItemIconProps = {
    src: IconAsset;
};

type BaseMenuItemIconProps = MenuItemIconProps & {
    /** The slot the glyph sits in, which is all the icon leaves differ by */
    style: StyleProp<ViewStyle>;
};

/** Base of the icon leaves: a glyph filled from the row's interaction state */
function BaseMenuItemIcon({src, style}: BaseMenuItemIconProps) {
    const StyleUtils = useStyleUtils();
    const {isDisabled, isInteractive} = useMenuItemConfig();
    const {isHovered, isPressed} = useMenuItemInteraction();

    const iconFill = StyleUtils.getIconFillColor({
        buttonState: getButtonState({isActive: isHovered, isPressed, isDisabled, isInteractive}),
        isMenuIcon: true,
        isPane: true,
    });

    return (
        <Icon
            contentFit="cover"
            hovered={isHovered}
            pressed={isPressed}
            src={src}
            fill={iconFill}
            additionalStyles={style}
        />
    );
}

export default BaseMenuItemIcon;
export type {MenuItemIconProps};
