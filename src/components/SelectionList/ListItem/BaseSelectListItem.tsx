import React from 'react';
import {View} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SelectableListItem from './SelectableListItem';
import type {BaseSelectListItemProps, ListItem} from './types';

/**
 * A text-only row with a title and optional subtitle, built on BaseListItem. Serves as the
 * base for SingleSelectListItem and MultiSelectListItem.
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
}: BaseSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const fullTitle = isMultilineSupported ? item.text?.trimStart() : item.text;
    const indentsLength = (item.text?.length ?? 0) - (fullTitle?.length ?? 0);
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;
    const alternateTextMaxWidth = variables.sideBarWidth - styles.ph5.paddingHorizontal * 2 - styles.ml3.marginLeft - variables.iconSizeNormal;

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
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pendingAction={item.pendingAction}
            errors={item.errors}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            accessibilityRole={accessibilityRole}
            selectionButtonPosition={selectionButtonPosition}
        >
            <>
                {!!item.leftElement && item.leftElement}
                <View style={[styles.flex1, styles.alignItemsStart, !!item.rightElement && styles.pr3]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={fullTitle ?? ''}
                        style={[
                            styles.optionDisplayName,
                            isFocusVisible ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                            styles.sidebarLinkTextBold,
                            isMultilineSupported ? styles.preWrap : styles.pre,
                            item.alternateText ? styles.mb1 : null,
                            isDisabled && styles.colorMuted,
                            isMultilineSupported ? {paddingLeft} : null,
                            titleStyles,
                        ]}
                        numberOfLines={isMultilineSupported ? titleNumberOfLines : 1}
                    />

                    {!!item.alternateText && (
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.alternateText}
                            style={[
                                styles.textLabelSupporting,
                                styles.lh16,
                                isAlternateTextMultilineSupported ? styles.preWrap : styles.pre,
                                isAlternateTextMultilineSupported ? {maxWidth: alternateTextMaxWidth} : null,
                            ]}
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
