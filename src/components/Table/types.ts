import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {PropsWithChildren, SetStateAction} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {FilterConfig, FilterConfigEntry, FilteringMethods, IsItemInFilterCallback} from './middlewares/filtering';
import type {IsItemInSearchCallback, SearchingMethods} from './middlewares/searching';
import type {ActiveSorting, CompareItemsCallback, SortingMethods} from './middlewares/sorting';

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
 * Defines the configuration for a single table column.
 *
 * @template ColumnKey - A string literal type representing the valid column keys.
 */
type TableColumn<ColumnKey extends string = string> = {
    /** Unique identifier for the column, used for sorting and data binding. */
    key: ColumnKey;

    /** Display label shown in the table header. */
    label: string;

    /** Optional styling configuration for the column. */
    styling?: TableColumnStyling;
};

/**
 * Methods exposed by the Table component for programmatic control.
 * Combines sorting, filtering, and searching capabilities.
 *
 * @template T - The type of items in the table's data array (unused in methods, kept for consistency).
 * @template ColumnKey - A string literal type representing the valid column keys.
 * @template FilterKey - A string literal type representing the valid filter keys.
 */
type TableMethods<ColumnKey extends string = string, FilterKey extends string = string> = SortingMethods<ColumnKey> & FilteringMethods<FilterKey> & SearchingMethods;

/**
 * The ref handle type for the Table component.
 * Provides access to both FlashList methods and custom table control methods.
 *
 * @template T - The type of items in the table's data array.
 * @template ColumnKey - A string literal type representing the valid column keys.
 * @template FilterKey - A string literal type representing the valid filter keys.
 */
type TableHandle<T, ColumnKey extends string = string, FilterKey extends string = string> = FlashListRef<T> & TableMethods<ColumnKey, FilterKey>;

/**
 * FlashList props with the 'data' prop omitted, as the Table manages data internally.
 *
 * @template T - The type of items in the table's data array.
 */
type SharedListProps<T> = Omit<FlashListProps<T>, 'data'>;

/**
 * Callback types for getting active state.
 */
type GetActiveFiltersCallback<FilterKey extends string = string> = () => Record<FilterKey, unknown>;
type GetActiveSearchStringCallback = () => string;

/**
 * Callback types for updating table state.
 */
type UpdateFilterCallback = (params: {key: string; value: unknown}) => void;
type UpdateSortingCallback<ColumnKey extends string = string> = (value: SetStateAction<ActiveSorting<ColumnKey>>) => void;
type UpdateSearchStringCallback = (value: string) => void;
type ToggleSortingCallback<ColumnKey extends string = string> = (columnKey?: ColumnKey) => void;

/**
 * Props for the Table component.
 *
 * The Table uses a compositional pattern where the parent `<Table>` component manages
 * state and provides context, while child components (`<Table.Header>`, `<Table.Body>`,
 * `<Table.SearchBar>`, `<Table.FilterButtons>`) consume that context to render UI.
 *
 * @template T - The type of items in the table's data array.
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
 *   <Table.SearchBar />
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 */
type TableProps<T, ColumnKey extends string = string, FilterKey extends string = string> = SharedListProps<T> &
    PropsWithChildren<{
        /** Array of data items to display in the table. */
        data: T[] | undefined;

        /** Column configuration defining what columns to display and how. */
        columns: Array<TableColumn<ColumnKey>>;

        /** Optional filter configuration for dropdown filters. */
        filters?: FilterConfig<FilterKey>;

        /** Optional initial filter values to apply on mount. */
        initialFilters?: FilterKey[];

        /** Optional initial column to sort by on mount. */
        initialSortColumn?: ColumnKey;

        /** Optional initial search string to apply on mount. */
        initialSearchString?: string;

        /**
         * Comparison function for sorting items.
         * Receives two items and the current sorting configuration, returns a number
         * indicating sort order (negative = a before b, positive = b before a, 0 = equal).
         */
        compareItems?: CompareItemsCallback<T, ColumnKey>;

        /**
         * Predicate function to determine if an item matches the active filters.
         * Receives an item and an array of active filter values.
         */
        isItemInFilter?: IsItemInFilterCallback<T>;

        /**
         * Predicate function to determine if an item matches the search string.
         * Receives an item and the current search string.
         */
        isItemInSearch?: IsItemInSearchCallback<T>;

        /** Ref to access table methods programmatically. */
        ref?: React.Ref<TableHandle<T, ColumnKey, FilterKey>>;
    }>;

export type {
    TableColumn,
    TableColumnStyling,
    TableMethods,
    TableHandle,
    TableProps,
    SharedListProps,
    CompareItemsCallback,
    IsItemInFilterCallback,
    IsItemInSearchCallback,
    FilterConfig,
    FilterConfigEntry,
    GetActiveFiltersCallback,
    GetActiveSearchStringCallback,
    UpdateFilterCallback,
    UpdateSortingCallback,
    UpdateSearchStringCallback,
    ToggleSortingCallback,
    ActiveSorting,
};
