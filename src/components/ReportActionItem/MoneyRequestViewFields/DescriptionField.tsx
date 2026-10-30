import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import React from 'react';
import {View} from 'react-native';

import EditableField from './EditableField';

type DescriptionFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'errorText' | 'copyValue' | 'onPress'> & {
        /** A read-only description can still offer a copy action. */
        canEdit: boolean;
    };

function DescriptionField({pendingAction, title, errorText, copyValue, onPress, canEdit}: DescriptionFieldProps) {
    const {translate} = useLocalize();

    return (
        <EditableField
            pendingAction={pendingAction}
            name={translate('common.description')}
            onPress={canEdit ? onPress : undefined}
            isValueSelectable={!!copyValue}
            error={errorText}
            valueComponent={
                title ? (
                    <View dataSet={copyValue ? COPYABLE_TEXT_DATA_SET : undefined}>
                        <MenuItem.FieldValueHTML>{title}</MenuItem.FieldValueHTML>
                    </View>
                ) : undefined
            }
        >
            {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
        </EditableField>
    );
}

export default DescriptionField;
