import React, {useCallback} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {CheckCircle} from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import RadioListItem from './RadioListItem';
import type {ListItem, SingleSelectListItemProps} from './types';

/**
 * SingleSelectListItem mirrors the behavior of a default radiolistitem, but adds support
 * for the new style of single selection lists.
 */
function SingleSelectListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    isMultilineSupported = false,
    isAlternateTextMultilineSupported = false,
    alternateTextNumberOfLines = 2,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    titleStyles,
}: SingleSelectListItemProps<TItem>) {
    const theme = useTheme();
    const isSelected = item.isSelected;

    const radioCheckboxComponent = useCallback(() => {
        if (!isSelected) {
            return (
                <View
                    style={{
                        height: 18,
                        width: 18,
                        borderWidth: 2,
                        borderColor: theme.buttonHoveredBG,
                        borderRadius: 999,
                    }}
                />
            );
        }

        return (
            <Icon
                src={CheckCircle}
                fill={theme.success}
                width={20}
                height={20}
            />
        );
    }, [isSelected, theme.buttonHoveredBG, theme.success]);

    return (
        <RadioListItem
            item={item}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={radioCheckboxComponent}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={wrapperStyle}
            titleStyles={titleStyles}
        />
    );
}

SingleSelectListItem.displayName = 'SingleSelectListItem';

export default SingleSelectListItem;
