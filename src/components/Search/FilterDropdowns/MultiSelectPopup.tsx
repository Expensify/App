import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type MultiSelectItem<T> = {
    text: string;
    value: T;
    icons?: Icon[];
};

type MultiSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label: string;

    /** The list of all items to show up in the list */
    items: Array<MultiSelectItem<T>>;

    /** The currently selected items */
    value: Array<MultiSelectItem<T>>;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: Array<MultiSelectItem<T>>) => void;

    /** Whether the search input should be displayed. */
    isSearchable?: boolean;

    /** Search input placeholder. Defaults to 'common.search' when not provided. */
    searchPlaceholder?: string;

    /** Whether to move initially selected items to the top on open (no reordering while toggling). */
    shouldMoveSelectedItemsToTopOnOpen?: boolean;
};

function MultiSelectPopup<T extends string>({
    label,
    value,
    items,
    closeOverlay,
    onChange,
    isSearchable,
    searchPlaceholder,
    shouldMoveSelectedItemsToTopOnOpen = false,
}: MultiSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const [selectedItems, setSelectedItems] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const initialSelectedValuesRef = useRef(new Set(value.map((item) => item.value)));

    const listData: ListItem[] = useMemo(() => {
        const filteredItems = isSearchable ? items.filter((item) => item.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) : items;
        const mappedItems = filteredItems.map((item) => ({
            text: item.text,
            keyForList: item.value,
            isSelected: !!selectedItems.find((i) => i.value === item.value),
            icons: item.icons,
        }));

        if (!shouldMoveSelectedItemsToTopOnOpen || mappedItems.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
            return mappedItems;
        }

        const initialSelectedValues = initialSelectedValuesRef.current;
        const initialItems: ListItem[] = [];
        const remainingItems: ListItem[] = [];

        for (const item of mappedItems) {
            if (initialSelectedValues.has(item.keyForList)) {
                initialItems.push(item);
            } else {
                remainingItems.push(item);
            }
        }

        return [...initialItems, ...remainingItems];
    }, [items, selectedItems, isSearchable, debouncedSearchTerm, shouldMoveSelectedItemsToTopOnOpen]);

    const headerMessage = isSearchable && listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const updateSelectedItems = useCallback(
        (item: ListItem) => {
            if (item.isSelected) {
                setSelectedItems(selectedItems.filter((i) => i.value !== item.keyForList));
                return;
            }

            const newItem = items.find((i) => i.value === item.keyForList);

            if (newItem) {
                setSelectedItems([...selectedItems, newItem]);
            }
        },
        [items, selectedItems],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItems);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItems]);

    const resetChanges = useCallback(() => {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);

    const textInputOptions = useMemo(
        () => ({
            value: searchTerm,
            label: isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined,
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [searchTerm, isSearchable, searchPlaceholder, translate, setSearchTerm, headerMessage],
    );

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(listData.length || 1, windowHeight, isSearchable ?? false)]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={listData}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    textInputOptions={textInputOptions}
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

export type {MultiSelectItem};
export default MultiSelectPopup;
