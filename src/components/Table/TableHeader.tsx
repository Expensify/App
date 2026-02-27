import React, {useRef} from 'react';
import {View} from 'react-native';
import type {ViewProps} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {useTableContext} from './TableContext';
import type {TableColumn} from './types';

/**
 * Number of times a column can be toggled before sorting is reset.
 * Allows user to cycle through: asc -> desc -> reset.
 */
const NUMBER_OF_TOGGLES_BEFORE_RESET = 2;

/**
 * Props for the TableHeader component.
 */
type TableHeaderProps = ViewProps & {
    /** Hide table header when search returns no results. */
    shouldHideHeaderWhenEmptySearch?: boolean;
};

/**
 * Renders the table header row with sortable column headers.
 *
 * This component displays all configured columns as pressable headers.
 * Clicking a column header toggles sorting: ascending -> descending -> reset.
 * The currently sorted column displays an arrow icon indicating sort direction.
 *
 * @template T - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 *
 * @example
 * ```tsx
 * <Table
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   compareItems={compareItems}
 * >
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 */
function TableHeader<T, ColumnKey extends string = string>({style, shouldHideHeaderWhenEmptySearch = true, ...props}: TableHeaderProps) {
    const styles = useThemeStyles();
    const {columns, isEmptyResult} = useTableContext<T, ColumnKey>();

    if (shouldHideHeaderWhenEmptySearch && isEmptyResult) {
        return null;
    }

    return (
        <View
            style={[
                styles.appBG,
                styles.mh5,
                styles.p4,
                // Flexbox fallback for browsers / native devices wider than 1024px which don't support grid
                styles.dFlex,
                styles.flexRow,
                styles.justifyContentBetween,
                styles.gap3,
                // Use Grid on web when available (will override flex if supported)
                styles.dGrid,
                {gridTemplateColumns: `repeat(${columns.length}, 1fr)`},
                style,
            ]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {columns.map((column) => {
                return (
                    <TableHeaderColumn
                        column={column}
                        key={column.key}
                    />
                );
            })}
        </View>
    );
}

/**
 * Renders a single sortable column header.
 *
 * @template T - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 */
function TableHeaderColumn<T, ColumnKey extends string = string>({column}: {column: TableColumn<ColumnKey>}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong'] as const);

    const {
        activeSorting,
        tableMethods: {updateSorting, toggleColumnSorting},
    } = useTableContext<T, ColumnKey>();
    const isSortingByColumn = column.key === activeSorting.columnKey;
    const sortIcon = activeSorting.order === 'asc' ? expensifyIcons.ArrowUpLong : expensifyIcons.ArrowDownLong;

    const toggleCount = useRef(0);

    /**
     * Handles column header press for sorting.
     * Cycles through: first toggle (asc), second toggle (desc), third toggle (reset).
     */
    const toggleSorting = (columnKey: ColumnKey) => {
        if (toggleCount.current >= NUMBER_OF_TOGGLES_BEFORE_RESET) {
            toggleCount.current = 0;
            updateSorting({columnKey: undefined, order: 'asc'});
            return;
        }

        toggleCount.current++;
        toggleColumnSorting(columnKey);
    };

    return (
        <PressableWithFeedback
            accessible
            accessibilityLabel={column.label}
            accessibilityRole="button"
            style={[styles.flexRow, styles.alignItemsCenter, column.styling?.flex ? {flex: column.styling.flex} : styles.flex1, column.styling?.containerStyles]}
            onPress={() => toggleSorting(column.key)}
        >
            <Text
                numberOfLines={1}
                color={theme.textSupporting}
                style={[styles.lh16, isSortingByColumn ? styles.textMicroBoldSupporting : [styles.textMicroSupporting, styles.pr1, styles.tableHeaderIconSpacing]]}
            >
                {column.label}
            </Text>

            {isSortingByColumn && (
                <Icon
                    additionalStyles={styles.ml1}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                    src={sortIcon}
                    fill={theme.icon}
                />
            )}
        </PressableWithFeedback>
    );
}

export default TableHeader;
