import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type MenuItemDescriptionProps from './types';

/** The small supporting-label description of a `MenuItem.Content`, for a description that sits under a title */
function MenuItemDescription({children, numberOfLines = 2}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();

    useMenuItemAccessibilityLabel('description', String(children));

    return (
        <Text
            style={[styles.textLabelSupporting, styles.textLineHeightNormal, styles.breakWord]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

export default MenuItemDescription;
