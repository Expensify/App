import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

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
    isSearchable?: boolean;

    /** Search input place holder */
    searchPlaceholder?: string;
};

function SingleSelectPopup<T extends string>({label, value, items, closeOverlay, onChange, isSearchable, searchPlaceholder}: SingleSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const [selectedItem, setSelectedItem] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const {options, noResultsFound} = useMemo(() => {
        // If the selection is searchable, we push the initially selected item into its own section and display it at the top
        if (isSearchable) {
            const initiallySelectedOption = value?.text.toLowerCase().includes(debouncedSearchTerm?.toLowerCase())
                ? [{text: value.text, keyForList: value.value, isSelected: selectedItem?.value === value.value}]
                : [];
            const remainingOptions = items
                .filter((item) => item?.value !== value?.value && item?.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
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
    }, [isSearchable, items, value, selectedItem?.value, debouncedSearchTerm]);

    const updateSelectedItem = useCallback(
        (item: ListItem) => {
            const newItem = items.find((i) => i.value === item.keyForList) ?? null;
            setSelectedItem(newItem);
        },
        [items],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItem);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItem]);

    const resetChanges = useCallback(() => {
        onChange(null);
        closeOverlay();
    }, [closeOverlay, onChange]);

    const textInputOptions = useMemo(
        () => ({
            value: searchTerm,
            label: isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined,
            onChangeText: setSearchTerm,
            headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
        }),
        [searchTerm, isSearchable, searchPlaceholder, translate, setSearchTerm, noResultsFound],
    );

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(options.length || 1, windowHeight, isSearchable ?? false)]}>
                <SelectionList
                    data={options}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                    textInputOptions={textInputOptions}
                    shouldUpdateFocusedIndex={isSearchable}
                    initiallyFocusedItemKey={isSearchable ? value?.value : undefined}
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
