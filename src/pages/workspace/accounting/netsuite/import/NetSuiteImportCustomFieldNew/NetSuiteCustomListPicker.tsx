import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

type NetSuiteCustomListPickerProps = {
    value?: string;
    policy?: Policy;
    onInputChange?: (value: string, key?: string) => void;
};

function NetSuiteCustomListPicker({value, policy, onInputChange = () => {}}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const {sections, headerMessage, showTextInput} = useMemo(() => {
        const customLists = policy?.connections?.netsuite?.options?.data?.customLists ?? [];
        const customListData = customLists.map((customListRecord) => ({
            text: customListRecord.name,
            value: customListRecord.name,
            isSelected: customListRecord.name === value,
            keyForList: customListRecord.name,
            id: customListRecord.id,
        }));

        const searchRegex = new RegExp(Str.escapeForRegExp(debouncedSearchValue.trim()), 'i');
        const filteredCustomLists = customListData.filter((customListRecord) => searchRegex.test(customListRecord.text ?? ''));
        const isEmpty = debouncedSearchValue.trim() && !filteredCustomLists.length;

        return {
            sections: isEmpty
                ? []
                : [
                      {
                          data: filteredCustomLists,
                      },
                  ],
            headerMessage: isEmpty ? translate('common.noResultsFound') : '',
            showTextInput: customListData.length > CONST.NETSUITE_CONFIG.NETSUITE_CUSTOM_LIST_THRESHOLD,
        };
    }, [debouncedSearchValue, policy?.connections?.netsuite?.options?.data?.customLists, translate, value]);

    const initiallyFocusedOptionKey = useMemo(() => sections?.[0]?.data?.find((record) => record.isSelected)?.keyForList, [sections]);

    return (
        <SelectionList
            sections={sections}
            textInputValue={searchValue}
            textInputLabel={showTextInput ? translate('common.search') : undefined}
            onChangeText={setSearchValue}
            onSelectRow={(selected) => {
                onInputChange(selected.value, selected.id);
            }}
            headerMessage={headerMessage}
            ListItem={RadioListItem}
            isRowMultilineSupported
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
        />
    );
}

NetSuiteCustomListPicker.displayName = 'NetSuiteCustomListPicker';
export default NetSuiteCustomListPicker;
