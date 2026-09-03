import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

import React from 'react';

import type {MenuItemSupportingTextProps} from './base/types';

import BaseMenuItemSupportingText from './base/BaseMenuItemSupportingText';

/**
 * The name of a form field that has no value yet, standing in for the value it does not have —
 * rendered at value size so the row keeps its height and weight in a list of filled fields.
 */
function MenuItemFieldNamePlaceholder(props: MenuItemSupportingTextProps) {
    const StyleUtils = useStyleUtils();

    return (
        <BaseMenuItemSupportingText
            {...props}
            slot="top"
            style={[StyleUtils.getFontSizeStyle(variables.fontSizeNormal), StyleUtils.getLineHeightStyle(variables.fontSizeNormalHeight)]}
        />
    );
}

export default MenuItemFieldNamePlaceholder;
