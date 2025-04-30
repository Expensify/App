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
function SingleSelectListItem<TItem extends ListItem>({item, ...props}: SingleSelectListItemProps<TItem>) {
    const theme = useTheme();
    const isSelected = item.isSelected;

    const rightHandSideComponent = useCallback(() => {
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
            {...props}
            item={item}
            rightHandSideComponent={rightHandSideComponent}
        />
    );
}

SingleSelectListItem.displayName = 'SingleSelectListItem';

export default SingleSelectListItem;
