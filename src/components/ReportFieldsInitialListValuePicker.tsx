import React, {useMemo} from 'react';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';

type ReportFieldsInitialListValuePickerProps = {
    /** Options to select from if field is of type list */
    listValues: string[];

    /** Collection of flags that state whether list field options are disabled */
    disabledOptions: boolean[];

    /** Selected value */
    currentValue: string;

    /** Function to call when the user selects a value */
    onValueSelected: (value: string) => void;
};

function ReportFieldsInitialListValuePicker({listValues, disabledOptions, currentValue, onValueSelected}: ReportFieldsInitialListValuePickerProps) {
    const listValueOptions = useMemo(
        () =>
            Object.values(listValues ?? {})
                .filter((listValue, index) => !disabledOptions[index])
                .map((listValue) => ({
                    keyForList: listValue,
                    value: listValue,
                    isSelected: currentValue === listValue,
                    text: listValue,
                })),
        [currentValue, listValues, disabledOptions],
    );

    return (
        <SelectionList
            sections={[{data: listValueOptions}]}
            ListItem={RadioListItem}
            onSelectRow={(item) => onValueSelected(item.value)}
            initiallyFocusedOptionKey={listValueOptions.find((listValue) => listValue.isSelected)?.keyForList}
        />
    );
}

ReportFieldsInitialListValuePicker.displayName = 'ReportFieldsInitialListValuePicker';

export default ReportFieldsInitialListValuePicker;
