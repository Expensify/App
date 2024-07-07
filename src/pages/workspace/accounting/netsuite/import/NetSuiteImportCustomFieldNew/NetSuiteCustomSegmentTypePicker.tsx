import React from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

type NetSuiteCustomListPickerProps = {
    value?: string;
    onInputChange?: (value: string) => void;
};

function NetSuiteCustomSegmentTypePicker({value, onInputChange}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();

    const selectionData = [
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            isSelected: value === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
        },
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.recordTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            isSelected: value === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
        },
    ];

    return (
        <SelectionList
            sections={[{data: selectionData}]}
            onSelectRow={(selected) => (onInputChange ? onInputChange(selected.value) : {})}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={value ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT}
        />
    );
}

NetSuiteCustomSegmentTypePicker.displayName = 'NetSuiteCustomSegmentTypePicker';
export default NetSuiteCustomSegmentTypePicker;
