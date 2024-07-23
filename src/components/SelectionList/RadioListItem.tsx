import React from 'react';
import {View} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, RadioListItemProps} from './types';

function RadioListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    isMultilineSupported = false,
    onFocus,
    shouldSyncFocus,
}: RadioListItemProps<TItem>) {
    const styles = useThemeStyles();
    const fullTitle = isMultilineSupported ? item.text?.trimStart() : item.text;
    const indentsLength = (item.text?.length ?? 0) - (fullTitle?.length ?? 0);
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, isFocused && styles.sidebarLinkActive]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pendingAction={item.pendingAction}
        >
            <>
                {!!item.leftElement && item.leftElement}
                <View style={[styles.flex1, styles.alignItemsStart]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={fullTitle ?? ''}
                        style={[
                            styles.optionDisplayName,
                            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                            styles.sidebarLinkTextBold,
                            isMultilineSupported ? styles.preWrap : styles.pre,
                            item.alternateText ? styles.mb1 : null,
                            isDisabled && styles.colorMuted,
                            isMultilineSupported ? {paddingLeft} : null,
                        ]}
                        numberOfLines={isMultilineSupported ? 2 : 1}
                    />

                    {!!item.alternateText && (
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.alternateText}
                            style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        />
                    )}
                </View>
                {!!item.rightElement && item.rightElement}
            </>
        </BaseListItem>
    );
}

RadioListItem.displayName = 'RadioListItem';

export default RadioListItem;
