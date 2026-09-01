import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {PropsWithChildren} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import type {FilterConfig, FilteringMethods, IsItemInFilterCallback} from './middlewares/filtering';
import type {HighlightingMethods} from './middlewares/highlight';
import type {IsItemInSearchCallback, SearchingMethods} from './middlewares/searching';
import type {SelectionMethods} from './middlewares/selection';
import type {CompareItemsCallback, SortingMethods} from './middlewares/sorting';

/**
 * Defines the required minimum shape for each row of data in the table
 */
type TableData = {
    /** A unique identifier for the row */
    keyForList: string;

    /** Whether or not the row is disabled. Prevents clicking the row & renders it with disabled styles. */
    disabled?: boolean;

    /** Optionally disable a specific row from selection, when selection is enabled */
    isSelectionDisabled?: boolean;
};

/**
 * Styling options for a table column.
 */
type TableColumnStyling = {
    /** Optional flex value to control the column's width relative to other columns. */
    flex?: number;

    /** Optional custom styles for the column container. */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional custom styles for the column header label. */
    labelStyles?: StyleProp<TextStyle>;
};

/**
 * A run of text inside a cell, described well enough to measure how wide it renders.
 */
type MeasurableCellContent = {
    /** The text rendered in the cell. */
    text: string;

    /** Font size the text renders at. Defaults to the app's normal text size. */
    fontSize?: number;

    /** Font weight the text renders at. Defaults to the normal weight. */
    fontWeight?: string;
};

/**
 * Describes how to size a column from its content, used when the table opts into dynamic column widths via
 * `shouldUseDynamicColumns`. Columns that omit this are sized from their header label alone.
 */
type TableColumnDynamicSizing<DataType extends TableData = TableData> = {
    /**
     * The text runs rendered in this column's cell for a row. The widest measurement across every row drives the
     * column's content width, so return every run that can be the widest one (e.g. both lines of a two-line cell).
     */
    getContentToMeasure: (item: DataType) => MeasurableCellContent[];

    /** Width of the cell's non-text content, e.g. an avatar plus its gap. */
    extraWidth?: number;

    /** Whether this column's values come from a fixed set (a role, a status), so it always fits them in full and never truncates. */
    shouldFitContent?: boolean;

    /** Smallest width this column may be squeezed to. Defaults to a readable width, or the column's content width when that is narrower. */
    minWidth?: number;

    /**
     * Largest width this column may claim. Uncapped by default, so content that doesn't fit scrolls the table rather
     * than truncating. Set this on a column that should truncate instead of widening the table any further.
     */
    maxWidth?: number;
};

/**
 * Defines the configuration for a single table column.
 *
 * @template ColumnKey - A string literal type representing the valid column keys.
 * @template DataType - The type of items in the table's data array.
 */
type TableColumn<ColumnKey extends string = string, DataType extends TableData = TableData> = {
    /** Unique identifier for the column, used for sorting and data binding. */
    key: ColumnKey;

    /** Display label shown in the table header. */
    label: string;

    /** Whether the column is sortable or not */
    sortable: boolean;

    /** Optional fixed width for the column */
    width?: number | string;

    /** Optional styling configuration for the column. */
    styling?: TableColumnStyling;

    /** Optional configuration for sizing this column from its content. Only read when the table sets `shouldUseDynamicColumns`. */
    dynamicSizing?: TableColumnDynamicSizing<DataType>;
};

type TableRow<DataType extends TableData> = DataType & {
    /** Whether or not the row is selected or not */
    selected?: boolean;

    /** Whether or not the row should animate in highlighted */
    shouldAnimateInHighlight?: boolean;
};

/**
 * Props passed to table row render callbacks.
 */
