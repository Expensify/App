import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native-web';
import {useTableContext} from '@components/Table/TableContext';
import TableSearchBar from '@components/Table/TableSearchBar';
import useThemeStyles from '@hooks/useThemeStyles';
import TableFilterTrigger from './FilterTrigger';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;
}>;

export default function TableFilterBar({label, children}: TableFilterBarProps) {
    const styles = useThemeStyles();
    const {filterConfig, activeFilters} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;
    const actionColumnVisible = hasFiltersAvailable || !!children;

    const appliedFilters = Object.entries(activeFilters ?? {}).map(([key, value]) => ({
        key,
        value,
        config: filterConfig?.[key],
    }));

    return (
        <View style={[styles.w100, styles.gap3, styles.pb3, styles.ph5]}>
            <View style={[styles.flexRow, styles.gap3, styles.justifyContentBetween]}>
                <TableSearchBar label={label} />

                {actionColumnVisible && (
                    <View style={[styles.flexRow, styles.gap1]}>
                        <TableFilterTrigger />
                        {children}
                    </View>
                )}
            </View>

            {/* Filters here */}
            {!!appliedFilters.length && (
                <View style={[styles.flexRow, styles.gap2, styles.flexWrap]}>
                    {appliedFilters.map((filter) => (
                        <></>
                    ))}
                </View>
            )}
        </View>
    );
}
