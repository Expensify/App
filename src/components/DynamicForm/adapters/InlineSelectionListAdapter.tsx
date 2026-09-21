import FormHelpMessage from '@components/FormHelpMessage';
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
    items: Array<{value: string; label: string}>;

    /** Whether several options can be selected; the value is then a list of keys */
    canSelectMultiple?: boolean;

    /** Selected option key or keys supplied by the FormProvider */
    value?: string | string[];

    /** Callback to update the selection in the FormProvider */
    onInputChange?: (value: string | string[]) => void;

    errorText?: string;

    /** Shows a search box above the list, for long option sets such as countries */
    isSearchable?: boolean;

    searchInputLabel?: string;
};

/** A choice list shown as the page itself, for a select or multiselect that is the only field on its page */
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
    let selected: string[] = [];
    if (Array.isArray(value)) {
        selected = value;
    } else if (typeof value === 'string' && value !== '') {
        selected = [value];
    }
    const options = items.map((item) => ({
        value: item.value,
        keyForList: item.value,
        text: item.label,
        isSelected: selected.includes(item.value),
        searchValue: StringUtils.sanitizeString(item.label),
    }));
    const data: ListItem[] = isSearchable ? searchOptions(debouncedSearchValue, options) : options;

    const select = (item: ListItem) => {
        if (!canSelectMultiple) {
            onInputChange(item.keyForList);
            return;
        }
        onInputChange(selected.includes(item.keyForList) ? selected.filter((key) => key !== item.keyForList) : [...selected, item.keyForList]);
    };

    return (
        <>
            <SelectionList
                canSelectMultiple={canSelectMultiple}
                data={data}
                ListItem={canSelectMultiple ? MultiSelectListItem : SingleSelectListItem}
                onSelectRow={select}
                onSelectionButtonPress={select}
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
