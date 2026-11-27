import FocusableMenuItem from '@components/FocusableMenuItem';
import type {MenuItemProps} from '@components/MenuItem';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import {View} from 'react-native';

import FABMenuIconTile from './FABMenuIconTile';
import getFABMenuIconTile from './getFABMenuIconTile';
import useFABMenuItem from './useFABMenuItem';
import {getIconTileContentProps, getIconTileRowStyle, shouldDrawIconTile} from './useIconTileMenuItemProps';

type FABFocusableMenuItemProps = Omit<MenuItemProps, 'focused' | 'onFocus' | 'wrapperStyle' | 'shouldCheckActionAllowedOnPress' | 'role' | 'onPress'> &
    WithRequiredSentryLabel & {
        itemId: string;
        isVisible?: boolean;
        onPress?: () => void;
        shouldCallAfterModalHide?: boolean;
    };

function FABFocusableMenuItem({itemId, isVisible = true, onPress, shouldCallAfterModalHide, sentryLabel, ...props}: FABFocusableMenuItemProps) {
    const {itemIndex, isFocused, wrapperStyle, shouldShowIconTiles, setFocusedIndex, onItemPress} = useFABMenuItem(itemId, isVisible);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!isVisible) {
        return null;
    }

    const {icon} = props;
    const iconTileStyle = shouldShowIconTiles ? getFABMenuIconTile(itemId) : undefined;
    // Avatars and icon stacks keep their default rendering, only a single plain icon moves onto the tile.
    const rowIcon = !!icon && typeof icon !== 'string' && !Array.isArray(icon) ? icon : undefined;
    const iconTile =
        iconTileStyle && shouldDrawIconTile(itemId, !!rowIcon) ? (
            <FABMenuIconTile
                tile={iconTileStyle}
                fallbackIcon={rowIcon}
            />
        ) : undefined;

    const menuItem = (
        <FocusableMenuItem
            // FABFocusableMenuItemProps is a strict subset of MenuItemProps — spreading forwards all remaining props safely

            {...(props as MenuItemProps)}
            {...(iconTile
                ? {
                      ...getIconTileContentProps(iconTile, styles),
                      // The divider above the row already adds space, so the section label sits closer to it.
                      // Together with the 17px divider, 6px above and 2px below keep the label section 45px tall, as in the design
                      labelStyle: [styles.pt1half, StyleUtils.getPaddingBottom(2)],
                  }
                : {})}
            sentryLabel={sentryLabel}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            // Unlike the popover menu rows, this row keeps its compact popover styles, which space the quick action description,
            // so the tile height goes into the wrapper style that MenuItem applies after them
            wrapperStyle={iconTile ? [wrapperStyle, getIconTileRowStyle(shouldUseNarrowLayout, styles, StyleUtils)] : wrapperStyle}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            onPress={onPress ? () => onItemPress(onPress, {shouldCallAfterModalHide}) : undefined}
        />
    );

    if (!iconTileStyle?.shouldShowDividerAbove) {
        return menuItem;
    }

    return (
        <>
            <View style={[styles.sectionDividerLine, styles.mh5, styles.mv2]} />
            {menuItem}
        </>
    );
}

export default FABFocusableMenuItem;
