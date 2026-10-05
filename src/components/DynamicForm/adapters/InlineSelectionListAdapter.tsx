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

type InlineSelectionListAdapterBaseProps = {
    items: Choice[];

    errorText?: string;

    /** Shows a search box above the list, for long option sets such as countries */
    isSearchable?: boolean;

    searchInputLabel?: string;
};

type InlineSelectionListAdapterSingleProps = {
    canSelectMultiple?: false;

    /** Key of the picked option */
    value?: string;

    onInputChange?: (value: string) => void;
};

type InlineSelectionListAdapterMultipleProps = {
    canSelectMultiple: true;

    /** Keys of the picked options */
    value?: string[];

    onInputChange?: (value: string[]) => void;
};

type InlineSelectionListAdapterProps = InlineSelectionListAdapterBaseProps & (InlineSelectionListAdapterSingleProps | InlineSelectionListAdapterMultipleProps);

/** A choice list shown as the page itself, for a choice field that is alone on its page */
function InlineSelectionListAdapter(props: InlineSelectionListAdapterProps) {
    const {items, errorText = '', isSearchable = false, searchInputLabel} = props;
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    let selectedKeys: string[] = [];
    if (props.canSelectMultiple) {
        selectedKeys = Array.isArray(props.value) ? props.value : [];
    } else if (props.value) {
        selectedKeys = [props.value];
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
        if (!props.canSelectMultiple) {
            props.onInputChange?.(key);
            return;
        }
        props.onInputChange?.(selectedKeys.includes(key) ? selectedKeys.filter((selectedKey) => selectedKey !== key) : [...selectedKeys, key]);
    };

    return (
        <>
            <SelectionList
                data={data}
                canSelectMultiple={!!props.canSelectMultiple}
                ListItem={props.canSelectMultiple ? MultiSelectListItem : SingleSelectListItem}
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
