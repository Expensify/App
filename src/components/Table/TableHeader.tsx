import React, {useRef} from 'react';
import {View} from 'react-native';
import type {ViewProps} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {useTableContext} from './TableContext';
import type {TableColumn, TableData} from './types';

/**
 * Number of times a column can be toggled before sorting is reset.
 * Allows user to cycle through: asc -> desc -> reset.
 */
const NUMBER_OF_TOGGLES_BEFORE_RESET = 2;

/**
 * Props for the TableHeader component.
 */
type TableHeaderProps = ViewProps;

/**
 * Renders the table header row with sortable column headers.
 *
 * This component displays all configured columns as pressable headers.
 * Clicking a column header toggles sorting: ascending -> descending -> reset.
 * The currently sorted column displays an arrow icon indicating sort direction.
 *
 * @template DataType - The type of items in the table's data array.
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
function TableHeader<DataType extends TableData, ColumnKey extends string = string>({style, ...props}: TableHeaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {columns, isEmptyResult, title, shouldUseNarrowTableLayout, tableMethods, selectionEnabled, processedData, isMobileSelectionEnabled} = useTableContext<DataType, ColumnKey>();
    const isSelectionCheckboxVisible = selectionEnabled && (isMobileSelectionEnabled || !shouldUseNarrowLayout);

    if (shouldUseNarrowTableLayout && !title) {
        return null;
    }

    if (isEmptyResult || !processedData.length) {
        return null;
    }

    const gridTemplateColumns = columns.map((column) => (column.width ? `${column.width}px` : '1fr'));

    if (isSelectionCheckboxVisible) {
        gridTemplateColumns.unshift(`${variables.tableCheckboxColumnWidth}px`);
    }

    const selectableRows = processedData.filter((row) => !row.disabled);
    let isSelectionIndeterminate = false;
    let isEverySelectableRowSelected = selectableRows.length > 0;

    // We exclude disabled rows from the 'select all' behavior, so if a disabled row is not selected, we still
    // consider all active rows to be selected
    if (isSelectionCheckboxVisible) {
        for (const row of selectableRows) {
            isSelectionIndeterminate = row.selected || isSelectionIndeterminate;
            isEverySelectableRowSelected = row.selected && isEverySelectableRowSelected;
        }
    }

    return (
        <View
            style={[
                styles.pv2,
                styles.ph3,
                styles.mh5,
                styles.appBG,
                styles.borderBottom,
                {borderColor: theme.borderLight},
                styles.tableTopRadius,
                // Flexbox fallback for browsers / native devices wider than 1024px which don't support grid
                styles.dFlex,
                styles.flexRow,
                styles.justifyContentBetween,
                styles.gap3,
                // Use Grid on web when available (will override flex if supported)
                styles.dGrid,
                !shouldUseNarrowTableLayout && {gridTemplateColumns: gridTemplateColumns.join(' ')},
                style,
            ]}
            {...props}
        >
            {shouldUseNarrowTableLayout && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.tableHeaderContentHeight, styles.gap3]}>
                    {!!isSelectionCheckboxVisible && (
                        <Checkbox
                            containerStyle={styles.m0}
                            isChecked={isEverySelectableRowSelected}
                            isIndeterminate={isSelectionIndeterminate && !isEverySelectableRowSelected}
                            onPress={tableMethods.handleSelectAll}
                            accessibilityLabel={translate('workspace.common.selectAll')}
                            style={styles.pl1}
                        />
                    )}

                    <Text
                        numberOfLines={1}
                        color={theme.textSupporting}
                        style={[styles.lh16, styles.textMicroSupporting, styles.pr1]}
                    >
                        {title}
                    </Text>
                </View>
            )}

            {!shouldUseNarrowTableLayout && (
                <>
                    {!!selectionEnabled && (
                        <Checkbox
                            isChecked={isEverySelectableRowSelected}
                            isIndeterminate={isSelectionIndeterminate && !isEverySelectableRowSelected}
                            onPress={tableMethods.handleSelectAll}
                            accessibilityLabel={translate('workspace.common.selectAll')}
                        />
                    )}

                    {columns.map((column) => {
                        return (
                            <TableHeaderColumn
                                column={column}
                                key={column.key}
                            />
                        );
                    })}
                </>
            )}
        </View>
    );
}

/**
 * Renders a single sortable column header.
 *
 * @template DataType - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 */
function TableHeaderColumn<DataType extends TableData, ColumnKey extends string = string>({column}: {column: TableColumn<ColumnKey>}) {
    const theme = useTheme();
    const toggleCount = useRef(0);
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);

    const {
        activeSorting,
        tableMethods: {updateSorting, toggleColumnSorting},
    } = useTableContext<DataType, ColumnKey>();

    const isSortingByColumn = column.key === activeSorting.columnKey;
    const sortIcon = activeSorting.order === 'asc' ? expensifyIcons.ArrowUpLong : expensifyIcons.ArrowDownLong;

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

    const tableHeaderStyles = [
        styles.flexRow,
        styles.alignItemsCenter,
        styles.tableHeaderContentHeight,
        column.styling?.flex ? {flex: column.styling.flex} : styles.flex1,
        column.styling?.containerStyles,
        !column.sortable && styles.cursorDefault,
    ];

    return (
        <PressableWithFeedback
            accessible
            accessibilityLabel={column.label}
            accessibilityRole="button"
            disabled={!column.sortable}
            sentryLabel={CONST.SENTRY_LABEL.TABLE_HEADER.SORTABLE_COLUMN}
            style={tableHeaderStyles}
            onPress={() => toggleSorting(column.key)}
        >
            <Text
                numberOfLines={1}
                color={theme.textSupporting}
                style={[styles.lh16, isSortingByColumn ? styles.textMicroBoldSupporting : styles.textMicroSupporting]}
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
