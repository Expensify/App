import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useFiltering from './middlewares/filtering';
import useSearching from './middlewares/searching';
import useSorting from './middlewares/sorting';
import {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableMethods} from './types';

type UseTableProps<DataType, ColumnKey extends string = string, FilterKey extends string = string> = {
    /** The title for the table when shown on smaller screens */
    title?: string;

    /** Array of data items to display in the table. */
    data: DataType[] | undefined;

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
};

export default function useTable<DataType, ColumnKey extends string = string, FilterKey extends string = string>({
    title,
    data = [],
    columns,
    filters,
    initialFilters,
    initialSortColumn,
    initialSearchString,
    compareItems,
    isItemInFilter,
    isItemInSearch,
}: UseTableProps<DataType, ColumnKey, FilterKey>) {
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const {middleware: filterMiddleware, currentFilters, methods: filterMethods} = useFiltering<DataType, FilterKey>({filters, isItemInFilter});

    const {middleware: searchMiddleware, activeSearchString, methods: searchMethods} = useSearching<DataType>({isItemInSearch});

    const {middleware: sortMiddleware, activeSorting, methods: sortMethods} = useSorting<DataType, ColumnKey>({compareItems, initialSortColumn});

    const processedData = [filterMiddleware, searchMiddleware, sortMiddleware].reduce((acc, middleware) => middleware(acc), data);

    const tableMethods: TableMethods<ColumnKey, FilterKey> = {
        ...filterMethods,
        ...sortMethods,
        ...searchMethods,
    };

    const originalDataLength = data?.length ?? 0;
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    // Check if filters are applied (not default values)
    const hasActiveFilters = filters
        ? (Object.keys(currentFilters) as FilterKey[]).some((key) => {
              const filterValue = currentFilters[key];
              const defaultValue = filters[key]?.default;
              return filterValue !== defaultValue;
          })
        : false;

    const hasSearchString = activeSearchString.trim().length > 0;
    const isEmptyResult = processedData.length === 0 && originalDataLength > 0 && (hasSearchString || hasActiveFilters);

    return {
        title,
        processedData,
        originalDataLength,
        columns,
        filterConfig: filters,
        activeFilters: currentFilters,
        activeSorting,
        activeSearchString,
        tableMethods,
        hasActiveFilters,
        hasSearchString,
        isEmptyResult,
        shouldUseNarrowTableLayout,
    };
}
