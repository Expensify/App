import CopyTextToClipboard from '@components/CopyTextToClipboard';
import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import {hasHoverSupport} from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type MenuItemCopyButtonProps = {
    /** The value to copy to the clipboard */
    value: string;
};

/**
 * A hover-revealed copy-to-clipboard button for `MenuItem.Trailing` on devices with hover support.
 * On touch devices, wire copying through `onSecondaryInteraction` on the Root instead.
 */
function MenuItemCopyButton({value}: MenuItemCopyButtonProps) {
    const styles = useThemeStyles();
    const {isHovered} = useMenuItemState();

    if (!isHovered || !hasHoverSupport()) {
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

MenuItemCopyButton.displayName = 'MenuItemCopyButton';

export type {MenuItemCopyButtonProps};
export default MenuItemCopyButton;
