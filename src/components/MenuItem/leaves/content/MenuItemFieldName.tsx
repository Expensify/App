import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemSupportingTextProps} from './base/types';

import BaseMenuItemSupportingText from './base/BaseMenuItemSupportingText';

/** Name of a filled field */
function MenuItemFieldName(props: MenuItemSupportingTextProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemSupportingText
            {...props}
            slot="top"
            style={styles.textLineHeightNormal}
        />
    );
}

export default MenuItemFieldName;
