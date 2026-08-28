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

import type {ViewProps} from 'react-native';

import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import type {TableColumn, TableData} from './types';

import getGridTemplateColumns from './getGridTemplateColumns';
import {getColumnHeaderAccessibilityProps, getRowAccessibilityProps, shouldUseTableSemantics} from './tableAccessibility';
import {useTableContext} from './TableContext';

/**
 * Number of times a column can be toggled before sorting is reset.
 * Allows user to cycle through: asc -> desc -> reset.
 */
const NUMBER_OF_TOGGLES_BEFORE_RESET = 2;

/**
 * Props for the TableHeader component.
 */
type TableHeaderProps = ViewProps & {
    /** Whether this header is rendered as a sticky FlashList item. */
    isStickyListHeader?: boolean;

    /** Whether this duplicate sticky-header render must be hidden and removed from keyboard focus. */
    isAccessibilityHidden?: boolean;
};

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
function TableHeader<DataType extends TableData, ColumnKey extends string = string>({style, isStickyListHeader = false, isAccessibilityHidden = false, ...props}: TableHeaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {
        columns,
        isEmptyResult,
        title,
        shouldUseNarrowTableLayout,
        tableMethods,
        selectionEnabled,
        processedData,
        isMobileSelectionEnabled,
        shouldEnableSelectionInNarrowPaneModal,
        dynamicGridTemplateColumns,
    } = useTableContext<DataType, ColumnKey>();
    // Tables inside a narrow pane modal (RHP) opt into keying the header checkbox off the real screen size, since
    // shouldUseNarrowLayout is always true in an RHP. Other tables keep the original behavior. Visual padding below still uses shouldUseNarrowLayout.
    const selectionUsesNarrowLayout = shouldEnableSelectionInNarrowPaneModal ? isSmallScreenWidth : shouldUseNarrowLayout;
    const isSelectionCheckboxVisible = selectionEnabled && (isMobileSelectionEnabled || !selectionUsesNarrowLayout);
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);
    const inertProps = isAccessibilityHidden ? {inert: true} : {};

    if (shouldUseNarrowTableLayout && !title) {
        return null;
    }

    if (isEmptyResult || !processedData.length) {
        return null;
    }

    // The tracks resolved from the columns' content are shared by the header and every row, so they take precedence over
    // the static ones. They're only ever set on wide web layouts.
    const gridTemplateColumns = dynamicGridTemplateColumns ? [...dynamicGridTemplateColumns] : getGridTemplateColumns(columns);

    if (isSelectionCheckboxVisible) {
        gridTemplateColumns.unshift(`${variables.tableCheckboxColumnWidth}px`);
    }

    const selectableRows = processedData.filter((row) => !row.disabled && !row.isSelectionDisabled);
    const hasSelectableRows = selectableRows.length > 0;
    let isSelectionIndeterminate = false;
    let isEverySelectableRowSelected = hasSelectableRows;

    // We exclude disabled rows from the 'select all' behavior, so if a disabled row is not selected, we still
    // consider all active rows to be selected
    if (isSelectionCheckboxVisible) {
        for (const row of selectableRows) {
            isSelectionIndeterminate = !!row.selected || isSelectionIndeterminate;
            isEverySelectableRowSelected = !!row.selected && isEverySelectableRowSelected;
        }
    }

    const header = (
        <View
            style={[
                styles.pv2,
                styles.mh5,
                styles.highlightBG,
                styles.borderBottom,
                styles.tableTopRadius,
                shouldUseNarrowLayout && !isSelectionCheckboxVisible ? styles.ph4 : styles.ph3,
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
            {...getRowAccessibilityProps(isTableSemanticsEnabled, 0, true)}
            {...props}
            {...inertProps}
        >
            {shouldUseNarrowTableLayout && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.tableHeaderContentHeight, styles.gap3]}>
                    {!!isSelectionCheckboxVisible && (
                        <Checkbox
                            containerStyle={styles.m0}
                            disabled={isAccessibilityHidden || !hasSelectableRows}
                            isChecked={isEverySelectableRowSelected}
                            isIndeterminate={isSelectionIndeterminate && !isEverySelectableRowSelected}
                            onPress={tableMethods.handleSelectAll}
                            accessibilityLabel={translate('workspace.common.selectAll')}
                            tabIndex={isAccessibilityHidden ? -1 : undefined}
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
                        // When semantics apply, this is exposed as the first (non-sortable) column header so the header
                        // column count matches the data rows, which include the selection checkbox cell. The
                        // accessibility props are empty otherwise, leaving the checkbox's layout unchanged.
                        <View {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, 1)}>
                            <Checkbox
                                disabled={isAccessibilityHidden || !hasSelectableRows}
                                isChecked={isEverySelectableRowSelected}
                                isIndeterminate={isSelectionIndeterminate && !isEverySelectableRowSelected}
                                onPress={tableMethods.handleSelectAll}
                                accessibilityLabel={translate('workspace.common.selectAll')}
                                tabIndex={isAccessibilityHidden ? -1 : undefined}
                            />
                        </View>
                    )}

                    {columns.map((column, index) => {
                        return (
                            <TableHeaderColumn
                                column={column}
                                isTableSemanticsEnabled={isTableSemanticsEnabled}
                                isAccessibilityHidden={isAccessibilityHidden}
                                // 1-based, and offset by the leading selection column (column 1) when present, so it
                                // aligns with the matching data cell's aria-colindex.
                                columnIndex={index + 1 + (isSelectionCheckboxVisible ? 1 : 0)}
                                key={column.key}
                            />
                        );
                    })}
                </>
            )}
        </View>
    );

    if (!isStickyListHeader) {
        return header;
    }

    return <View style={styles.appBG}>{header}</View>;
}

