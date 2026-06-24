import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native-web';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import {useTableContext} from '@components/Table/TableContext';
import TableSearchBar from '@components/Table/TableSearchBar';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import TableFilterPopoverComponent from './TableFilterPopoverComponent';
import TableFilterTrigger from './TableFilterTrigger';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;
}>;

export default function TableFilterBar({label, children}: TableFilterBarProps) {
    const styles = useThemeStyles();
    const {filterConfig, tableMethods, activeFilters, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;
    const actionColumnVisible = hasFiltersAvailable || !!children;

    const appliedFilters = Object.entries(activeFilters ?? {}).map(([key, value]) => {
        const config = filterConfig?.[key];
        const filterOptions = config?.options.map((option) => ({label: option.label, value: option.value})) ?? [];

        const selectedFilterOptions = (() => {
            if (config?.filterType === CONST.TABLES.FILTER_TYPE.MULTI_SELECT) {
                return filterOptions.filter((option) => Array.isArray(value) && value.includes(option.value));
            }

            if (config?.filterType === CONST.TABLES.FILTER_TYPE.SINGLE_SELECT) {
                const selectedValue = filterOptions.find((option) => option.value === value);
                return selectedValue ? [selectedValue] : null;
            }

            return [];
        })();

        const filterValue = selectedFilterOptions?.map((option) => option.value) ?? null;
        const filterLabel = selectedFilterOptions?.length ? selectedFilterOptions.map((option) => option.label).join(', ') : (config?.label ?? key);

        return {
            key,
            config,
            label: filterLabel,
            value: filterValue,
            onClosePress: () => {
                tableMethods.updateFilter({key, value: null});
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
                    PopoverComponent={TableFilterPopoverComponent}
                    onClosePress={filter.onClosePress}
                />
            ))}
        </View>
    );

    return (
        <View style={[styles.w100, styles.gap3, styles.pb3, styles.ph5]}>
            <View style={[styles.flexRow, styles.gap3, styles.justifyContentBetween]}>
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
