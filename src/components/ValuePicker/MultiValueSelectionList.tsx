/** A multi-select list of plain values applied with an Apply button */
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import searchOptions from '@libs/searchOptions';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import StringUtils from '@libs/StringUtils';
import toggleArrayItem from '@libs/toggleArrayItem';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React, {useState} from 'react';

import type {ValuePickerItem} from './types';

type MultiValueSelectionListProps = {
    /** Options, one row each */
    items: ValuePickerItem[];

    /** Values the field holds, checked when the list opens */
    selectedValues: string[];

    /** Whether the list is open. Each time it opens or closes, the unapplied picks are dropped */
    isVisible: boolean;

    /** Called with the checked values when the user applies them, with the Apply button or the Enter key */
    onApply: (values: string[]) => void;

    /** Sentry label of the Apply button, named after the field it applies to */
    applyButtonSentryLabel: SentryLabel;
};

/**
 * A list of plain values the user checks several of, applied together with the Apply button as the attendee list
 * applies its selection. Checking a row only changes the list, so nothing reaches the caller until Apply.
 */
function MultiValueSelectionList({items, selectedValues, isVisible, onApply, applyButtonSentryLabel}: MultiValueSelectionListProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const initialSelectedValues = useInitialSelection(selectedValues, {isVisible});

    // A value missing from items has no row to uncheck, so applying drops it
    const isOffered = (value: string) => items.some((item) => item.value === value);

    // The list may stay mounted while closed, so the picks are dropped each time it opens or closes: picks dismissed
    // without Apply must not come back on the next open.
    const [pickedValues, setPickedValues] = useState<string[]>();
    const [wasVisible, setWasVisible] = useState(isVisible);
    if (wasVisible !== isVisible) {
        setWasVisible(isVisible);
        setPickedValues(undefined);
    }
    // Filtered on every render, so a pick the options dropped while the list was open is not applied either
    const checkedValues = (pickedValues ?? selectedValues).filter(isOffered);

    const options = items.map((item) => ({
        value: item.value ?? '',
        keyForList: item.value ?? '',
        text: item.label ?? '',
        isSelected: checkedValues.includes(item.value ?? ''),
        searchValue: item.searchValue ?? StringUtils.sanitizeString(item.label ?? ''),
    }));
    const isSearchable = items.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const data = searchOptions(debouncedSearchValue, debouncedSearchValue ? options : moveInitialSelectionToTop(options, initialSelectedValues));

    const toggleValue = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        setPickedValues(toggleArrayItem(checkedValues, item.keyForList));
    };

    const applyValues = () => onApply(checkedValues);

    return (
        <SelectionList
            data={data}
            canSelectMultiple
            ListItem={MultiSelectListItem}
            onSelectRow={toggleValue}
            onSelectionButtonPress={toggleValue}
            shouldShowTextInput={isSearchable}
            textInputOptions={{
                label: isSearchable ? translate('common.search') : undefined,
                value: searchValue,
                onChangeText: setSearchValue,
                headerMessage: debouncedSearchValue.trim() && data.length === 0 ? translate('common.noResultsFound') : undefined,
            }}
            searchValueForFocusSync={debouncedSearchValue}
            initiallyFocusedItemKey={initialSelectedValues.at(0)}
            confirmButtonOptions={{onConfirm: applyValues, isFooterConfirmEnabled: true}}
            footerContent={
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={applyValues}
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    sentryLabel={applyButtonSentryLabel}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.apply')}</Button.Text>
                </Button>
            }
            shouldScrollToFocusedIndexOnMount={false}
            disableMaintainingScrollPosition
            shouldShowTooltips={false}
        />
    );
}

export default MultiValueSelectionList;
export type {MultiValueSelectionListProps};
