import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native-web';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
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
    const {filterConfig, activeFilters, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;
    const actionColumnVisible = hasFiltersAvailable || !!children;

    const appliedFilters = Object.entries(activeFilters ?? {}).map(([key, value]) => ({
        key,
        value,
        config: filterConfig?.[key],
    }));

    const ActiveFilterChipsComponent = !!appliedFilters.length && (
        <View style={[styles.flexRow, styles.gap2, styles.flexWrap]}>
            {appliedFilters.map((filter) => (
                <DropdownButton
                    key={filter.key}
                    label={'Hello World'}
                    value={''}
                    PopoverComponent={() => <></>}
                    onClosePress={() => {}}
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
