import CopyTextToClipboard from '@components/CopyTextToClipboard';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';
import {useMenuItemSecondaryInteraction} from '@components/MenuItem/MenuItemSecondaryInteractionContext';

import useThemeStyles from '@hooks/useThemeStyles';

import {hasHoverSupport} from '@libs/DeviceCapabilities';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type MenuItemCopyProps = {
    /** Text put on the clipboard. Pass the displayed value — the row's title is not a fallback */
    value: string;
};

/**
 * Makes the row's value copyable. A hovered read-only row gets a copy button in its trailing cell;
 * a touch device, which has neither hover nor dependable text selection, gets a long press instead.
 *
 * Right-click is left alone on purpose — the value is on the screen, so the browser's own menu
 * still copies it. A row whose value is *not* on the screen, a link row say, wants
 * `MenuItem.Root`'s `onSecondaryInteraction` rather than this.
 *
 * Render it inside `MenuItem.Trailing`, before `MenuItem.Chevron`.
 */
function MenuItemCopy({value}: MenuItemCopyProps) {
    const styles = useThemeStyles();
    const {isInteractive} = useMenuItemConfig();
    const {isHovered} = useMenuItemInteraction();
    const deviceHasHoverSupport = hasHoverSupport();

    useMenuItemSecondaryInteraction(
        deviceHasHoverSupport
            ? undefined
            : (event, anchor) =>
                  showContextMenu({
                      type: CONST.CONTEXT_MENU_TYPES.TEXT,
                      event,
                      selection: value,
                      contextMenuAnchor: anchor,
                  }),
    );

    // The button is a hover affordance, and it would compete with the press target of an interactive row
    if (!deviceHasHoverSupport || isInteractive || !isHovered) {
        return null;
    }

    return (
        <View style={styles.justifyContentCenter}>
            <CopyTextToClipboard
                urlToCopy={value}
                shouldHaveActiveBackground
                iconSize={CONST.ICON_SIZE.EXTRA_SMALL}
                iconStyles={styles.t0}
                styles={styles.reportActionContextMenuMiniButton}
                shouldUseButtonBackground
            />
        </View>
    );
}

export default MenuItemCopy;
export type {MenuItemCopyProps};
