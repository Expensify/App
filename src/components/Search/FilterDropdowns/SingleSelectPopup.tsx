import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

type SingleSelectItem<T> = {
    text: string;
    value: T;
};

type SingleSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label: string;

    /** The list of all items to show up in the list */
    items: Array<SingleSelectItem<T>>;

    /** The currently selected item */
    value: SingleSelectItem<T> | null;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: SingleSelectItem<T> | null) => void;

    /** Whether the search input should be displayed */
    searchable?: boolean;

    /** Search input place holder */
    searchPlaceholder?: string;
};

function SingleSelectPopup<T extends string>({label, value, items, closeOverlay, onChange, searchable, searchPlaceholder}: SingleSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const selectionListRef = useRef<SelectionListHandle>(null);
    const [selectedItem, setSelectedItem] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const {sections, noResultsFound} = useMemo(() => {
        // If the selection is searchable, we push the selected item into its own section and display it at the top
        if (searchable) {
            const selectedItemSection = selectedItem?.text.toLowerCase().includes(debouncedSearchTerm?.toLowerCase())
                ? [{text: selectedItem.text, keyForList: selectedItem.value, isSelected: true}]
                : [];
            const remainingItemsSection = items
                .filter((item) => item?.value !== selectedItem?.value && item?.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
                .map((item) => ({
                    text: item.text,
                    keyForList: item.value,
                    isSelected: false,
                }));
            const isEmpty = !selectedItemSection.length && !remainingItemsSection.length;
            return {
                sections: isEmpty
                    ? []
                    : [
                          {
                              data: selectedItemSection,
                              shouldShow: selectedItemSection.length > 0,
                              indexOffset: 0,
                          },
                          {
                              data: remainingItemsSection,
                              shouldShow: remainingItemsSection.length > 0,
                              indexOffset: selectedItemSection.length,
                          },
                      ],
                noResultsFound: isEmpty,
            };
        }

        return {
            sections: [
                {
                    data: items.map((item) => ({
                        text: item.text,
                        keyForList: item.value,
                        isSelected: item.value === selectedItem?.value,
                    })),
                },
            ],
            noResultsFound: false,
        };
    }, [searchable, items, selectedItem, debouncedSearchTerm]);

    const updateSelectedItem = useCallback(
        (item: ListItem) => {
            const newItem = items.find((i) => i.value === item.keyForList) ?? null;
            setSelectedItem(newItem);

            // Only searchable selection put focus on the selected item
            if (searchable) {
                selectionListRef?.current?.updateAndScrollToFocusedIndex(0);
            }
        },
        [items, searchable],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItem);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItem]);

    const resetChanges = useCallback(() => {
        onChange(null);
        closeOverlay();
    }, [closeOverlay, onChange]);

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(items.length)]}>
                <SelectionList
                    ref={selectionListRef}
                    shouldSingleExecuteRowSelect
                    sections={sections}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                    textInputValue={searchTerm}
                    onChangeText={setSearchTerm}
                    textInputLabel={searchable ? (searchPlaceholder ?? translate('common.search')) : undefined}
                    shouldDebounceScrolling={searchable}
                    shouldUpdateFocusedIndex={searchable}
                    initiallyFocusedOptionKey={searchable ? value?.value : undefined}
                    headerMessage={noResultsFound ? translate('common.noResultsFound') : undefined}
                    showLoadingPlaceholder={!noResultsFound}
                />
            </View>
            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                />
            </View>
        </View>
    );
}

SingleSelectPopup.displayName = 'SingleSelectPopup';
export type {SingleSelectPopupProps, SingleSelectItem};
export default SingleSelectPopup;
