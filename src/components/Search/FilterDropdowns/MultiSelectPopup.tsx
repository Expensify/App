import React, {useCallback, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import BasePopup from './BasePopup';

type MultiSelectItem<T> = {
    text: string;
    value: T;
    icons?: Icon[];
    leftElement?: ReactNode;
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

    /** Whether the data for the popover is loading */
    loading?: boolean;
};

function MultiSelectPopup<T extends string>({label, loading, value, items, closeOverlay, onChange, isSearchable, searchPlaceholder}: MultiSelectPopupProps<T>) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const [selectedItems, setSelectedItems] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const listData: ListItem[] = useMemo(() => {
        const filteredItems = isSearchable ? items.filter((item) => item.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) : items;
        return filteredItems.map((item) => ({
            text: item.text,
            keyForList: item.value,
            isSelected: !!selectedItems.find((i) => i.value === item.value),
            icons: item.icons,
            leftElement: item.leftElement,
        }));
    }, [items, selectedItems, isSearchable, debouncedSearchTerm]);

    const headerMessage = isSearchable && listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const updateSelectedItems = useCallback(
        (item: ListItem) => {
            if (item.isSelected) {
                setSelectedItems((prev) => prev.filter((i) => i.value !== item.keyForList));
                return;
            }

            const newItem = items.find((i) => i.value === item.keyForList);

            if (newItem) {
                setSelectedItems((prev) => [...prev, newItem]);
            }
        },
        [items],
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

    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'MultiSelectPopupDataLoading'};

    const hasTitle = isSmallScreenWidth && !!label;

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_MULTI_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_MULTI_SELECT}
        >
            <View style={[styles.getSelectionListPopoverHeight({itemCount: listData.length || 1, windowHeight, isInLandscapeMode, hasTitle, isSearchable})]}>
                {!!loading && (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                            color={theme.spinner}
                            reasonAttributes={reasonAttributes}
                        />
                    </View>
                )}

                {!loading && (
                    <SelectionList
                        shouldSingleExecuteRowSelect
                        data={listData}
                        ListItem={MultiSelectListItem}
                        onSelectRow={updateSelectedItems}
                        textInputOptions={textInputOptions}
                        style={{contentContainerStyle: [styles.pb0]}}
                    />
                )}
            </View>
        </BasePopup>
    );
}

export type {MultiSelectItem};
export default MultiSelectPopup;
