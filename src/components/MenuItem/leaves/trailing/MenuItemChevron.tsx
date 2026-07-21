import Icon from '@components/Icon';
import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemChevronProps = {
    /** Overrides the default right arrow icon (e.g. NewWindow for external links) */
    src?: IconAsset;

    /** Any additional styles to apply to the chevron container */
    style?: StyleProp<ViewStyle>;
};

/**
 * The trailing navigation indicator of a `MenuItem.Row`. Renders a right arrow by default,
 * dimmed until the row is hovered — matching the classic MenuItem right icon.
 */
function MenuItemChevron({src, style}: MenuItemChevronProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isHovered, isPressed, isFocused, isDisabled, isInteractive, isSuccess} = useMenuItemState();

    const isDefaultChevron = !src || src === icons.ArrowRight;

    return (
        <View
            style={[
                styles.pointerEventsAuto,
                StyleUtils.getMenuItemIconStyle(true),
                isDisabled && styles.cursorDisabled,
                !isHovered && isDefaultChevron && styles.opacitySemiTransparent,
                styles.alignItemsEnd,
                style,
            ]}
        >
            <Icon
                src={src ?? icons.ArrowRight}
                fill={isDefaultChevron ? theme.icon : StyleUtils.getIconFillColor(getButtonState(isFocused || isHovered, isPressed, isSuccess, isDisabled, isInteractive))}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );
}

MenuItemChevron.displayName = 'MenuItemChevron';

export type {MenuItemChevronProps};
export default MenuItemChevron;
