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
    /** Text put on the clipboard */
    value: string;
};

/**
 * Makes the row's value copyable: a copy button on a hovered read-only row, a long press on touch,
 * where there is no hover and no dependable text selection. Right-click is left to the browser, whose
 * own menu already copies the value off the screen.
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
