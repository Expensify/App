import useStyleUtils from '@hooks/useStyleUtils';

import {fontScale, lineHeightScale} from '@styles/typography';

import CONST from '@src/CONST';

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
            style={[StyleUtils.getFontSizeStyle(fontScale.text), StyleUtils.getLineHeightStyle(lineHeightScale.text)]}
            // A field's name is not user data, so it stays readable in session recordings even inside a masked container
            forwardedFSClass={props.forwardedFSClass ?? CONST.FULLSTORY.CLASS.UNMASK}
        />
    );
}

export default MenuItemFieldNamePlaceholder;
