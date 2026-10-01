import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';
import getPlatform from '@libs/getPlatform';
import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import CONST from '@src/CONST';

import React from 'react';

import type {BaseMenuItemTextProps, MenuItemPrimaryTextProps} from './types';

/** Base of the full-contrast leaves */
function BaseMenuItemPrimaryText({children, accessibilityLabel, numberOfLines = 1, isSelectable = false, slot, style}: MenuItemPrimaryTextProps & BaseMenuItemTextProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemConfig();
    const shouldAllowTextSelection = isSelectable && getPlatform() === CONST.PLATFORM.WEB && !(isInteractive && isDisabled);

    useMenuItemAccessibilityLabel(slot, accessibilityLabel ?? String(children));

    return (
        <Text
            style={[
                styles.flexShrink1,
                styles.popoverMenuText,
                numberOfLines === 1 ? styles.pre : styles.preWrap,
                isInteractive && isDisabled && styles.userSelectNone,
                shouldAllowTextSelection && styles.userSelectText,
                styles.ltr,
                styles.mw100,
                style,
            ]}
            numberOfLines={numberOfLines}
            dataSet={{
                [CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: isInteractive && isDisabled,
                ...(shouldAllowTextSelection ? COPYABLE_TEXT_DATA_SET : {}),
            }}
        >
            {typeof children === 'string' ? convertToLTR(children) : children}
        </Text>
    );
}

export default BaseMenuItemPrimaryText;
