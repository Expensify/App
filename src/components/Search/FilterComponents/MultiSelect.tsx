import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import ListFilterView from './ListFilterViewWrapper';

type MultiSelectItem<T> = {
    text: string;
    value: T;
    icons?: Icon[];
    leftElement?: ReactNode;
};

type MultiSelectProps<T> = {
    /** The list of all items to show up in the list */
    items: Array<MultiSelectItem<T>>;

    /** The currently selected items */
    value: Array<MultiSelectItem<T>>;

    /** Function to call when changes are applied */
    onChange: (item: Array<MultiSelectItem<T>>) => void;

    /** Whether the search input should be displayed. */
    isSearchable?: boolean;

    /** Search input placeholder. Defaults to 'common.search' when not provided. */
    searchPlaceholder?: string;

    /** Whether the data for the popover is loading */
    loading?: boolean;
};

function MultiSelect<T extends string>({loading, value, items, isSearchable, searchPlaceholder, onChange}: MultiSelectProps<T>) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedItems, setSelectedItems] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const filteredItems = isSearchable ? items.filter((item) => item.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) : items;
    const listData: ListItem[] = filteredItems.map((item) => ({
        text: item.text,
        keyForList: item.value,
        isSelected: !!selectedItems.find((i) => i.value === item.value),
        icons: item.icons,
        leftElement: item.leftElement,
    }));

    const headerMessage = isSearchable && listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const updateSelectedItems = (item: ListItem) => {
        if (item.isSelected) {
            const newSelectedItems = selectedItems.filter((i) => i.value !== item.keyForList);
            setSelectedItems(newSelectedItems);
            onChange(newSelectedItems);
            return;
        }

        const newItem = items.find((i) => i.value === item.keyForList);

        if (newItem) {
            const newSelectedItems = [...selectedItems, newItem];
            setSelectedItems(newSelectedItems);
            onChange(newSelectedItems);
        }
    };

    const textInputOptions = {
        value: searchTerm,
        label: isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined,
        onChangeText: setSearchTerm,
        headerMessage,
    };

    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'MultiSelectDataLoading'};

    return (
        <ListFilterView
            itemCount={listData.length}
            isSearchable={isSearchable}
        >
            {loading ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                        color={theme.spinner}
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            ) : (
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={listData}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    textInputOptions={textInputOptions}
                    style={{contentContainerStyle: [styles.pb0]}}
                />
            )}
        </ListFilterView>
    );
}

export type {MultiSelectItem};
export default MultiSelect;
