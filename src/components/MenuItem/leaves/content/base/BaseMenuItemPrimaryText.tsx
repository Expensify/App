import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import React from 'react';

import type {BaseMenuItemTextProps, MenuItemPrimaryTextProps} from './types';

/** Base of the full-contrast leaves */
function BaseMenuItemPrimaryText({children, accessibilityLabel, slot, style}: MenuItemPrimaryTextProps & BaseMenuItemTextProps) {
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

export default BaseMenuItemPrimaryText;
