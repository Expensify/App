import {useState} from 'react';
import type {ColorValue, ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type UseOptionRowChromeParams = {
    /** Whether the row is the currently focused/active option. Drives the focused color path. */
    isOptionFocused: boolean;

    /** Display density mode. `COMPACT` switches to the compact layout styles. */
    viewMode: NonNullable<OptionRowLHNProps['viewMode']>;
};

/**
 * Row-level state and layout-skeleton styles for `OptionRowLHN`.
 *
 * Owns the pieces that cannot be pushed into leaves: the hover `useState`, the wrapper
 * `<View>` styles (`sidebarInnerRowStyle`, `contentContainerStyles`) that wrap multiple
 * leaves, and the single `avatarBackgroundColor` derived from hover and focus state.
 *
 * Per-leaf derivations (`isInFocusMode`, `singleAvatarContainerStyle`, `displayNameStyle`)
 * live inside their consuming leaf component (`Avatar`, `Title`) and are not returned here.
 */
function useOptionRowChrome({isOptionFocused, viewMode}: UseOptionRowChromeParams) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [hovered, setHovered] = useState(false);

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;

    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );
    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];

    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    let avatarBackgroundColor: ColorValue = theme.sidebar;
    if (isOptionFocused) {
        avatarBackgroundColor = focusedBackgroundColor;
    } else if (hovered) {
        avatarBackgroundColor = hoveredBackgroundColor;
    }

    return {
        setHovered,
        sidebarInnerRowStyle,
        contentContainerStyles,
        avatarBackgroundColor,
    };
}

export default useOptionRowChrome;
