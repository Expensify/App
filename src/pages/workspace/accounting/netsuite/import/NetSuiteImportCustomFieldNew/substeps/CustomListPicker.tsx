import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {NetSuiteCustomListSource} from '@src/types/onyx/Policy';

type CustomListPickerProps = {
    selectedCustomList?: string;
    allCustomLists: NetSuiteCustomListSource[];
    onSubmit: (item: ListItem) => void;
};

function CustomListPicker({selectedCustomList, allCustomLists, onSubmit}: CustomListPickerProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const {sections, headerMessage} = useMemo(() => {
        const customListData = allCustomLists.map((customListRecord) => ({
            text: customListRecord.name,
            value: customListRecord.id,
            isSelected: customListRecord.name === selectedCustomList,
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
        };
    }, [allCustomLists, debouncedSearchValue, translate, selectedCustomList]);

    return (
        <SelectionList
            sections={sections}
            textInputValue={searchValue}
            textInputLabel={allCustomLists.length > CONST.NETSUITE_CONFIG.NETSUITE_CUSTOM_LIST_THRESHOLD ? translate('common.search') : undefined}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
            headerMessage={headerMessage}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={undefined}
            isRowMultilineSupported
        />
    );
}

CustomListPicker.displayName = 'CustomListPicker';
export default CustomListPicker;
