import React, {Activity, useState} from 'react';
import type {SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem, TextInputOptions} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ListFilterWrapper from './ListFilterViewWrapper';

type SingleSelectItem<T> = {
    text: string;
    value: T;
    searchableText?: string;
};

type SingleSelectProps<T> = SearchFilterCommonProps & {
    /** The list of all items to show up in the list */
    items: Array<SingleSelectItem<T>>;

    /** The currently selected item */
    value: SingleSelectItem<T> | undefined;

    /** Function to call when changes are applied */
    onChange: (item: SingleSelectItem<T> | undefined) => void;

    /** Whether the search input should be displayed */
    isSearchable?: boolean;

    /** Search input place holder */
    searchPlaceholder?: string;

    /** Whether SelectionList of popup should stay mounted when popup is not visible. */
    shouldShowList?: boolean;

    /** Custom height for each item in the list */
    itemHeight?: number;

    /** When true, keep the popover list area at the maximum height while filtering */
    shouldUseFixedPopoverHeight?: boolean;

    allowDeselect?: boolean;
    hasTitle?: boolean;
    hasHeader?: boolean;
};

function SingleSelect<T extends string>({
    value,
    items,
    isSearchable,
    searchPlaceholder,
    selectionListTextInputStyle,
    selectionListStyle,
    shouldShowList = true,
    hasTitle,
    hasHeader,
    itemHeight,
    shouldUseFixedPopoverHeight,
    footer,
    allowDeselect,
    onChange,
}: SingleSelectProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selectedItem, setSelectedItem] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const {options, noResultsFound} = (() => {
        // If the selection is searchable, we push the initially selected item into its own section and display it at the top
        if (isSearchable) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            const initiallySelectedOption =
                value?.text.toLowerCase().includes(searchLower) || value?.searchableText?.toLowerCase().includes(searchLower)
                    ? [{text: value.text, keyForList: value.value, isSelected: selectedItem?.value === value.value}]
                    : [];
            const remainingOptions = items
                .filter((item) => item.value !== value?.value && (item.text.toLowerCase().includes(searchLower) || item.searchableText?.toLowerCase().includes(searchLower)))
                .map((item) => ({
                    text: item.text,
                    keyForList: item.value,
                    isSelected: selectedItem?.value === item.value,
                }));
            const allOptions = [...initiallySelectedOption, ...remainingOptions];
            const isEmpty = allOptions.length === 0;
            return {
                options: allOptions,
                noResultsFound: isEmpty,
            };
        }

        return {
            options: items.map((item) => ({
                text: item.text,
                keyForList: item.value,
                isSelected: item.value === selectedItem?.value,
            })),
            noResultsFound: false,
        };
    })();

    const updateSelectedItem = (item: ListItem<T>) => {
        const newItem = items.find((i) => i.value === item.keyForList);
        if (!newItem) {
            return;
        }

        if (allowDeselect && newItem.value === selectedItem?.value) {
            setSelectedItem(undefined);
            onChange(undefined);
            return;
        }
        setSelectedItem(newItem);
        onChange(newItem);
    };

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined,
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
        style: {
            containerStyle: selectionListTextInputStyle,
        },
    };

    return (
        <ListFilterWrapper
            itemCount={options.length}
            hasHeader={hasHeader}
            hasTitle={hasTitle}
            isSearchable={isSearchable}
            itemHeight={itemHeight ?? variables.optionRowHeight}
            shouldUseFixedPopoverHeight={shouldUseFixedPopoverHeight}
        >
            <Activity mode={shouldShowList ? 'visible' : 'hidden'}>
                <SelectionList
                    data={options}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                    textInputOptions={textInputOptions}
                    style={{
                        contentContainerStyle: [styles.pb0],
                        ...selectionListStyle,
                        listItemWrapperStyle: [itemHeight !== undefined && {minHeight: itemHeight}, selectionListStyle?.listItemWrapperStyle],
                    }}
                    shouldUpdateFocusedIndex={isSearchable}
                    initiallyFocusedItemKey={isSearchable ? value?.value : undefined}
                    shouldShowLoadingPlaceholder={!noResultsFound}
                    footerContent={footer}
                />
            </Activity>
        </ListFilterWrapper>
    );
}

export type {SingleSelectItem};
export default SingleSelect;
