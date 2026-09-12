import {useListItemContext, useListItemHovered} from '@components/SelectionList/ListItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';

type ListItemAvatarPalette = {
    isFocusVisible: boolean;
    isHovered: boolean;
    sidebarColor: ColorValue;
    focusedBackgroundColor: ColorValue;
    hoveredBackgroundColor: ColorValue;
};

function useListItemAvatarPalette(): ListItemAvatarPalette {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isFocusVisible} = useListItemContext();
    const isHovered = useListItemHovered();

    return {
        isFocusVisible,
        isHovered,
        sidebarColor: theme.sidebar,
        focusedBackgroundColor: styles.sidebarLinkActive.backgroundColor,
        hoveredBackgroundColor: !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar,
    };
}

/**
 * Resolves the subscript avatar border color from the row's visual focus (ListItemContext) and hover
 * (ListItemHoverContext) states, so stacked avatars blend into the row background.
 */
function useListItemSubscriptAvatarBorderColor(): ColorValue {
    const {isFocusVisible, isHovered, sidebarColor, focusedBackgroundColor, hoveredBackgroundColor} = useListItemAvatarPalette();

    const restingBorderColor = isFocusVisible ? focusedBackgroundColor : sidebarColor;
    return isHovered && !isFocusVisible ? hoveredBackgroundColor : restingBorderColor;
}

/**
 * Background/border styles for the secondary avatar container, matching the row background under
 * focus/hover the same way the subscript border color does.
 */
function useListItemSecondaryAvatarContainerStyle(): StyleProp<ViewStyle> {
    const StyleUtils = useStyleUtils();
    const {isFocusVisible, isHovered, sidebarColor, focusedBackgroundColor, hoveredBackgroundColor} = useListItemAvatarPalette();

    return [
        StyleUtils.getBackgroundAndBorderStyle(sidebarColor),
        isFocusVisible ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
        isHovered && !isFocusVisible ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
    ];
}

export {useListItemSubscriptAvatarBorderColor, useListItemSecondaryAvatarContainerStyle};