type TableRenderRowProps<TItem extends TableData> = {
    item: TItem;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

/**
 * Methods exposed by the Table component for programmatic control.
 * Combines sorting, filtering, and searching capabilities.
 *
 * @template ColumnKey - A string literal type representing the valid column keys.
 * @template FilterKey - A string literal type representing the valid filter keys.
 */
type TableMethods<ColumnKey extends string = string, FilterKey extends string = string> = SortingMethods<ColumnKey> &
    FilteringMethods<FilterKey> &
    SearchingMethods &
    SelectionMethods &
    HighlightingMethods;

/**
 * The ref handle type for the Table component.
 * Provides access to both FlashList methods and custom table control methods.
 *
 * @template DataType - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 * @template FilterKey - A string literal type representing the valid filter keys.
 */
type TableHandle<DataType extends TableData, ColumnKey extends string = string, FilterKey extends string = string> = FlashListRef<DataType> &
    TableMethods<ColumnKey, FilterKey> & {
        /** Method to get all of the processed data after filtering, searching, and sorting have been applied. */
        getProcessedData: () => Array<TableRow<DataType>>;
    };

/**
 * FlashList props with the 'data' prop omitted, as the Table manages data internally.
 *
 * @template DataType - The type of items in the table's data array.
 */
type SharedListProps<DataType extends TableData> = Omit<FlashListProps<DataType>, 'data'>;

/**
 * Props for the Table component.
 *
 * The Table uses a compositional pattern where the parent `<Table>` component manages
 * state and provides context, while child components (`<Table.Header>`, `<Table.Body>`,
 * `<Table.FilterBar>`) consume that context to render UI.
 *
 * @template DataType - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 * @template FilterKey - A string literal type representing the valid filter keys.
 *
 * @example
 * ```tsx
 * <Table
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   keyExtractor={keyExtractor}
 *   compareItems={compareItems}
 *   isItemInSearch={isItemInSearch}
 * >
 *   <Table.FilterBar />
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 */
type TableProps<DataType extends TableData, ColumnKey extends string = string, FilterKey extends string = string> = SharedListProps<DataType> &
    PropsWithChildren<{
        /** The title for the table when shown on smaller screens */
        title?: string;

        /** Array of data items to display in the table. */
        data: DataType[] | undefined;

        /** Whether multi selection is enabled */
        selectionEnabled?: boolean;

        /** Whether selected row keys should remain selected while the search query changes. */
        shouldPreserveSelectionOnSearch?: boolean;

        /**
         * Whether the selection UX (checkboxes / long-press selection mode) should be driven by the real screen size
         * (isSmallScreenWidth) instead of shouldUseNarrowLayout. Set this for tables rendered inside a narrow pane modal
         * (RHP), where shouldUseNarrowLayout is always true and would otherwise suppress selection entirely. Defaults to
         * false so central-pane tables keep their existing behavior.
         */
        shouldEnableSelectionInNarrowPaneModal?: boolean;

        /** Column configuration defining what columns to display and how. */
        columns: Array<TableColumn<ColumnKey, DataType>>;

        /**
         * Whether columns should be sized from their content instead of being split equally. Columns describe what to
         * measure through `TableColumn.dynamicSizing`. Web-only and wide-layout-only: narrow layouts render as cards, and
         * native can't measure text synchronously, so both keep the equal-width layout.
         */
        shouldUseDynamicColumns?: boolean;

        /** Optional filter configuration for dropdown filters. */
        filters?: FilterConfig<FilterKey>;

        /** Optional initial filter values to apply on mount. */
        initialFilters?: FilterKey[];

        /** Optional initial column to sort by on mount. */
        initialSortColumn?: ColumnKey;

        /** Optional column to force-sort by when the table switches to narrow layout. The wide-layout sorting is restored when leaving narrow layout. */
        narrowLayoutSortColumn?: ColumnKey;

        /** Optional initial search string to apply on mount. */
        initialSearchString?: string;

        /** The list of selected keys for the table, if selection is enabled */
        selectedKeys?: string[];

        /**
         * Comparison function for sorting items.
         * Receives two items and the current sorting configuration, returns a number
         * indicating sort order (negative = a before b, positive = b before a, 0 = equal).
         */
        compareItems?: CompareItemsCallback<DataType, ColumnKey>;

        /**
         * Predicate function to determine if an item matches the active filters.
         * Receives an item and an array of active filter values.
         */
        isItemInFilter?: IsItemInFilterCallback<DataType>;

        /**
         * Predicate function to determine if an item matches the search string.
         * Receives an item and the current search string.
         */
        isItemInSearch?: IsItemInSearchCallback<DataType>;

        /** Ref to access table methods programmatically. */
        ref?: React.Ref<TableHandle<DataType, ColumnKey, FilterKey>>;

        /** Callback when an option is selected */
        onRowSelectionChange?: (selectedRowKeys: string[]) => void;

        /** Optional callback fired when the active search string changes. */
        onSearchStringChange?: (searchString: string) => void;
    }>;

export type {
    TableData,
    TableRow,
    TableColumn,
    TableRenderRowProps,
    TableMethods,
    TableHandle,
    TableProps,
    SharedListProps,
    CompareItemsCallback,
    IsItemInFilterCallback,
    IsItemInSearchCallback,
    FilterConfig,
};
