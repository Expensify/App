import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, SingleSelectListItemProps} from './types';

import SelectableListItem from './SelectableListItem';

/**
 * A standard text row with a title, optional subtitle and an optional (but default) radio button, used in
 * single-choice picker lists (e.g. language, theme, timezone). Also the base of MultiSelectListItem.
 * The text column is preceded by `item.leftElement`, or by a compact avatar of the item's first icon when there is none.
 */
function SingleSelectListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    accessibilityRole,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    onFocus,
    shouldSyncFocus,
    selectionButtonPosition,
    wrapperStyle,
    titleNumberOfLines = 1,
    alternateTextNumberOfLines = 1,
}: SingleSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icon = item.icons?.at(0);
    const isTitleMultiline = titleNumberOfLines > 1;
    const isAlternateTextMultiline = alternateTextNumberOfLines > 1;
    const fullTitle = isTitleMultiline ? item.text?.trimStart() : item.text;
    const indentsLength = (item.text?.length ?? 0) - (fullTitle?.length ?? 0);
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;
    const alternateTextMaxWidth = variables.sideBarWidth - styles.ph5.paddingHorizontal * 2 - styles.ml3.marginLeft - variables.iconSizeNormal;

    // The primitives default to single-line styles.pre; multiline rows override it with preWrap and the indent padding.
    const titleStyle = [
        isTitleMultiline && styles.preWrap,
        item.alternateText || item.alternateTextComponent ? styles.mb1 : null,
        isDisabled && styles.colorMuted,
        isTitleMultiline ? StyleUtils.getPaddingLeft(paddingLeft) : null,
        item.titleStyles,
    ];
    const subtitleStyle = [
        isAlternateTextMultiline && styles.preWrap,
        isAlternateTextMultiline ? StyleUtils.getMaximumWidth(alternateTextMaxWidth) : null,
        isTitleMultiline ? StyleUtils.getPaddingLeft(paddingLeft) : null,
    ];

    return (
        <SelectableListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, wrapperStyle, item.itemStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            canSelectMultiple={canSelectMultiple}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            accessibilityRole={accessibilityRole}
            selectionButtonPosition={selectionButtonPosition}
        >
            <>
                {item.leftElement ??
                    (icon ? (
                        <ListItemComposed.CompactAvatar
                            icon={icon}
                            style={styles.mr3}
                        />
                    ) : undefined)}
                <View style={[styles.flex1, styles.alignItemsStart, !!item.rightElement && styles.pr3]}>
                    <ListItemComposed.Title
                        text={fullTitle ?? ''}
                        style={titleStyle}
                        numberOfLines={titleNumberOfLines}
                    />

                    {!!item.alternateTextComponent && item.alternateTextComponent}
                    {!item.alternateTextComponent && !!item.alternateText && (
                        <ListItemComposed.Subtitle
                            text={item.alternateText}
                            style={subtitleStyle}
                            numberOfLines={alternateTextNumberOfLines}
                        />
                    )}
                </View>
                {!!item.rightElement && item.rightElement}
            </>
        </SelectableListItem>
    );
}

export default SingleSelectListItem;