TableHeader.type = 'header';

/**
 * Renders a single sortable column header.
 *
 * @template DataType - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 */
function TableHeaderColumn<DataType extends TableData, ColumnKey extends string = string>({
    column,
    isTableSemanticsEnabled,
    isAccessibilityHidden,
    columnIndex,
}: {
    column: TableColumn<ColumnKey, DataType>;
    isTableSemanticsEnabled: boolean;
    isAccessibilityHidden: boolean;
    columnIndex: number;
}) {
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

    // Honor an explicit `styling.flex`, otherwise fill the available width equally.
    const columnFlexStyle = column.styling?.flex ? {flex: column.styling.flex} : styles.flex1;

    // In the semantic path the `role="columnheader"` wrapper below is the CSS grid item, so a grid-track sizing
    // constraint (currently `mnw0`) from `containerStyles` must live on it, or a `1fr` track sizes from its content
    // instead of its share.
    const {minWidth, maxWidth} = StyleSheet.flatten(column.styling?.containerStyles) ?? {};
    const columnCellSizingStyle = {minWidth, maxWidth};

    // Base sort-button styles shared by both paths. The column's `containerStyles` are horizontal-alignment styles for
    // the header row, so they belong on this `flexRow` button rather than the column-direction cell wrapper below. Flex
    // sizing is appended per path since it differs.
    const tableHeaderStyles = [styles.flexRow, styles.alignItemsCenter, styles.tableHeaderContentHeight, column.styling?.containerStyles, !column.sortable && styles.cursorDefault];

    const label = (
        <>
            <Text
                numberOfLines={1}
                color={theme.textSupporting}
                style={[styles.lh16, isSortingByColumn ? styles.textMicroBoldSupporting : styles.textMicroSupporting]}
                // The button is already named by accessibilityLabel, so the visible label is hidden from assistive tech
                // to avoid the header being announced twice (e.g. "Name Name").
                aria-hidden={isTableSemanticsEnabled ? true : undefined}
            >
                {column.label}
            </Text>

            {isSortingByColumn && (
                // The sort direction is already conveyed by aria-sort on the columnheader, so the icon is decorative.
                // Icon's native "hidden" props don't map to the web, so the wrapper hides it from assistive tech there.
                <View aria-hidden={isTableSemanticsEnabled ? true : undefined}>
                    <Icon
                        additionalStyles={styles.ml1}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        src={sortIcon}
                        fill={theme.icon}
                    />
                </View>
            )}
        </>
    );

    const sortButton = (
        <PressableWithFeedback
            accessible
            accessibilityLabel={column.label}
            accessibilityRole="button"
            disabled={isAccessibilityHidden || !column.sortable}
            tabIndex={isAccessibilityHidden ? -1 : undefined}
            sentryLabel={CONST.SENTRY_LABEL.TABLE_HEADER.SORTABLE_COLUMN}
            // In the semantic path the column's flex sizing lives on the columnheader cell wrapper below, so the button
            // just fills it — `flex1` on both the pressable and its OpacityView wrapper (`wrapperStyle`) so neither
            // collapses to content height.
            style={isTableSemanticsEnabled ? [...tableHeaderStyles, styles.flex1] : [...tableHeaderStyles, columnFlexStyle]}
            wrapperStyle={isTableSemanticsEnabled ? styles.flex1 : undefined}
            onPress={() => toggleSorting(column.key)}
        >
            {label}
        </PressableWithFeedback>
    );

    if (!isTableSemanticsEnabled) {
        return sortButton;
    }

    // Table semantics: the columnheader cell carries the ARIA role, sort state and column index, and it wraps a focusable
    // button (the sort control). Keeping the interactive element separate from the cell means a screen reader focuses and
    // announces the header once (via the button's accessibilityLabel) instead of re-reading the cell's contents.
    return (
        <View
            style={[columnFlexStyle, columnCellSizingStyle]}
            {...getColumnHeaderAccessibilityProps(true, !!column.sortable, isSortingByColumn, activeSorting.order, columnIndex)}
        >
            {sortButton}
        </View>
    );
}

export default TableHeader;
export type {TableHeaderProps};
