import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useFiltering from './middlewares/filtering';
import useSearching from './middlewares/searching';
import useSorting from './middlewares/sorting';
import {TableMethods, TableValue, UseTableProps} from './types';

export default function useTable<DataType, ColumnKey extends string = string, FilterKey extends string = string>({
    title,
    data = [],
    columns,
    filters,
    initialSortColumn,
    compareItems,
    isItemInFilter,
    isItemInSearch,
}: UseTableProps<DataType, ColumnKey, FilterKey>): TableValue<DataType, ColumnKey, FilterKey> {
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
