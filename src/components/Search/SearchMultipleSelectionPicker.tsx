import React, {useState} from 'react';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import {reorderItemsByInitialSelection} from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SearchMultipleSelectionPickerItem = {
    name: string;
    value: string | string[];
    leftElement?: React.ReactNode;
};

type SearchMultipleSelectionPickerProps = {
    items: SearchMultipleSelectionPickerItem[];
    initiallySelectedItems: SearchMultipleSelectionPickerItem[] | undefined;
    pickerTitle?: string;
    onSaveSelection: (values: string[]) => void;
    shouldShowTextInput?: boolean;
};

function SearchMultipleSelectionPicker({items, initiallySelectedItems, pickerTitle, onSaveSelection, shouldShowTextInput = true}: SearchMultipleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const [selectedItemIDs, setSelectedItemIDs] = useState(() => new Set((initiallySelectedItems ?? []).map((item) => item.value.toString())));
    const initialSelectedValues = useInitialSelectionRef(
        (initiallySelectedItems ?? []).map((item) => item.value.toString()),
        {resetOnFocus: true},
    );

    const searchLower = debouncedSearchTerm.toLowerCase();
    const sortByValue = (a: {value: string | string[]}, b: {value: string | string[]}) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare);
    const mappedItems: Array<{text: string; keyForList: string; isSelected: boolean; value: string | string[]; leftElement?: React.ReactNode}> = items
        .filter((item) => item.name.toLowerCase().includes(searchLower))
        .map((item) => ({
            text: item.name,
            keyForList: item.value.toString(),
            isSelected: selectedItemIDs.has(item.value.toString()),
            value: item.value,
            leftElement: item.leftElement,
        }))
        .sort(sortByValue);

    const shouldReorderInitialSelection = !searchLower && initialSelectedValues.length > 0 && mappedItems.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;
    const orderedItems = shouldReorderInitialSelection ? reorderItemsByInitialSelection(mappedItems, initialSelectedValues) : mappedItems;
    const initialSelectedSet = new Set(initialSelectedValues);
    const initiallySelectedSectionData = orderedItems.filter((item) => initialSelectedSet.has(item.keyForList));
    const remainingSectionData = orderedItems.filter((item) => !initialSelectedSet.has(item.keyForList));
    const noResultsFound = orderedItems.length === 0;
    let sections:
        | Array<{
              title: string | undefined;
              data: typeof orderedItems;
              sectionIndex: number;
          }>
        | [] = [];

    if (!noResultsFound && !shouldReorderInitialSelection) {
        sections = [
            {
                title: pickerTitle,
                data: orderedItems,
                sectionIndex: 0,
            },
        ];
    }

    if (!noResultsFound && shouldReorderInitialSelection) {
        sections = [
            {
                title: undefined,
                data: initiallySelectedSectionData,
                sectionIndex: 0,
            },
            {
                title: pickerTitle,
                data: remainingSectionData,
                sectionIndex: 1,
            },
        ];
    }

    const onSelectItem = (item: Partial<OptionData & SearchMultipleSelectionPickerItem>) => {
        if (!item.text || !item.keyForList || !item.value) {
            return;
        }
        const id = item.value.toString();
        setSelectedItemIDs((prev) => {
            const next = new Set(prev);
            if (item.isSelected) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const resetChanges = () => {
        setSelectedItemIDs(new Set());
    };

    const applyChanges = () => {
        onSaveSelection(items.filter((item) => selectedItemIDs.has(item.value.toString())).flatMap((item) => item.value));
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };
    return (
        <SelectionListWithSections
            sections={sections}
            ListItem={MultiSelectListItem}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            onSelectRow={onSelectItem}
            shouldShowLoadingPlaceholder={!noResultsFound}
            shouldStopPropagation
            shouldShowTooltips
            canSelectMultiple
            footerContent={
                <SearchFilterPageFooterButtons
                    applyChanges={applyChanges}
                    resetChanges={resetChanges}
                />
            }
            shouldScrollToTopOnSelect={false}
        />
    );
}

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
