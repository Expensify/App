import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import type {BaseMenuItemTextProps, MenuItemSupportingTextProps} from './types';

/** Base of the muted leaves */
function BaseMenuItemSupportingText({children, numberOfLines = 2, slot, style}: MenuItemSupportingTextProps & BaseMenuItemTextProps) {
    const styles = useThemeStyles();
    const {shouldAllowTextSelection} = useMenuItemConfig();

    useMenuItemAccessibilityLabel(slot, String(children));

    return (
        <Text
            style={[styles.textLabelSupporting, styles.breakWord, style, shouldAllowTextSelection && styles.userSelectNone]}
            numberOfLines={numberOfLines}
            dataSet={shouldAllowTextSelection ? {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true} : undefined}
        >
            {children}
        </Text>
    );
}

export default BaseMenuItemSupportingText;
