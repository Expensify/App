import FormHelpMessage from '@components/FormHelpMessage';
import type {Choice} from '@components/RadioButtons';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useDebouncedState from '@hooks/useDebouncedState';
import useThemeStyles from '@hooks/useThemeStyles';

import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';

import React from 'react';
import {View} from 'react-native';

type InlineSelectionListAdapterProps = {
    items: Choice[];

    /** Several options can be picked, and the value is the list of their keys */
    canSelectMultiple?: boolean;

    /** Picked option key, or keys, supplied by the FormProvider */
    value?: string | string[];

    /** Callback to update the selection in the FormProvider */
    onInputChange?: (value: string | string[]) => void;

    errorText?: string;

    /** Shows a search box above the list, for long option sets such as countries */
    isSearchable?: boolean;

    searchInputLabel?: string;
};

/** A choice list shown as the page itself, for a choice field that is alone on its page */
function InlineSelectionListAdapter({
    items,
    canSelectMultiple = false,
    value,
    onInputChange = () => {},
    errorText = '',
    isSearchable = false,
    searchInputLabel,
}: InlineSelectionListAdapterProps) {
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    let selectedKeys: string[] = [];
    if (Array.isArray(value)) {
        selectedKeys = value;
    } else if (value) {
        selectedKeys = [value];
    }
    const options = items.map((item) => ({
        value: item.value,
        keyForList: item.value,
        text: item.label,
        isSelected: selectedKeys.includes(item.value),
        searchValue: StringUtils.sanitizeString(item.label),
    }));
    const data: ListItem[] = isSearchable ? searchOptions(debouncedSearchValue, options) : options;

    const selectItem = (item: ListItem) => {
        const key = item.keyForList;
        if (!key) {
            return;
        }
        if (!canSelectMultiple) {
            onInputChange(key);
            return;
        }
        onInputChange(selectedKeys.includes(key) ? selectedKeys.filter((selectedKey) => selectedKey !== key) : [...selectedKeys, key]);
    };

    return (
        <>
            <SelectionList
                data={data}
                canSelectMultiple={canSelectMultiple}
                ListItem={canSelectMultiple ? MultiSelectListItem : SingleSelectListItem}
                onSelectRow={selectItem}
                onSelectionButtonPress={selectItem}
                shouldShowTextInput={isSearchable}
                textInputOptions={isSearchable ? {label: searchInputLabel, value: searchValue, onChangeText: setSearchValue} : undefined}
                shouldScrollToFocusedIndexOnMount={false}
            />
            {!!errorText && (
                <View style={styles.ph5}>
                    <FormHelpMessage message={errorText} />
                </View>
            )}
        </>
    );
}

export default InlineSelectionListAdapter;
