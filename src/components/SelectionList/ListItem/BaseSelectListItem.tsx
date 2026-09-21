import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {BaseSelectListItemProps, ListItem} from './types';

import SelectableListItem from './SelectableListItem';

/**
 * A text-only row with a title and optional subtitle. Serves as the base for SingleSelectListItem and MultiSelectListItem.
 */
function BaseSelectListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    isMultilineSupported = false,
    isAlternateTextMultilineSupported = false,
    alternateTextNumberOfLines = 2,
    titleNumberOfLines = 2,
    canSelectMultiple,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    titleStyles,
    shouldHighlightSelectedItem,
    isFocusVisible,
    accessibilityRole,
    selectionButtonPosition,
    leftElement,
}: BaseSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const rowLeftElement = leftElement ?? item.leftElement;
    const fullTitle = isMultilineSupported ? item.text?.trimStart() : item.text;
    const indentsLength = (item.text?.length ?? 0) - (fullTitle?.length ?? 0);
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;
    const alternateTextMaxWidth = variables.sideBarWidth - styles.ph5.paddingHorizontal * 2 - styles.ml3.marginLeft - variables.iconSizeNormal;

    // The primitives default to single-line styles.pre; multiline rows override it with preWrap and the indent padding.
    const titleStyle = [
        isMultilineSupported && styles.preWrap,
        item.alternateText || item.alternateTextComponent ? styles.mb1 : null,
        isDisabled && styles.colorMuted,
        isMultilineSupported ? StyleUtils.getPaddingLeft(paddingLeft) : null,
        titleStyles,
        item.titleStyles,
    ];
    const subtitleStyle = [
        isAlternateTextMultilineSupported && styles.preWrap,
        isAlternateTextMultilineSupported ? StyleUtils.getMaximumWidth(alternateTextMaxWidth) : null,
        isMultilineSupported ? StyleUtils.getPaddingLeft(paddingLeft) : null,
    ];

    return (
        <SelectableListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, wrapperStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            canSelectMultiple={canSelectMultiple}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            accessibilityRole={accessibilityRole}
            selectionButtonPosition={selectionButtonPosition}
        >
            <>
                {rowLeftElement}
                <View style={[styles.flex1, styles.alignItemsStart, !!item.rightElement && styles.pr3]}>
                    <ListItemComposed.Title
                        text={fullTitle ?? ''}
                        style={titleStyle}
                        numberOfLines={isMultilineSupported ? titleNumberOfLines : 1}
                    />

                    {!!item.alternateTextComponent && item.alternateTextComponent}
                    {!item.alternateTextComponent && !!item.alternateText && (
                        <ListItemComposed.Subtitle
                            text={item.alternateText}
                            style={subtitleStyle}
                            numberOfLines={isAlternateTextMultilineSupported ? alternateTextNumberOfLines : 1}
                        />
                    )}
                </View>
                {!!item.rightElement && item.rightElement}
            </>
        </SelectableListItem>
    );
}

export default BaseSelectListItem;
