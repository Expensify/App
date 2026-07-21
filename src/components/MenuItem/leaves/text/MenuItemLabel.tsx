import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemLabelProps = {
    /** The label text */
    children?: string;

    /** Any additional styles to apply to the label container */
    style?: StyleProp<ViewStyle>;
};

/**
 * A small supporting label. Place it inside the Root (before `MenuItem.Row`) to render it above the
 * main line within the pressable/hoverable area, or before the Root to keep it outside of it.
 */
function MenuItemLabel({children, style}: MenuItemLabelProps) {
    const styles = useThemeStyles();

    return (
        <View style={style}>
            <Text style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}>{children}</Text>
        </View>
    );
}

MenuItemLabel.displayName = 'MenuItemLabel';

export type {MenuItemLabelProps};
export default MenuItemLabel;
