import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';

type ReportFieldsInitialListValuePickerProps = {
    /** Options to select from if field is of type list */
    listValues: string[];

    /** Collection of flags that state whether list field options are disabled */
    disabledOptions: boolean[];

    /** Selected value */
    value: string;

    /** Function to call when the user selects a value */
    onValueChange: (value: string) => void;
};

function ReportFieldsInitialListValuePicker({listValues, disabledOptions, value, onValueChange}: ReportFieldsInitialListValuePickerProps) {
    const {localeCompare} = useLocalize();
    const listValueOptions = useMemo(
        () =>
            Object.values(listValues ?? {})
                .filter((listValue, index) => !disabledOptions.at(index))
                .sort(localeCompare)
                .map((listValue) => ({
                    keyForList: listValue,
                    value: listValue,
                    isSelected: value === listValue,
                    text: listValue,
                })),
        [value, listValues, disabledOptions, localeCompare],
    );

    return (
        <SelectionList
            data={listValueOptions}
            ListItem={RadioListItem}
            onSelectRow={(item) => onValueChange(item.value)}
            initiallyFocusedItemKey={listValueOptions.find((listValue) => listValue.isSelected)?.keyForList}
            addBottomSafeAreaPadding
        />
    );
}

export default ReportFieldsInitialListValuePicker;
