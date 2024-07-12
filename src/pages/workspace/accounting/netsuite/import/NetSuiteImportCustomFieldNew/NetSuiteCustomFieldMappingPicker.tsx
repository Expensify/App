import React from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

type NetSuiteCustomListPickerProps = {
    /** Selected mapping value */
    value?: string;

    /** Callback to fire when mapping is selected */
    onInputChange?: (value: string) => void;
};

function NetSuiteCustomFieldMappingPicker({value, onInputChange}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();

    const options = [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

    const selectionData =
        options.map((option) => ({
            text: translate(`workspace.netsuite.import.importTypes.${option}.label`),
            keyForList: option,
            isSelected: value === option,
            value: option,
            alternateText: translate(`workspace.netsuite.import.importTypes.${option}.description`),
        })) ?? [];

    return (
        <SelectionList
            sections={[{data: selectionData}]}
            onSelectRow={(selected) => {
                onInputChange?.(selected.value);
            }}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={value ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG}
        />
    );
}

NetSuiteCustomFieldMappingPicker.displayName = 'NetSuiteCustomFieldMappingPicker';
export default NetSuiteCustomFieldMappingPicker;
