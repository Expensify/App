import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native-web';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';
import TableSearchBar from './TableSearchBar';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;
}>;

export default function TableFilterBar({label, children}: TableFilterBarProps) {
    const table = useTableContext();
    const styles = useThemeStyles();

    const hasFiltersAvailable = Object.keys(table.filterConfig ?? {}).length > 0;

    return (
        <View style={[styles.w100, styles.flexRow, styles.gap3, styles.justifyContentBetween, styles.pb3, styles.ph5]}>
            <TableSearchBar label={label} />
            <View style={[styles.flexRow, styles.gap1]}>{children}</View>
        </View>
    );
}
