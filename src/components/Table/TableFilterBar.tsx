import {PropsWithChildren} from 'react';
import {View} from 'react-native-web';
import useThemeStyles from '@hooks/useThemeStyles';
import Table from '.';
import {useTableContext} from './TableContext';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;
}>;

export default function TableFilterBar({label, children}: TableFilterBarProps) {
    const styles = useThemeStyles();
    const table = useTableContext();

    const hasFiltersAvailable = Object.keys(table.filterConfig ?? {}).length > 0;

    return (
        <View style={[styles.w100, styles.flexRow, styles.gap3, styles.justifyContentBetween]}>
            <Table.SearchBar label={label} />

            <View style={[styles.flexRow, styles.gap1]}>{children}</View>
        </View>
    );
}
