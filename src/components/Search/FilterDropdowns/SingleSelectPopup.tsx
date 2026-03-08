import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type SingleSelectItem<T extends string> = {
    text: string;
    value: T;
};

type SingleSelectSection<T extends string> = Omit<Section<ListItem<T>>, 'data'> & {
    data: Array<SingleSelectItem<T>>;
};

type SingleSelectPopupProps<T extends string> = {
    /** The label to show when in an overlay on mobile */
    label?: string;

    /** The list of all items to show up in the list */
    items: Array<SingleSelectItem<T>>;

    /** Optional sectioned list data used to show grouped items */
    sections?: Array<SingleSelectSection<T>>;

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

    /** The default value to set when reset is clicked */
    defaultValue?: T;
};

function SingleSelectPopup<T extends string>({label, value, items, sections, closeOverlay, onChange, isSearchable, searchPlaceholder, defaultValue}: SingleSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const [selectedItem, setSelectedItem] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const allSelectableItems = useMemo(() => sections?.flatMap((section) => section.data) ?? items, [sections, items]);

    const {options, sectionedOptions, noResultsFound} = useMemo(() => {
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
                sectionedOptions: undefined,
                noResultsFound: isEmpty,
            };
        }

        if (sections) {
            const mappedSections: Array<Section<ListItem<T>>> = sections.map((section) => ({
                ...section,
                data: section.data.map((item) => ({
                    text: item.text,
                    keyForList: item.value,
                    isSelected: item.value === selectedItem?.value,
                })),
            }));

            return {
                options: [],
                sectionedOptions: mappedSections,
                noResultsFound: mappedSections.every((section) => section.data.length === 0),
            };
        }

        return {
            options: items.map((item) => ({
                text: item.text,
                keyForList: item.value,
                isSelected: item.value === selectedItem?.value,
            })),
            sectionedOptions: undefined,
            noResultsFound: false,
        };
    }, [isSearchable, items, value, selectedItem?.value, debouncedSearchTerm, sections]);

    const updateSelectedItem = useCallback(
        (item: ListItem) => {
            const newItem = allSelectableItems.find((i) => i.value === item.keyForList) ?? null;
            setSelectedItem(newItem);
        },
        [allSelectableItems],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItem);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItem]);

    const resetChanges = useCallback(() => {
        onChange(defaultValue ? (allSelectableItems.find((item) => item.value === defaultValue) ?? null) : null);
        closeOverlay();
    }, [closeOverlay, onChange, defaultValue, allSelectableItems]);

    const textInputOptions = useMemo(
        () => ({
            value: searchTerm,
            label: isSearchable ? (searchPlaceholder ?? translate('common.search')) : undefined,
            onChangeText: setSearchTerm,
            headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
        }),
        [searchTerm, isSearchable, searchPlaceholder, translate, setSearchTerm, noResultsFound],
    );

    const shouldShowLabel = isSmallScreenWidth && !!label;
    const optionsCount = Math.max(
        1,
        sectionedOptions
            ? sectionedOptions.reduce((count, section) => {
                  const hasHeader = section.data.length > 0 && (!!section.title || !!section.customHeader);
                  return count + section.data.length + (hasHeader ? 1 : 0);
              }, 0)
            : options.length,
    );

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {shouldShowLabel && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(optionsCount, windowHeight, isSearchable ?? false)]}>
                {sectionedOptions ? (
                    <SelectionListWithSections
                        sections={sectionedOptions}
                        shouldSingleExecuteRowSelect
                        ListItem={SingleSelectListItem}
                        onSelectRow={updateSelectedItem}
                        textInputOptions={textInputOptions}
                        shouldUpdateFocusedIndex={isSearchable}
                        initiallyFocusedItemKey={isSearchable ? value?.value : undefined}
                        shouldShowLoadingPlaceholder={!noResultsFound}
                    />
                ) : (
                    <SelectionList
                        data={options}
                        shouldSingleExecuteRowSelect
                        ListItem={SingleSelectListItem}
                        onSelectRow={updateSelectedItem}
                        textInputOptions={textInputOptions}
                        shouldUpdateFocusedIndex={isSearchable}
                        initiallyFocusedItemKey={isSearchable ? value?.value : undefined}
                        shouldShowLoadingPlaceholder={!noResultsFound}
                    />
                )}
            </View>
            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
                />
            </View>
        </View>
    );
}

export type {SingleSelectPopupProps, SingleSelectItem, SingleSelectSection};
export default SingleSelectPopup;
