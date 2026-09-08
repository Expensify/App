import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {fontScale, lineHeightScale} from '@styles/typography';

import React from 'react';

import type MenuItemDescriptionProps from './types';

/** The normal-size description of a `MenuItem.Content`, for a description-only row */
function MenuItemDescriptionPlaceholder({children, numberOfLines = 2}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    useMenuItemAccessibilityLabel('description', String(children));

    return (
        <Text
            style={[styles.textLabelSupporting, StyleUtils.getFontSizeStyle(fontScale.text), StyleUtils.getLineHeightStyle(lineHeightScale.text), styles.breakWord]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

export default MenuItemDescriptionPlaceholder;
