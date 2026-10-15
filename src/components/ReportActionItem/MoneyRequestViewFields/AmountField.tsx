import Icon from '@components/Icon';
// Displays the expense amount with its payment status and editing feedback.
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import React from 'react';
import {View} from 'react-native';

import EditableField from './EditableField';

type AmountFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'description' | 'hintText' | 'errorText' | 'copyValue' | 'onPress'> & {
        canEdit?: boolean;
        shouldShowPaid?: boolean;
    };

function AmountField({pendingAction, title, description, hintText, errorText, copyValue, onPress, canEdit, shouldShowPaid}: AmountFieldProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    return (
        <EditableField
            pendingAction={pendingAction}
            name={description ?? ''}
            accessibilityLabel={`${description ?? ''}, ${title ?? ''}`}
            onPress={canEdit ? onPress : undefined}
            isValueSelectable={!!copyValue}
            hintText={hintText}
            error={errorText}
            valueComponent={
                title ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Text
                            variant="h2"
                            numberOfLines={2}
                            dataSet={copyValue ? COPYABLE_TEXT_DATA_SET : undefined}
                        >
                            {title}
                        </Text>
                        {!!shouldShowPaid && <Icon src={icons.Checkmark} />}
                    </View>
                ) : undefined
            }
        >
            {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
        </EditableField>
    );
}

export default AmountField;
