import {useListItemContext, useListItemHovered} from '@components/SelectionList/ListItemContext';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ColorValue} from 'react-native';

/**
 * Resolves the row surface color behind an avatar from the row's visual focus (ListItemContext) and hover
 * (ListItemHoverContext) states, so stacked avatars blend into the row background.
 */
function useListItemBackdropColor(): ColorValue {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isFocusVisible} = useListItemContext();
    const isHovered = useListItemHovered();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const restingColor = isFocusVisible ? focusedBackgroundColor : theme.sidebar;
    return isHovered && !isFocusVisible ? hoveredBackgroundColor : restingColor;
}

export default useListItemBackdropColor;
