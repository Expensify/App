import isObject from 'lodash/isObject';
import React, {useMemo, useState} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useLocalize from '@hooks/useLocalize';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import type {DebugForms} from './const';
import {DETAILS_CONSTANT_FIELDS} from './const';

type ConstantPickerProps = {
    formType: string;
    /** The form to object the constant list of options */

    /** Constant name to get list of options */
    fieldName: string;

    /** Current selected constant */
    fieldValue?: string;

    /** Callback to submit the selected constant */
    onSubmit: (item: ListItem) => void;
};

type ConstantPickerItem = ListItem & {
    value: string;
    searchText: string;
};

function ConstantPicker({formType, fieldName, fieldValue, onSubmit}: ConstantPickerProps) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const initialSelectedValues = useInitialSelectionRef(fieldValue ? [fieldValue] : [], {resetOnFocus: true});
    const sections: ConstantPickerItem[] = useMemo(() => {
        const filteredItems = Object.entries(DETAILS_CONSTANT_FIELDS[formType as DebugForms].find((field) => field.fieldName === fieldName)?.options ?? {})
            .reduce((acc: Array<[string, string]>, [key, value]) => {
                // Option has multiple constants, so we need to flatten these into separate options
                if (isObject(value)) {
                    acc.push(...Object.entries(value));
                    return acc;
                }
                acc.push([key, String(value)]);
                return acc;
            }, [])
            .map(
                ([key, value]) =>
                    ({
                        text: value,
                        keyForList: key,
                        value,
                        isSelected: value === fieldValue,
                        searchText: value,
                    }) satisfies ConstantPickerItem,
            )
            .filter(({searchText}) => {
                return tokenizedSearch([{searchText}], searchValue, (item) => [item.searchText]).length > 0;
            });

        if (searchValue || initialSelectedValues.length === 0 || filteredItems.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
            return filteredItems;
        }

        return moveInitialSelectionToTopByValue(filteredItems, initialSelectedValues);
    }, [fieldName, fieldValue, formType, initialSelectedValues, searchValue]);
    const selectedOptionKey = useMemo(() => sections.find((option) => option.searchText === fieldValue)?.keyForList, [sections, fieldValue]);

    const textInputOptions = useMemo(
        () => ({
            value: searchValue,
            label: translate('common.search'),
            onChangeText: setSearchValue,
        }),
        [searchValue, translate, setSearchValue],
    );

    return (
        <SelectionList
            data={sections}
            textInputOptions={textInputOptions}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            initiallyFocusedItemKey={selectedOptionKey}
        />
    );
}

ConstantPicker.default = 'ConstantPicker';

export default ConstantPicker;
export {ConstantPicker};
