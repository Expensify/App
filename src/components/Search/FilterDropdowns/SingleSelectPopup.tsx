import React, {Activity, useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem, SelectionListStyle} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import BasePopup from './BasePopup';

type SingleSelectItem<T> = {
    text: string;
    value: T;
};

type SingleSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label?: string;

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

    /** The default value to set when reset is clicked */
    defaultValue?: string;

    style?: StyleProp<ViewStyle>;

    /** Custom styles for the SelectionList */
    selectionListStyle?: SelectionListStyle;

    /** Whether SelectionList of popup should stay mounted when popup is not visible. */
    shouldShowList?: boolean;
};

function SingleSelectPopup<T extends string>({
    label,
    value,
    items,
    closeOverlay,
    onChange,
    isSearchable,
    searchPlaceholder,
    defaultValue,
    style,
    selectionListStyle,
    shouldShowList = true,
}: SingleSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
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
        onChange(defaultValue ? (items.find((item) => item.value === defaultValue) ?? null) : null);
        closeOverlay();
    }, [closeOverlay, onChange, defaultValue, items]);

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

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
            style={style}
        >
            <View style={[styles.getSelectionListPopoverHeight(options.length || 1, windowHeight, isSearchable ?? false, isInLandscapeMode, shouldShowLabel)]}>
                <Activity mode={shouldShowList ? 'visible' : 'hidden'}>
                    <SelectionList
                        data={options}
                        shouldSingleExecuteRowSelect
                        ListItem={SingleSelectListItem}
                        onSelectRow={updateSelectedItem}
                        textInputOptions={textInputOptions}
                        style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                        shouldUpdateFocusedIndex={isSearchable}
                        initiallyFocusedItemKey={isSearchable ? value?.value : undefined}
                        shouldShowLoadingPlaceholder={!noResultsFound}
                    />
                </Activity>
            </View>
        </BasePopup>
    );
}

export type {SingleSelectPopupProps, SingleSelectItem};
export default SingleSelectPopup;
