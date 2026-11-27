import FocusableMenuItem from '@components/FocusableMenuItem';
import type {MenuItemProps} from '@components/MenuItem';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import {View} from 'react-native';

import FABMenuIconTile from './FABMenuIconTile';
import getFABMenuIconTile from './getFABMenuIconTile';
import useFABMenuItem from './useFABMenuItem';

type FABFocusableMenuItemProps = Omit<MenuItemProps, 'focused' | 'onFocus' | 'wrapperStyle' | 'shouldCheckActionAllowedOnPress' | 'role' | 'onPress'> &
    WithRequiredSentryLabel & {
        itemId: string;
        isVisible?: boolean;
        onPress?: () => void | Promise<void>;
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
        iconTileStyle && (iconTileStyle.iconName ?? rowIcon) ? (
            <FABMenuIconTile
                tile={iconTileStyle}
                fallbackIcon={rowIcon}
            />
        ) : undefined;

    const menuItem = (
        <FocusableMenuItem
            // FABFocusableMenuItemProps is a strict subset of MenuItemProps — spreading forwards all remaining props safely

            {...(props as MenuItemProps)}
            // The tile takes the place of the regular icon, so the row drops its own icon and centers the tile next to the text
            {...(iconTile
                ? {
                      icon: undefined,
                      iconWidth: undefined,
                      iconHeight: undefined,
                      displayInDefaultIconColor: false,
                      leftComponent: iconTile,
                      innerContainerStyle: styles.alignItemsCenter,
                      // The divider above the row already adds space, so the section label sits closer to it.
                      // Together with the 17px divider, 6px above and 2px below keep the label section 45px tall, as in the design
                      labelStyle: [styles.pt1half, StyleUtils.getPaddingBottom(2)],
                  }
                : {})}
            sentryLabel={sentryLabel}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            // The row size goes with the wrapper style, which MenuItem applies after its compact popover styles, so the design height holds on every layout
            wrapperStyle={
                iconTile
                    ? [wrapperStyle, StyleUtils.getMinimumHeight(shouldUseNarrowLayout ? variables.optionRowHeight : variables.optionRowHeightCompact), styles.pv0, styles.alignItemsCenter]
                    : wrapperStyle
            }
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
