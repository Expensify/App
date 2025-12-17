import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {PropsWithChildren} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {FilterConfig, FilteringMethods, IsItemInFilterCallback} from './middlewares/filtering';
import type {IsItemInSearchCallback, SearchingMethods} from './middlewares/searching';
import type {CompareItemsCallback, SortingMethods} from './middlewares/sorting';

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

type TableMethods<T, ColumnKey extends string = string, FilterKey extends string = string> = SortingMethods<ColumnKey> & FilteringMethods<FilterKey> & SearchingMethods;

type TableHandle<T, ColumnKey extends string = string, FilterKey extends string = string> = FlashListRef<T> & TableMethods<ColumnKey, FilterKey>;

type SharedListProps<T> = Omit<FlashListProps<T>, 'data'>;

type TableProps<T, ColumnKey extends string = string, FilterKey extends string = string> = SharedListProps<T> &
    PropsWithChildren<{
        data: T[] | undefined;
        columns: Array<TableColumn<ColumnKey>>;
        filters?: FilterConfig<FilterKey>;
        initialFilters?: FilterKey[];
        initialSortColumn?: ColumnKey;
        initialSearchString?: string;
        compareItems?: CompareItemsCallback<T, ColumnKey>;
        isItemInFilter?: IsItemInFilterCallback<T>;
        isItemInSearch?: IsItemInSearchCallback<T>;
        ref?: React.Ref<TableHandle<T, ColumnKey, FilterKey>>;
    }>;

export type {TableColumn, TableMethods, TableHandle, TableProps, SharedListProps, CompareItemsCallback, IsItemInFilterCallback};
