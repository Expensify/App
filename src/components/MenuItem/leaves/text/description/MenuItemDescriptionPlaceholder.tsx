import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

import type MenuItemDescriptionProps from './types';

/** The normal-size description of a `MenuItem.Content`, for a description-only row */
function MenuItemDescriptionPlaceholder({children, numberOfLines = 2}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    useMenuItemAccessibilityLabel('description', String(children));

    return (
        <Text
            style={[styles.textLabelSupporting, StyleUtils.getFontSizeStyle(variables.fontSizeNormal), StyleUtils.getLineHeightStyle(variables.fontSizeNormalHeight), styles.breakWord]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

export default MenuItemDescriptionPlaceholder;
