import type {PropsWithChildren} from 'react';
import type {FlatListProps, StyleProp, TextStyle, ViewStyle} from 'react-native';

type TableColumnStyling = {
    flex?: number;
    containerStyles?: StyleProp<ViewStyle>;
    labelStyles?: StyleProp<TextStyle>;
};

type TableColumn<ColumnKey extends string = string> = {
    key: ColumnKey;
    label: string;
    styling?: TableColumnStyling;
};

type FilterConfig = Record<
    string,
    {
        filterType?: 'multi-select' | 'single-select';
        options?: string[];
        default?: string;
    }
>;

type TableSortOrder = 'asc' | 'desc';

type CompareItemsCallback<T, ColumnKey extends string = string> = (a: T, b: T, sortColumn: ColumnKey, order: TableSortOrder) => number;

type IsItemInFilterCallback<T> = (item: T, filters: string[]) => boolean;

type IsItemInSearchCallback<T> = (item: T, searchString: string) => boolean;

type SharedFlatListProps<T> = Omit<FlatListProps<T>, 'data'>;

type TableProps<T, ColumnKey extends string = string> = SharedFlatListProps<T> &
    PropsWithChildren<{
        data: T[] | undefined;
        columns: Array<TableColumn<ColumnKey>>;
        filters?: FilterConfig;
        initialFilters?: string[];
        initialSortColumn?: string;
        initialSearchString?: string;
        compareItems?: CompareItemsCallback<T, ColumnKey>;
        isItemInFilter?: IsItemInFilterCallback<T>;
        isItemInSearch?: IsItemInSearchCallback<T>;
    }>;

export type {TableColumn, FilterConfig, SharedFlatListProps, TableProps, TableSortOrder, CompareItemsCallback, IsItemInFilterCallback, IsItemInSearchCallback};
