import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

import type {MenuItemSupportingTextProps} from './base/types';

import BaseMenuItemSupportingText from './base/BaseMenuItemSupportingText';

type MenuItemFieldNameProps = MenuItemSupportingTextProps & {
    /** Typography layered on top of the label's base text, e.g. to match a form input's label. */
    style?: StyleProp<TextStyle>;
};

/** Name of a filled field */
function MenuItemFieldName({style, ...props}: MenuItemFieldNameProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemSupportingText
            {...props}
            slot="top"
            style={[styles.textLineHeightNormal, style]}
            // A field's name is not user data, so it stays readable in session recordings even inside a masked container
            forwardedFSClass={props.forwardedFSClass ?? CONST.FULLSTORY.CLASS.UNMASK}
        />
    );
}

export default MenuItemFieldName;
