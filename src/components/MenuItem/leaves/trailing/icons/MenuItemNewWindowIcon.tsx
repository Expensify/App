import Icon from '@components/Icon';
import {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityAnnouncement} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

/**
 * The trailing "opens in a new tab" indicator of a `MenuItem.Row`. Unlike the chevron it stays at
 * full opacity and brightens with the row, and it announces that pressing the row leaves the app
 */
function MenuItemNewWindowIcon() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow']);
    const {isDisabled, isInteractive} = useMenuItemConfig();
    const {isHovered, isPressed} = useMenuItemInteraction();

    useMenuItemAccessibilityAnnouncement(MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.OPENS_IN_NEW_TAB, translate('common.opensInNewTab'));

    return (
        <View style={[styles.menuItemTrailingIcon, isDisabled && styles.cursorDisabled]}>
            <Icon
                src={icons.NewWindow}
                fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered, isPressed, isDisabled, isInteractive})})}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );
}

export default MenuItemNewWindowIcon;
