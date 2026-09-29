import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {BaseMenuItemTextProps, MenuItemSupportingTextProps} from './types';

/** Base of the muted leaves */
function BaseMenuItemSupportingText({children, numberOfLines = 2, slot, style}: MenuItemSupportingTextProps & BaseMenuItemTextProps) {
    const styles = useThemeStyles();

    useMenuItemAccessibilityLabel(slot, String(children));

    return (
        <Text
            style={[styles.textLabelSupporting, styles.breakWord, style]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

export default BaseMenuItemSupportingText;
