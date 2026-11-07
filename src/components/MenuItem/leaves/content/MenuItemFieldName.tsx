import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

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
            // A field's name is not user data, so it stays readable in session recordings even inside a masked container
            forwardedFSClass={props.forwardedFSClass ?? CONST.FULLSTORY.CLASS.UNMASK}
        />
    );
}

export default MenuItemFieldName;
