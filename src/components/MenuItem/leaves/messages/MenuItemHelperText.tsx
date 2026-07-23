import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type MenuItemHelperTextProps = {
    /** The helper text */
    children?: ReactNode;

    /** Any additional styles to apply to the helper text */
    style?: StyleProp<TextStyle>;
};

/**
 * Non-interactive helper text. Place it as a sibling AFTER the Root — it lives outside of the
 * pressable/hoverable area and therefore does not consume the menu item context.
 */
function MenuItemHelperText({children, style}: MenuItemHelperTextProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, style]}>{children}</Text>;
}

MenuItemHelperText.displayName = 'MenuItemHelperText';

export type {MenuItemHelperTextProps};
export default MenuItemHelperText;
