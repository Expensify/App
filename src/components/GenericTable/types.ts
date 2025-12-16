import type React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {SortOrder} from '@components/Search/types';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

/**
 * Configuration for a table column
 */
type ColumnConfig = {
    /** Unique identifier for the column */
    columnName: string;

    /** Translation key for the column header text */
    translationKey?: TranslationPaths;

    /** Optional icon to display in the header */
    icon?: IconAsset;

    /** Whether the column can be sorted */
    isSortable?: boolean;

    /** Custom styles for the column */
    style?: StyleProp<ViewStyle>;
};

/**
 * Configuration for a filter option button
 */
type FilterOption = {
    /** Unique value for the filter */
    value: string;

    /** Translation key for the filter button label */
    labelKey: TranslationPaths;
};

/**
 * Props for the GenericTable component
 */
type GenericTableProps<T> = {
    /** Array of data items to display in the table */
    data: T[];

    /** Column configuration for the table header */
    columns: ColumnConfig[];

    /** Function to render each row item - must return a React element or null */
    renderRow: (item: T, index: number) => React.ReactElement | null;

    /** Function to extract a unique key from each item */
    keyExtractor: (item: T, index: number) => string;

    /** Function to filter items based on search query */
    filterData: (item: T, searchQuery: string) => boolean;

    /** Function to sort the filtered data */
    sortData?: (data: T[]) => T[];

    /** Label for the search input */
    searchLabel?: string;

    /** Whether to show the search bar */
    shouldShowSearchBar?: boolean;

    /** Minimum number of items before showing search bar */
    searchItemLimit?: number;

    /** Filter button options */
    filterOptions?: FilterOption[];

    /** Currently active filter value */
    activeFilter?: string;

    /** Callback when filter changes */
    onFilterChange?: (filter: string) => void;

    /** Current sort column */
    sortBy?: string;

    /** Current sort order */
    sortOrder?: SortOrder;

    /** Callback when sort changes */
    onSortPress?: (column: string, order: SortOrder) => void;

    /** Whether to show sorting controls */
    shouldShowSorting?: boolean;

    /** Component to render when data is empty */
    ListEmptyComponent?: React.ComponentType<unknown> | React.ReactElement | null;

    /** Styles for the list container */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Additional header content to render above the table */
    ListHeaderComponent?: React.ReactNode;
};

/**
 * Props for the FilterButtons component
 */
type FilterButtonsProps = {
    /** Available filter options */
    options: FilterOption[];

    /** Currently active filter value */
    activeValue: string;

    /** Callback when a filter button is pressed */
    onPress: (value: string) => void;

    /** Container styles */
    style?: StyleProp<ViewStyle>;
};

export type {ColumnConfig, FilterOption, GenericTableProps, FilterButtonsProps};
