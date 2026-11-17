import {useMenuItemAccessibilityLabel, useMenuItemMaskedText} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/CustomEmojiUtils';
import getPlatform from '@libs/getPlatform';
import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

import CONST from '@src/CONST';

import React from 'react';

import type {BaseMenuItemTextProps, MenuItemPrimaryTextProps} from './types';

/** Base of the full-contrast leaves */
function BaseMenuItemPrimaryText({children, accessibilityLabel, numberOfLines = 1, isSelectable = false, slot, style, forwardedFSClass}: MenuItemPrimaryTextProps & BaseMenuItemTextProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemConfig();
    const shouldHideTextFromSelection = isInteractive && isDisabled;
    const shouldAllowTextSelection = isSelectable && getPlatform() === CONST.PLATFORM.WEB && !shouldHideTextFromSelection;
    let selectionDataSet: React.ComponentProps<typeof Text>['dataSet'];
    if (shouldHideTextFromSelection) {
        selectionDataSet = {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true};
    } else if (shouldAllowTextSelection) {
        selectionDataSet = COPYABLE_TEXT_DATA_SET;
    }

    useMenuItemAccessibilityLabel(slot, accessibilityLabel ?? String(children));
    useMenuItemMaskedText(forwardedFSClass);

    const textStyle = [
        styles.flexShrink1,
        styles.popoverMenuText,
        numberOfLines === 1 ? styles.pre : styles.preWrap,
        shouldHideTextFromSelection && styles.userSelectNone,
        shouldAllowTextSelection && styles.userSelectText,
        styles.ltr,
        styles.mw100,
        style,
    ];
    const containsTextAndCustomEmoji = typeof children === 'string' && containsCustomEmoji(children) && !containsOnlyCustomEmoji(children);
    const textContent = typeof children === 'string' ? convertToLTR(children) : children;

    return (
        <Text
            style={textStyle}
            numberOfLines={numberOfLines}
            dataSet={selectionDataSet}
            fsClass={forwardedFSClass}
        >
            {containsTextAndCustomEmoji ? (
                <TextWithEmojiFragment
                    message={convertToLTR(children)}
                    style={textStyle}
                    alignCustomEmoji
                />
            ) : (
                textContent
            )}
        </Text>
    );
}

export default BaseMenuItemPrimaryText;
