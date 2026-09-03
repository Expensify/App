import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

import React from 'react';

import type {MenuItemSupportingTextProps} from './base/types';

import BaseMenuItemSupportingText from './base/BaseMenuItemSupportingText';

/** Name of an empty field, standing in for the missing value */
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
