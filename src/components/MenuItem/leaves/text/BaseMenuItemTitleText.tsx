import type {MenuItemLabelSlot} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

import type {MenuItemTitleTextProps} from './types';

type BaseMenuItemTitleTextProps = MenuItemTitleTextProps & {
    /** Which line of the row this leaf occupies, so the row announces its text in visual order */
    slot: MenuItemLabelSlot;

    /** Typography layered on top of the shared base — each leaf brings its own weight */
    style?: StyleProp<TextStyle>;
};

/** Everything the single-line text leaves have in common — the shared type face, LTR handling and label registration */
function BaseMenuItemTitleText({children, accessibilityLabel, slot, style}: BaseMenuItemTitleTextProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemConfig();

    useMenuItemAccessibilityLabel(slot, accessibilityLabel ?? String(children));

    return (
        <Text
            style={[styles.flexShrink1, styles.popoverMenuText, styles.pre, isInteractive && isDisabled && styles.userSelectNone, styles.ltr, styles.mw100, style]}
            numberOfLines={1}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: isInteractive && isDisabled}}
        >
            {typeof children === 'string' ? convertToLTR(children) : children}
        </Text>
    );
}

export default BaseMenuItemTitleText;
