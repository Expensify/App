/** Displays formatted expense descriptions with editing or copy actions. */
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import CONST from '@src/CONST';

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
        <EditableField.Root
            pendingAction={pendingAction}
            onPress={canEdit ? onPress : undefined}
            shouldAllowTextSelection={!!copyValue}
        >
            <MenuItem.Row>
                <MenuItemField.Content name={translate('common.description')}>
                    {title ? (
                        <View dataSet={copyValue ? COPYABLE_TEXT_DATA_SET : undefined}>
                            <MenuItem.FieldValueHTML>{title}</MenuItem.FieldValueHTML>
                        </View>
                    ) : undefined}
                </MenuItemField.Content>
                <EditableField.Actions>
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
                </EditableField.Actions>
            </MenuItem.Row>
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </EditableField.Root>
    );
}

export default DescriptionField;
