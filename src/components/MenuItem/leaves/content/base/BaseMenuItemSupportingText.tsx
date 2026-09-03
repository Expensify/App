import type {MenuItemLabelSlot} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

import type {MenuItemSupportingTextProps} from './types';

type BaseMenuItemSupportingTextProps = MenuItemSupportingTextProps & {
    /** Which line of the row this leaf occupies, so the row announces its text in visual order */
    slot: MenuItemLabelSlot;

    /** Typography layered on top of the shared base — each leaf brings its own size and line height */
    style?: StyleProp<TextStyle>;
};

/**
 * Everything the supporting text leaves of a `MenuItem.Content` have in common — the muted, smaller type
 * face, word wrapping and label registration. Each leaf layers its own size and line height on top.
 */
function BaseMenuItemSupportingText({children, numberOfLines = 2, slot, style}: BaseMenuItemSupportingTextProps) {
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
