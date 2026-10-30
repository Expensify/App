import Icon from '@components/Icon';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import React from 'react';
import {View} from 'react-native';

import EditableField from './EditableField';

type AmountFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'description' | 'hintText' | 'errorText' | 'copyValue' | 'onPress'> & {
        /** Enables the amount editor. Otherwise the value can only be copied. */
        canEdit?: boolean;

        /** Adds a checkmark when the reimbursable expense has been paid. */
        shouldShowPaid?: boolean;
    };

function AmountField({pendingAction, title, description, hintText, errorText, copyValue, onPress, canEdit, shouldShowPaid}: AmountFieldProps) {
    const theme = useTheme();
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
                        {!!shouldShowPaid && (
                            <Icon
                                src={icons.Checkmark}
                                fill={theme.iconSuccessFill}
                            />
                        )}
                    </View>
                ) : undefined
            }
        >
            {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
        </EditableField>
    );
}

export default AmountField;
