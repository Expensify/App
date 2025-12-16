import type {PropsWithChildren} from 'react';
import type {FlatListProps} from 'react-native';

type FilterConfig = {
    options: Array<{label: string; value: unknown}>;
    filterType: 'multi-select' | 'single-select';
    default: unknown;
    predicate: <T>(item: T, filterValue: unknown) => boolean;
};

type SortByConfig = {
    options: Array<{label: string; value: string}>;
    default: string;
    comparator: <T>(a: T, b: T, sortKey: string, order: 'asc' | 'desc') => number;
};

type SharedFlatListProps<T> = Omit<FlatListProps<T>, 'data'>;

type TableProps<T> = SharedFlatListProps<T> &
    PropsWithChildren<{
        data: T[] | undefined;
        filters?: Record<string, FilterConfig>;
        sortBy?: SortByConfig;
        onSearch?: (items: T[], searchString: string) => T[];
    }>;

export type {FilterConfig, SortByConfig, SharedFlatListProps, TableProps};
