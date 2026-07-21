import Icon from '@components/Icon';
import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemIconVariant = (typeof CONST.MENU_ITEM.ICON_VARIANT)[keyof typeof CONST.MENU_ITEM.ICON_VARIANT];

type MenuItemIconProps = {
    /** Icon to display */
    src: IconAsset;

    /** The fill color to pass into the icon. When omitted, the fill follows the row's interaction state
     * (hovered/pressed/focused/disabled), matching the classic MenuItem behavior. */
    fill?: string | ((isHovered: boolean) => string);

    /** Icon width */
    width?: number;

    /** Icon height */
    height?: number;

    /** Icon should be displayed in its own color (e.g. multi-color illustrations) */
    displayInDefaultIconColor?: boolean;

    /** Determines how the icon should be resized to fit its container */
    contentFit?: ImageContentFit;

    /** Container variant. `default` reserves the classic fixed-width cell; `compact` hugs the icon.
     * Rows inside a compact menu are compact regardless of this prop. */
    variant?: MenuItemIconVariant;

    /** Any additional styles to apply to the icon container */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to pass to the icon itself */
    iconStyle?: StyleProp<ViewStyle>;
};

/**
 * The leading icon cell of a `MenuItem.Row`. Reads hover/press/focus state from the menu item
 * context to derive its fill color, exactly like the classic MenuItem left icon.
 */
function MenuItemIcon({
    src,
    fill,
    width,
    height,
    displayInDefaultIconColor = false,
    contentFit = 'cover',
    variant = CONST.MENU_ITEM.ICON_VARIANT.DEFAULT,
    style,
    iconStyle,
}: MenuItemIconProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isHovered, isPressed, isFocused, isDisabled, isInteractive, isSuccess, isCompact} = useMenuItemState();

    let iconFill: string | undefined;
    if (!displayInDefaultIconColor) {
        if (typeof fill === 'function') {
            iconFill = fill(isHovered);
        } else {
            iconFill = fill ?? StyleUtils.getIconFillColor(getButtonState(isFocused || isHovered, isPressed, isSuccess, isDisabled, isInteractive), true, true);
        }
    }

    return (
        <View style={[styles.popoverMenuIcon, (isCompact || variant === CONST.MENU_ITEM.ICON_VARIANT.COMPACT) && styles.popoverMenuIconCompact, style]}>
            <Icon
                contentFit={contentFit}
                hovered={isHovered}
                pressed={isPressed}
                src={src}
                width={width}
                height={height}
                fill={iconFill}
                additionalStyles={iconStyle}
            />
        </View>
    );
}

MenuItemIcon.displayName = 'MenuItemIcon';

export type {MenuItemIconProps};
export default MenuItemIcon;
