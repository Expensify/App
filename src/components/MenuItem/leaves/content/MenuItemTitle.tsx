import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

/** The title block of a `MenuItem.Content`. Bold, single line */
function MenuItemTitle(props: MenuItemPrimaryTextProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="top"
            style={styles.textStrong}
        />
    );
}

export default MenuItemTitle;
