import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {BaseMenuItemTextProps, MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

type MenuItemTitleProps = MenuItemPrimaryTextProps & Pick<BaseMenuItemTextProps, 'style'>;

/** The title block of a `MenuItem.Content`. Bold and single line by default */
function MenuItemTitle({style, ...props}: MenuItemTitleProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="top"
            style={[styles.textStrong, style]}
        />
    );
}

export default MenuItemTitle;
