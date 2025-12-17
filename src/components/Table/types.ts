import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {PropsWithChildren} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

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

type FilterConfigEntry = {
    filterType?: 'multi-select' | 'single-select';
    options: Array<{label: string; value: string}>;
    default?: string;
};

type FilterConfig<FilterKey extends string = string> = Record<FilterKey, FilterConfigEntry>;

type SortOrder = 'asc' | 'desc';

type ActiveSorting<ColumnKey extends string = string> = {
    columnKey: ColumnKey | undefined;
    order: SortOrder;
};

type CompareItemsCallback<T, ColumnKey extends string = string> = (a: T, b: T, sortingConfig: ActiveSorting<ColumnKey>) => number;

type IsItemInFilterCallback<T> = (item: T, filters: string[]) => boolean;

type IsItemInSearchCallback<T> = (item: T, searchString: string) => boolean;

type UpdateSortingCallback<ColumnKey extends string = string> = (params: {columnKey?: ColumnKey; order?: SortOrder}) => void;

type ToggleSortingCallback<ColumnKey extends string = string> = (columnKey?: ColumnKey) => void;

type UpdateFilterCallback<FilterKey extends string = string> = (params: {key: FilterKey; value: unknown}) => void;

type UpdateSearchStringCallback = (value: string) => void;

type TableMethods<ColumnKey extends string = string, FilterKey extends string = string> = {
    getCurrentSorting: () => {
        columnKey: ColumnKey | undefined;
        order: SortOrder;
    };
    getCurrentFilters: () => Record<FilterKey, unknown>;
    getCurrentSearchString: () => string;
    updateSorting: UpdateSortingCallback<ColumnKey>;
    toggleSorting: ToggleSortingCallback<ColumnKey>;
    updateFilter: UpdateFilterCallback<FilterKey>;
    updateSearchString: UpdateSearchStringCallback;
};

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

export type {
    TableColumn,
    TableMethods,
    TableHandle,
    TableProps,
    SharedListProps,
    SortOrder,
    ActiveSorting,
    FilterConfig,
    FilterConfigEntry,
    CompareItemsCallback,
    IsItemInFilterCallback,
    IsItemInSearchCallback,
    UpdateSortingCallback,
    ToggleSortingCallback,
    UpdateSearchStringCallback,
    UpdateFilterCallback,
};
