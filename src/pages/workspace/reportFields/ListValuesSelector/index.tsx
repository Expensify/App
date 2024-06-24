import type {ForwardedRef} from 'react';
import React, {forwardRef, useState} from 'react';
import {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {ReportFieldListValues} from '@src/types/form/WorkspaceReportFieldsForm';
import ListValuesSelectorModal from './ListValuesSelectorModal';

type ListValuesSelectorProps = Pick<MenuItemBaseProps, 'label'> & {
    /** Currently selected list values */
    value?: ReportFieldListValues;

    /** Subtitle to display on field */
    subtitle?: string;

    /** Function to call when the user selects list values */
    onInputChange?: (values: ReportFieldListValues) => void;
};

function ListValuesSelector({value, label, subtitle, onInputChange}: ListValuesSelectorProps, forwardedRef: ForwardedRef<View>) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateReportFields = (newReportFieldName: string) => {
        onInputChange?.({
            ...(value ?? {}),
            [newReportFieldName]: {
                name: newReportFieldName,
                disabled: false,
            },
        });
    };

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                description={label}
                onPress={showPickerModal}
            />
            <ListValuesSelectorModal
                isVisible={isPickerVisible}
                label={label ?? ''}
                subtitle={subtitle ?? ''}
                values={value ?? {}}
                onClose={hidePickerModal}
                onValueAdded={updateReportFields}
            />
        </View>
    );
}

ListValuesSelector.displayName = 'ListValuesSelector';

export default forwardRef(ListValuesSelector);
