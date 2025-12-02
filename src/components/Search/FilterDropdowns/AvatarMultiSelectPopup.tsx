/**
 * Multi-select popup component for items with avatars (e.g., workspaces).
 * Displays a searchable list of items with avatars and checkboxes.
 * Used by the workspace filter in search to allow selecting multiple workspaces.
 *
 * IMPORTANT: This component uses SelectionListWithSections (not SelectionList) to match the UserSelectPopup pattern.
 * This is required for proper integration with AvatarMultiSelectListItem and ensures consistent behavior
 * with the From filter. The sections-based API is necessary for the canSelectMultiple feature to work correctly.
 */
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionListWithSections';
import type {SectionListDataType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import AvatarMultiSelectListItem from './AvatarMultiSelectListItem';

type AvatarMultiSelectItem<T> = {
    text: string;
    value: T;
    icons: Icon[];
};

type AvatarMultiSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label: string;

    /** The list of all items to show up in the list */
    items: Array<AvatarMultiSelectItem<T>>;

    /** The currently selected items */
    value: Array<AvatarMultiSelectItem<T>>;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: Array<AvatarMultiSelectItem<T>>) => void;

    /**
     * Whether the search input should be displayed.
     * When undefined, the search input will be shown based on CONST.STANDARD_LIST_ITEM_LIMIT (12 items).
     * Set to true to always show search, or false to never show search regardless of item count.
     */
    isSearchable?: boolean;

    /** Search input placeholder. Defaults to 'common.search' when not provided. */
    searchPlaceholder?: string;
};

function AvatarMultiSelectPopup<T extends string>({label, value, items, closeOverlay, onChange, isSearchable, searchPlaceholder}: AvatarMultiSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const [selectedItems, setSelectedItems] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    type ExtendedItem = AvatarMultiSelectItem<T> & {keyForList: string; isSelected?: boolean};

    const sections: Array<SectionListDataType<ExtendedItem>> = useMemo(() => {
        const filteredItems = isSearchable ? items.filter((item) => item.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) : items;

        return [
            {
                data: filteredItems.map((item) => ({
                    ...item,
                    keyForList: item.value,
                    isSelected: !!selectedItems.find((i) => i.value === item.value),
                })),
                shouldShow: true,
            },
        ];
    }, [items, selectedItems, isSearchable, debouncedSearchTerm]);

    const updateSelectedItems = useCallback(
        (item: AvatarMultiSelectItem<T> & {keyForList: string; isSelected?: boolean}) => {
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

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(sections.at(0)?.data?.length ?? 1, windowHeight, isSearchable ?? false)]}>
                <SelectionList
                    canSelectMultiple
                    sections={sections}
                    ListItem={AvatarMultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    textInputLabel={isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined}
                    textInputValue={searchTerm}
                    onChangeText={setSearchTerm}
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

AvatarMultiSelectPopup.displayName = 'AvatarMultiSelectPopup';
export type {AvatarMultiSelectItem};
export default AvatarMultiSelectPopup;
