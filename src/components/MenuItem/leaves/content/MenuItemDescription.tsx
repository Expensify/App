import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemSupportingTextProps} from './base/types';

import BaseMenuItemSupportingText from './base/BaseMenuItemSupportingText';

/** Supporting text under a `MenuItem.Title` — the bottom line of a `MenuItem.Content` */
function MenuItemDescription(props: MenuItemSupportingTextProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemSupportingText
            {...props}
            slot="bottom"
            style={styles.textLineHeightNormal}
        />
    );
}

export default MenuItemDescription;
