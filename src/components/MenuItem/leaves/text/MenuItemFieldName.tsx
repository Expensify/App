import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemSupportingTextProps} from './types';

import BaseMenuItemSupportingText from './BaseMenuItemSupportingText';

/**
 * The name of a form field — the top line of a `MenuItem.Content`, above its
 * `MenuItem.FieldValue`. Use `MenuItem.FieldNamePlaceholder` for the branch where the field has no
 * value yet and the name has to carry the row on its own.
 */
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
