import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import React, {useMemo} from 'react';

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
    // Freeze the value that was selected when this picker opened so the pre-selected option stays pinned to the top for the whole open/focus cycle, even as the live selection changes.
    const initialValue = useInitialSelection(value, {resetOnFocus: true});
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
    const orderedListValueOptions = moveInitialSelectionToTop(listValueOptions, initialValue ? [initialValue] : []);

    return (
        <SelectionList
            data={orderedListValueOptions}
            ListItem={SingleSelectListItem}
            onSelectRow={(item) => onValueChange(item.value)}
            initiallyFocusedItemKey={initialValue}
            shouldSingleExecuteRowSelect
            shouldScrollToFocusedIndexOnMount={false}
            shouldUpdateFocusedIndex
            addBottomSafeAreaPadding
        />
    );
}

export default ReportFieldsInitialListValuePicker;
