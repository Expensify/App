import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useThemeStyles from '@hooks/useThemeStyles';

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
};

/** A choice list shown as the page itself, for a select or multiselect that is the only field on its page */
function InlineSelectionListAdapter({items, canSelectMultiple = false, value, onInputChange = () => {}, errorText = ''}: InlineSelectionListAdapterProps) {
    const styles = useThemeStyles();
    let selected: string[] = [];
    if (Array.isArray(value)) {
        selected = value;
    } else if (typeof value === 'string' && value !== '') {
        selected = [value];
    }
    const data: ListItem[] = items.map((item) => ({keyForList: item.value, text: item.label, isSelected: selected.includes(item.value)}));

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
                shouldShowTextInput={false}
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
