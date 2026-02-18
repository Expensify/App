import isObject from 'lodash/isObject';
import React, {useMemo, useState} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import tokenizedSearch from '@libs/tokenizedSearch';
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

function ConstantPicker({formType, fieldName, fieldValue, onSubmit}: ConstantPickerProps) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const sections: ListItem[] = useMemo(
        () =>
            Object.entries(DETAILS_CONSTANT_FIELDS[formType as DebugForms].find((field) => field.fieldName === fieldName)?.options ?? {})
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
                            isSelected: value === fieldValue,
                            searchText: value,
                        }) satisfies ListItem,
                )
                .filter(({searchText}) => {
                    return tokenizedSearch([{searchText}], searchValue, (item) => [item.searchText]).length > 0;
                }),
        [fieldName, fieldValue, formType, searchValue],
    );
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
