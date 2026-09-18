import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type MultiSelectListAdapterProps = {
    items: Array<{value: string; label: string}>;

    /** Selected option keys supplied by the FormProvider */
    value?: string[];

    /** Callback to update the selection in the FormProvider */
    onInputChange?: (value: string[]) => void;

    errorText?: string;
};

function MultiSelectListAdapter({items, value, onInputChange = () => {}, errorText = ''}: MultiSelectListAdapterProps) {
    const styles = useThemeStyles();
    const selected = Array.isArray(value) ? value : [];
    const data: ListItem[] = items.map((item) => ({keyForList: item.value, text: item.label, isSelected: selected.includes(item.value)}));

    const toggle = (item: ListItem) => {
        onInputChange(selected.includes(item.keyForList) ? selected.filter((key) => key !== item.keyForList) : [...selected, item.keyForList]);
    };

    return (
        <>
            <SelectionList
                canSelectMultiple
                data={data}
                ListItem={MultiSelectListItem}
                onSelectRow={toggle}
                onSelectionButtonPress={toggle}
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

export default MultiSelectListAdapter;
