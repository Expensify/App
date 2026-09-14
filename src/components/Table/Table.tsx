import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import useScrollToFocusedInput from '@components/SelectionList/hooks/useScrollToFocusedInput';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import getPlatform from '@libs/getPlatform';
import {canMeasureText} from '@libs/measureTextWidth';
import {acquireBackgroundInputFocusSuppression} from '@libs/ModalFocusManager';

import CONST from '@src/CONST';

import type {FlashListRef} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import React, {useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {TableListMetadata} from './buildTableListData';
import type {TableContextValue} from './TableContext';
import type {TableHeaderProps} from './TableHeader';
import type {TableData, TableHandle, TableMethods, TableProps, TableRow} from './types';

import {getDataVisibleIndices, getListIndex, getTableListMetadata} from './buildTableListData';
import useFiltering from './middlewares/filtering';
import useHighlighting from './middlewares/highlight';
import useSearching from './middlewares/searching';
import useSelection from './middlewares/selection';
import useSorting from './middlewares/sorting';
import {shouldUseTableSemantics} from './tableAccessibility';
import {doesBodyRenderWhenEmpty} from './TableBody';
import TableContext from './TableContext';
import TableEmptyState from './TableEmptyStates/TableEmptyState';
import TableNoResultsState from './TableEmptyStates/TableNoResultsState';
import TableListHeader from './TableListHeader';
import TableSemanticContainer from './TableSemanticContainer';
import useDynamicColumnWidths from './useDynamicColumnWidths';

type TableHeaderComponent = React.JSXElementConstructor<TableHeaderProps> & {
    type?: string;
};

type ExtractedTableChildren = {
    listHeaderElement?: React.ReactNode;
    tableHeaderElement?: ReactElement<TableHeaderProps>;
    emptyStateElement?: ReactElement;
    noResultsStateElement?: ReactElement;
};

function isTableHeaderElement(child: React.ReactNode): child is ReactElement<TableHeaderProps> {
    return React.isValidElement<TableHeaderProps>(child) && typeof child.type !== 'string' && (child.type as TableHeaderComponent).type === 'header';
}

function isTableListHeaderElement(child: React.ReactNode): child is ReactElement<{children?: React.ReactNode}> {
    return React.isValidElement(child) && child.type === TableListHeader;
}

/**
 * Builds the Proxy exposed through the Table's ref, forwarding to `tableMethods` first and
 * falling back to FlashList's own methods (e.g. `scrollToIndex`).
 *
 * This is a standalone top-level function (rather than being inlined in the `useImperativeHandle`
 * callback) because OXC's React Compiler currently fails to compile a component when a generic type
 * cast referencing the component's own type parameters (e.g. `as TableHandle<DataType, ColumnKey, FilterKey>`)
 * appears inside a nested closure. That bailout is silent (no build warning) and disables automatic
 * memoization for the entire file, which is what previously caused an infinite FlashList re-render.
 */
function createTableHandle<DataType extends TableData, ColumnKey extends string = string, FilterKey extends string = string>(
    tableMethods: TableMethods<ColumnKey, FilterKey>,
    listRef: React.RefObject<FlashListRef<DataType> | null>,
    getProcessedData: () => Array<TableRow<DataType>>,
    tableListMetadata: TableListMetadata,
): TableHandle<DataType, ColumnKey, FilterKey> {
    return new Proxy(tableMethods, {
        get: (target, property) => {
            if (property in target) {
                return target[property as keyof typeof target];
            }

            if (property === 'getProcessedData') {
                return getProcessedData;
            }

            if (property === 'scrollToIndex') {
                const scrollToIndex = listRef.current?.scrollToIndex;
                if (tableListMetadata.listDataRowOffset === 0 || !scrollToIndex) {
                    return scrollToIndex;
                }

                return (params: Parameters<FlashListRef<DataType>['scrollToIndex']>[0]) =>
                    scrollToIndex({
                        ...params,
                        index: getListIndex(params.index, tableListMetadata),
                    });
            }

            if (property === 'getLayout') {
                const getLayout = listRef.current?.getLayout;
                if (tableListMetadata.listDataRowOffset === 0 || !getLayout) {
                    return getLayout;
                }

                return (index: number) => getLayout(getListIndex(index, tableListMetadata));
            }

            if (property === 'computeVisibleIndices') {
                const computeVisibleIndices = listRef.current?.computeVisibleIndices;
                if (tableListMetadata.listDataRowOffset === 0 || !computeVisibleIndices) {
                    return computeVisibleIndices;
                }

                return () => getDataVisibleIndices(computeVisibleIndices(), tableListMetadata);
            }

            if (property === 'getFirstVisibleIndex') {
                const computeVisibleIndices = listRef.current?.computeVisibleIndices;
                const getFirstVisibleIndex = listRef.current?.getFirstVisibleIndex;
                if (tableListMetadata.listDataRowOffset === 0 || !computeVisibleIndices) {
                    return getFirstVisibleIndex;
                }

                return () => {
                    const {startIndex} = getDataVisibleIndices(computeVisibleIndices(), tableListMetadata);
                    return startIndex;
                };
            }

            return listRef.current?.[property as keyof FlashListRef<DataType>];
        },
    }) as TableHandle<DataType, ColumnKey, FilterKey>;
}

/**
 * A composable table component that provides filtering, search, and sorting functionality.
 *
 * This component uses a compositional pattern where the parent `<Table>` component manages
 * all state (filtering, searching, sorting) and provides it via context. Child components
 * consume this context to render different parts of the table UI.
 *
 * ## Compositional Pattern
 *
 * The Table follows a compound component pattern similar to `<Menu>`, `<Form>`, or `<Tabs>`.
 * You compose your table UI by nesting the sub-components you need:
 *
 * - `<Table>` - The parent component that manages state and provides context
 * - `<Table.Header>` - Renders sortable column headers
 * - `<Table.Body>` - Renders the data rows using FlashList
 * - `<Table.FilterBar>` - Renders a search input that filters data
 *
 * ## Middleware Architecture
 *
 * Data processing is handled through a pipeline of middleware functions:
 * 1. **Filtering** - Applies dropdown filter selections
 * 2. **Searching** - Applies search string filtering
 * 3. **Sorting** - Sorts data by the active column
 * 4. **Selection** - Applies row selection state & provides helpers for selection
 *
 * Each middleware transforms the data array and passes it to the next.
 *
 * ## Generic Type Parameters
 *
 * - `DataType` - The type of items in your data array
 * - `ColumnKey` - String literal union of valid column keys (e.g., `'name' | 'date'`)
 * - `FilterKey` - String literal union of valid filter keys
 *
 * @example Basic Usage
 * ```tsx
 * type Item = { id: string; name: string; category: string };
 * type ColumnKey = 'name' | 'category';
 *
 * const columns: Array<TableColumn<ColumnKey>> = [
 *   { key: 'name', label: 'Name' },
 *   { key: 'category', label: 'Category' },
 * ];
 *
 * <Table<Item, ColumnKey>
 *   data={items}
 *   columns={columns}
 *   renderItem={({ item }) => <ItemRow item={item} />}
 *   keyExtractor={(item) => item.id}
 * >
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example With Search and Sorting
 * ```tsx
 * <Table<Item, ColumnKey>
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   keyExtractor={keyExtractor}
 *   isItemInSearch={(item, searchString) =>
 *     item.name.toLowerCase().includes(searchString.toLowerCase())
 *   }
 *   compareItems={(a, b, { columnKey, order }) => {
 *     const multiplier = order === 'asc' ? 1 : -1;
 *     return a[columnKey].localeCompare(b[columnKey]) * multiplier;
 *   }}
 * >
 *   <Table.FilterBar />
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example With Filters
 * ```tsx
 * const filterConfig: FilterConfig = {
 *   status: {
 *     filterType: 'singleSelect',
 *     options: [
 *       { label: 'All', value: 'all' },
 *       { label: 'Active', value: 'active' },
 *       { label: 'Inactive', value: 'inactive' },
 *     ],
 *     default: 'all',
 *   },
 * };
 *
 * <Table<Item, ColumnKey>
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   keyExtractor={keyExtractor}
 *   filters={filterConfig}
 *   isItemInFilter={(item, filterValues) => {
 *     if (filterValues.includes('all')) return true;
 *     return filterValues.includes(item.status);
 *   }}
 * >
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example Programmatic Control via Ref
 * ```tsx
 * const tableRef = useRef<TableHandle<Item, ColumnKey>>(null);
 *
 * // Programmatically update sorting
 * tableRef.current?.updateSorting({ columnKey: 'name', order: 'desc' });
 *
 * // Get current state
 * const sorting = tableRef.current?.getActiveSorting();
 *
 * <Table ref={tableRef} {...props}>
 *   <Table.Body />
 * </Table>
 * ```
 */
function Table<DataType extends TableData, ColumnKey extends string = string, FilterKey extends string = string>({
    ref,
    title,
    columns,
    filters,
    data = [],
    selectedKeys = [],
    compareItems,
    isItemInFilter,
    isItemInSearch,
    initialSortColumn,
    narrowLayoutSortColumn,
    children,
    selectionEnabled,
    shouldPreserveSelectionOnSearch,
    shouldEnableSelectionInNarrowPaneModal,
    shouldUseDynamicColumns = false,
    onRowSelectionChange,
    onSearchStringChange,
    ...listProps
}: TableProps<DataType, ColumnKey, FilterKey>) {
    const {translate} = useLocalize();
    const isMobileSelectionEnabled = useMobileSelectionMode();
    const icons = useMemoizedLazyExpensifyIcons(['CheckSquare']);
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false});

    if (!columns || columns.length === 0) {
        throw new Error('Table columns must be provided');
    }

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    const originalSelectableCount = data.filter((item) => !item.disabled && !item.isSelectionDisabled).length;

    const {middleware: filterMiddleware, currentFilters, hasActiveFilters, methods: filterMethods} = useFiltering<DataType, FilterKey>({filters, isItemInFilter});
    const filteredData = filterMiddleware(data);

    const {middleware: searchMiddleware, activeSearchString, methods: searchMethods, hasActiveSearchString} = useSearching<DataType>({isItemInSearch});
    const searchedData = searchMiddleware(filteredData);

    const {
        activeSorting,
        methods: sortMethods,
        middleware: sortMiddleware,
    } = useSorting<DataType, ColumnKey>({
        compareItems,
        initialSortColumn,
        narrowLayoutSortColumn,
        shouldUseNarrowTableLayout,
    });
    const sortedData = sortMiddleware(searchedData);

    const {
        methods: selectionMethods,
        mobileSelectionModalRowKey,
        middleware: selectionMiddleware,
    } = useSelection<DataType>({
        data: sortedData,
        originalSelectableCount,
        currentFilters,
        activeSearchString,
        selectedKeys,
        onRowSelectionChange,
        shouldEnableSelectionInNarrowPaneModal,
        shouldPreserveSelectionOnSearch,
    });
    const selectionData = selectionMiddleware(sortedData);

    const {methods: highlightingMethods, middleware: highlightMiddleware} = useHighlighting<DataType>();
    const processedData = highlightMiddleware(selectionData);

    const listRef = useRef<FlashListRef<DataType>>(null);
    const releaseBackgroundInputFocusSuppressionRef = useRef<(() => void) | null>(null);
    const mobileSelectionModalRowKeyRef = useRef(mobileSelectionModalRowKey);
    const [shouldSubmitMobileSelection, setShouldSubmitMobileSelection] = useState(false);
    const [shouldSkipMobileSelectionFocusRestore, setShouldSkipMobileSelectionFocusRestore] = useState(false);
    // Keeps the table search input visible above the keyboard when it is focused inside the
    // scrolling list (native only; the web variant of the hook is a no-op).
    const {isKeyboardShown} = useKeyboardState();
    const {containerRef: listContainerRef, trackScrollOffset, scrollInputIntoView} = useScrollToFocusedInput(listRef, isKeyboardShown);

    const [tableWidth, setTableWidth] = useState(0);

    const handleTableLayout = (event: LayoutChangeEvent) => {
        setTableWidth(event.nativeEvent.layout.width);
    };

    // Narrow and medium layouts render as cards with no columns to size, and native can't measure text, so both keep the
    // static tracks and never measure the table.
    const isDynamicSizingEnabled = shouldUseDynamicColumns && !shouldUseNarrowTableLayout && canMeasureText();

    // Columns are sized from the full data set rather than the processed one, so the widths stay put while the user
    // searches or filters instead of reflowing on every keystroke.
    const {gridTemplateColumns: dynamicGridTemplateColumns, scrollWidth: dynamicScrollWidth} = useDynamicColumnWidths<DataType, ColumnKey>({
        columns,
        data,
        tableWidth,
        isEnabled: isDynamicSizingEnabled,
        // In the wide layout the checkbox column is rendered whenever selection is enabled.
        hasSelectionColumn: !!selectionEnabled,
    });

    const tableMethods: TableMethods<ColumnKey, FilterKey> = {
        ...filterMethods,
        ...sortMethods,
        ...searchMethods,
        ...selectionMethods,
        ...highlightingMethods,
    };

    const originalDataLength = data?.length ?? 0;
    const isEmptyResult = processedData.length === 0 && originalDataLength > 0;

    // Extract marker and state elements before deciding which children stay inline so ListHeader/Header declaration order does not matter.
    const childrenArray = React.Children.map(children, (child) => child) ?? [];
    const {listHeaderElement, tableHeaderElement, emptyStateElement, noResultsStateElement} = childrenArray.reduce<ExtractedTableChildren>((extractedChildren, child) => {
        const isListHeader = isTableListHeaderElement(child);
        const isHeader = isTableHeaderElement(child);
        const isEmptyState = React.isValidElement(child) && child.type === TableEmptyState;
        const isNoResultsState = React.isValidElement(child) && child.type === TableNoResultsState;

        return {
            listHeaderElement: extractedChildren.listHeaderElement ?? (isListHeader ? child.props.children : undefined),
            tableHeaderElement: extractedChildren.tableHeaderElement ?? (isHeader ? child : undefined),
            emptyStateElement: extractedChildren.emptyStateElement ?? (isEmptyState ? child : undefined),
            noResultsStateElement: extractedChildren.noResultsStateElement ?? (isNoResultsState ? child : undefined),
        };
    }, {});
    const hasPageHeader = !!listHeaderElement || !!listProps.ListHeaderComponent;
    const renderedChildren = childrenArray.filter((child) => {
        if (isTableListHeaderElement(child)) {
            return false;
        }

        if (!hasPageHeader) {
            return true;
        }

        return !isTableHeaderElement(child) && !(React.isValidElement(child) && (child.type === TableEmptyState || child.type === TableNoResultsState));
    });
    const shouldRenderStickyHeader = processedData.length > 0 && !!tableHeaderElement && hasPageHeader && !(shouldUseNarrowTableLayout && !title);

    const tableListMetadata = useMemo(
        () =>
            getTableListMetadata({
                listHeaderElement,
                listHeaderComponent: listProps.ListHeaderComponent,
                shouldRenderStickyHeader,
            }),
        [listHeaderElement, listProps.ListHeaderComponent, shouldRenderStickyHeader],
    );
    /**
     * Exposes table control methods through the ref.
     * Uses a Proxy to also forward FlashList methods (like scrollToIndex).
     */
    useImperativeHandle(ref, () => createTableHandle(tableMethods, listRef, () => processedData, tableListMetadata));

    // The default (unfiltered) view can still resolve to zero visible rows when `isItemInFilter` hides items by
    // default — e.g. the Workspaces list shows only active workspaces until the user opts into the archived filter.
    // In that case the data exists but nothing is shown, so we surface the empty state instead of a blank body.
    const isDefaultViewEmpty = processedData.length === 0 && originalDataLength > 0 && !hasActiveSearchString && !hasActiveFilters;

    const handleMobileSelectionPress = () => {
        if (!mobileSelectionModalRowKey) {
            return;
        }

        const shouldSuppressFocusRestore = getPlatform() === CONST.PLATFORM.IOS;
        if (shouldSuppressFocusRestore && !releaseBackgroundInputFocusSuppressionRef.current) {
            releaseBackgroundInputFocusSuppressionRef.current = acquireBackgroundInputFocusSuppression();
        }
        setShouldSkipMobileSelectionFocusRestore(shouldSuppressFocusRestore);
        setShouldSubmitMobileSelection(true);
    };

    useLayoutEffect(() => {
        mobileSelectionModalRowKeyRef.current = mobileSelectionModalRowKey;
    }, [mobileSelectionModalRowKey]);

    useLayoutEffect(() => {
        if (!shouldSubmitMobileSelection || !mobileSelectionModalRowKey) {
            return;
        }

        turnOnMobileSelectionMode();
        selectionMethods.handleSingleRowSelection(mobileSelectionModalRowKey);
        selectionMethods.setMobileSelectionModalRowKey(null);
    }, [mobileSelectionModalRowKey, selectionMethods, shouldSkipMobileSelectionFocusRestore, shouldSubmitMobileSelection]);

    useEffect(
        () => () => {
            releaseBackgroundInputFocusSuppressionRef.current?.();
            releaseBackgroundInputFocusSuppressionRef.current = null;
        },
        [],
    );

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue: TableContextValue<DataType, ColumnKey, FilterKey> = {
        title,
        listHeaderElement,
        tableHeaderElement,
        emptyStateElement,
        noResultsStateElement,
        listRef,
        listContainerRef,
        trackScrollOffset,
        scrollInputIntoView,
        listProps,
        processedData,
        originalDataLength,
        columns,
        dynamicGridTemplateColumns,
        filterConfig: filters,
        activeFilters: currentFilters,
        activeSorting,
        initialSortColumn,
        narrowLayoutSortColumn,
        activeSearchString,
        tableMethods,
        hasActiveFilters,
        hasSearchString: hasActiveSearchString,
        tableListMetadata,
        isEmptyResult,
        isDefaultViewEmpty,
        shouldUseNarrowTableLayout,
        selectionEnabled,
        shouldEnableSelectionInNarrowPaneModal,
        isMobileSelectionEnabled,
        onSearchStringChange,
    };

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    // The selection checkbox renders as an extra leading column when selection is enabled (always visible in the wide
    // web layout where semantics apply), so it has to be counted alongside the configured data columns.
    const semanticColumnCount = columns.length + (selectionEnabled ? 1 : 0);

    // In the normal inline semantic layout, an empty body with a list slot still needs its enclosing table wrapper.
    // Page-header tables use TableBody's persistent full-layout wrapper as their semantic table ancestor.
    const rendersBodyWhenEmpty = doesBodyRenderWhenEmpty(listProps, listHeaderElement);

    return (
        <TableContext.Provider value={contextValue as unknown as TableContextValue<TableData, string, string>}>
            <TableSemanticContainer
                isEnabled={isTableSemanticsEnabled && !tableListMetadata.hasPageHeader}
                title={title}
                rowCount={processedData.length}
                columnCount={semanticColumnCount}
                rendersBodyWhenEmpty={rendersBodyWhenEmpty}
                scrollWidth={dynamicScrollWidth}
                onLayout={isDynamicSizingEnabled ? handleTableLayout : undefined}
            >
                {renderedChildren}
            </TableSemanticContainer>

            <Modal
                shouldPreventScrollOnFocus
                isVisible={!!mobileSelectionModalRowKey}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                restoreFocusType={shouldSkipMobileSelectionFocusRestore ? CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE : undefined}
                onClose={() => tableMethods.setMobileSelectionModalRowKey(null)}
                enableEdgeToEdgeBottomSafeAreaPadding
                onModalHide={() => {
                    if (mobileSelectionModalRowKeyRef.current) {
                        return;
                    }
                    releaseBackgroundInputFocusSuppressionRef.current?.();
                    releaseBackgroundInputFocusSuppressionRef.current = null;
                    setShouldSubmitMobileSelection(false);
                    setShouldSkipMobileSelectionFocusRestore(false);
                }}
            >
                <View style={bottomSafeAreaPaddingStyle}>
                    <MenuItem
                        icon={icons.CheckSquare}
                        title={translate('common.select')}
                        onPress={handleMobileSelectionPress}
                        pressableTestID={CONST.SELECTION_LIST_WITH_MODAL_TEST_ID}
                    />
                </View>
            </Modal>
        </TableContext.Provider>
    );
}

export default Table;
