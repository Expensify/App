import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

import type {MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

type MenuItemFieldValueProps = MenuItemPrimaryTextProps & {
    /**
     * Whether the value belongs to a field the user cannot change, and so reads in the muted color a disabled
     * text input gives its own value rather than at full contrast.
     */
    isMuted?: boolean;

    /** Typography layered on top of the value's base text, e.g. a headline for a value the row features */
    style?: StyleProp<TextStyle>;
};

/** Value a field holds */
function MenuItemFieldValue({isMuted = false, style, ...props}: MenuItemFieldValueProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="bottom"
            style={[isMuted && styles.colorMuted, style]}
        />
    );
}

export default MenuItemFieldValue;
