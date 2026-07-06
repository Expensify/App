import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import {useTableContext} from '@components/Table/TableContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

import TableFilterPopoverComponent from './TableFilterPopoverComponent';
import TableFilterTrigger from './TableFilterTrigger';
import TableSearchBar from './TableSearchBar';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;
}>;

export default function TableFilterBar({label, children}: TableFilterBarProps) {
    const styles = useThemeStyles();
    const {filterConfig, tableMethods, activeFilters, originalDataLength, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;
    const actionColumnVisible = hasFiltersAvailable || !!children;

    const appliedFilters = Object.entries(activeFilters ?? {})
        .filter(([, value]) => value.length > 0)
        .map(([key, value]) => {
            const config = filterConfig?.[key];
            const selectedFilterOptions = config?.options.filter((option) => value.includes(option.value)).map((option) => ({label: option.label, value: option.value})) ?? [];
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

    const ActiveFilterChipsComponent = !!appliedFilters.length && (
        <View style={[styles.flexRow, styles.gap2, styles.flexWrap]}>
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
        </View>
    );

    if (!originalDataLength) {
        return null;
    }

    return (
        <View style={[styles.w100, styles.gap3, styles.pb3, styles.ph5]}>
            <View style={[styles.flexRow, styles.gap3, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.gap2, styles.alignItemsCenter]}>
                    <TableSearchBar label={label} />
                    {!shouldUseNarrowTableLayout && ActiveFilterChipsComponent}
                </View>

                {actionColumnVisible && (
                    <View style={[styles.flexRow, styles.gap1]}>
                        <TableFilterTrigger />
                        {children}
                    </View>
                )}
            </View>

            {shouldUseNarrowTableLayout && ActiveFilterChipsComponent}
        </View>
    );
}
