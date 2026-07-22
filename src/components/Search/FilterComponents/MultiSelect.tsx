import ActivityIndicator from '@components/ActivityIndicator';
import type {SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {TextInputOptions} from '@components/SelectionList/types';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ReactNode} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import ListFilterView from './ListFilterViewWrapper';

type MultiSelectItem<T> = {
    text: string;
    value: T;
    icons?: Icon[];
    leftElement?: ReactNode;
    searchableText?: string;
};

type MultiSelectProps<T> = SearchFilterCommonProps<Array<MultiSelectItem<T>>> & {
    /** The list of all items to show up in the list */
    items: Array<MultiSelectItem<T>>;

    /** Whether the search input should be displayed. */
    isSearchable?: boolean;

    /** Search input placeholder. Defaults to 'common.search' when not provided. */
    searchPlaceholder?: string;

    /** Whether the data for the popover is loading */
    loading?: boolean;

    /** Whether to show the loading placeholder */
    shouldShowLoadingPlaceholder?: boolean;
};

function MultiSelect<T extends string>({
    loading,
    shouldShowLoadingPlaceholder,
    value,
    items,
    isSearchable,
    searchPlaceholder,
    selectionListTextInputStyle,
    selectionListStyle,
    autoFocus,
    footer,
    onChange,
}: MultiSelectProps<T>) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedItems, setSelectedItems] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    // Snapshot the values selected when the filter first opened so they can be floated to the top of a long list on
    // first render without repinning rows that are toggled afterwards.
    // moveInitialSelectionToTop gates on the *unfiltered* items length so the decision doesn't flip as the user types,
    // and reordering before filtering keeps the pinned items on top among the results that still match.
    const initialSelectedValues = useInitialValue(() => value.map((item) => item.value));
    const orderedItems = moveInitialSelectionToTop(items, initialSelectedValues);

    const searchLower = debouncedSearchTerm.toLowerCase();
    const filteredItems = isSearchable
        ? orderedItems.filter((item) => item.text.toLowerCase().includes(searchLower) || item.searchableText?.toLowerCase().includes(searchLower))
        : orderedItems;
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

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined,
        onChangeText: setSearchTerm,
        headerMessage,
        style: {
            containerStyle: selectionListTextInputStyle,
        },
        disableAutoFocus: !autoFocus,
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
                    shouldUpdateFocusedIndex
                    shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                    data={listData}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    textInputOptions={textInputOptions}
                    style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                    footerContent={footer}
                />
            )}
        </ListFilterView>
    );
}

export type {MultiSelectItem};
export default MultiSelect;
