import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

type MenuItemFieldValueProps = MenuItemPrimaryTextProps & {
    /**
     * Whether the value belongs to a field the user cannot change, and so reads in the muted color a disabled
     * text input gives its own value rather than at full contrast.
     */
    isMuted?: boolean;
};

/** Value a field holds */
function MenuItemFieldValue({isMuted = false, ...props}: MenuItemFieldValueProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="bottom"
            style={isMuted ? styles.colorMuted : undefined}
        />
    );
}

export default MenuItemFieldValue;
export type {MenuItemFieldValueProps};
