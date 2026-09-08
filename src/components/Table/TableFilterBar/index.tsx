import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SearchFiltersClearButton from '@components/Search/SearchPageHeader/SearchFiltersClearButton';
import {useTableContext} from '@components/Table/TableContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

import TableDisplaySettingsTrigger, {shouldShowTableDisplaySettingsTrigger} from './TableDisplaySettingsTrigger';
import TableFilterPopoverComponent from './TableFilterPopoverComponent';
import TableFilterTrigger from './TableFilterTrigger';
import TableSearchBar from './TableSearchBar';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;

    /** Whether to show a "Clear" button that resets all active filters. */
    shouldShowClearFiltersButton?: boolean;
}>;

export default function TableFilterBar({label, shouldShowClearFiltersButton, children}: TableFilterBarProps) {
    const styles = useThemeStyles();
    const {filterConfig, tableMethods, activeFilters, onSearchStringChange, columns, narrowLayoutSortColumn, originalDataLength, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;
    const showsDisplaySettingsTrigger = shouldShowTableDisplaySettingsTrigger({columns, shouldUseNarrowTableLayout, narrowLayoutSortColumn});
    const actionColumnVisible = hasFiltersAvailable || showsDisplaySettingsTrigger || !!children;

    const appliedFilters = Object.entries(activeFilters ?? {})
        .filter(([, value]) => !!value?.length)
        .map(([key, value]) => {
            const config = filterConfig?.[key];
            const selectedFilterOptions = config?.options.filter((option) => !!value?.includes(option.value)).map((option) => ({label: option.label, value: option.value})) ?? [];
            const filterValue = selectedFilterOptions.map((option) => option.label);

            return {
                key,
                config,
                value: filterValue,
                label: config?.label ?? key,
                onClosePress: () => {
                    tableMethods.updateFilter({key, value: []});
                },
            };
        });

    const clearAllFilters = () => {
        for (const filter of appliedFilters) {
            tableMethods.updateFilter({key: filter.key, value: []});
        }
        // Also clear the search input so the Clear button resets both the filters and the search text.
        tableMethods.updateSearchString('');
        onSearchStringChange?.('');
    };

    const ActiveFilterChipsComponent = !!appliedFilters.length && (
        <View style={[styles.flexRow, styles.gap2, styles.flexWrap, styles.alignItemsCenter]}>
            {appliedFilters.map((filter) => (
                <DropdownButton
                    key={filter.key}
                    label={filter.label}
                    value={filter.value}
                    wrapperStyle={styles.flex1}
                    PopoverComponent={TableFilterPopoverComponent}
                    onClosePress={filter.onClosePress}
                />
            ))}
            {!!shouldShowClearFiltersButton && <SearchFiltersClearButton onPress={clearAllFilters} />}
        </View>
    );

    if (!originalDataLength) {
        return null;
    }

    return (
        <View style={[styles.w100, styles.gap3, styles.pb3, styles.ph5]}>
            <View style={[styles.flexRow, styles.gap3, styles.justifyContentBetween, shouldUseNarrowTableLayout && styles.alignItemsCenter]}>
                <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.gap2, styles.alignItemsCenter]}>
                    <TableSearchBar label={label} />
                    {!shouldUseNarrowTableLayout && ActiveFilterChipsComponent}
                </View>

                {actionColumnVisible && (
                    <View style={[styles.flexRow, styles.gap1]}>
                        <TableFilterTrigger />
                        <TableDisplaySettingsTrigger />
                        {children}
                    </View>
                )}
            </View>

            {shouldUseNarrowTableLayout && ActiveFilterChipsComponent}
        </View>
    );
}
