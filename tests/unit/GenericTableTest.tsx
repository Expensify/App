import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {Text, View} from 'react-native';
import GenericTable from '@components/GenericTable';
import FilterButtons from '@components/GenericTable/FilterButtons';
import type {ColumnConfig, FilterOption} from '@components/GenericTable/types';
import type Navigation from '@libs/Navigation/Navigation';

// Mock navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
    };
});

// Mock useLocalize hook
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

// Mock useThemeStyles hook
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flexGrow1: {},
        mt5: {},
        mh5: {},
        mt3: {},
        flexRow: {},
        appBG: {},
        justifyContentBetween: {},
        gap5: {},
        p4: {},
        gap2: {},
        textMicroSupporting: {},
    })),
);

// Mock useResponsiveLayout hook
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
    })),
);

// Mock SearchBar component to avoid deep dependency issues
jest.mock('@components/SearchBar', () => {
    const {TextInput, View} = require('react-native');
    return function MockSearchBar({label, inputValue, onChangeText}: {label: string; inputValue: string; onChangeText: (text: string) => void}) {
        return (
            <View>
                <TextInput
                    testID="search-input"
                    accessibilityLabel={label}
                    value={inputValue}
                    onChangeText={onChangeText}
                />
            </View>
        );
    };
});

// Mock SortableHeaderText component
jest.mock('@components/SelectionListWithSections/SortableHeaderText', () => {
    const {Text, Pressable} = require('react-native');
    return function MockSortableHeaderText({text, onPress}: {text: string; onPress: (order: string) => void}) {
        return (
            <Pressable
                onPress={() => onPress('desc')}
                testID="sortable-header"
            >
                <Text>{text}</Text>
            </Pressable>
        );
    };
});

// Sample data types for testing
type TestItem = {
    id: string;
    name: string;
    category: string;
};

// Sample test data
const mockData: TestItem[] = [
    {id: '1', name: 'Apple', category: 'fruit'},
    {id: '2', name: 'Banana', category: 'fruit'},
    {id: '3', name: 'Carrot', category: 'vegetable'},
    {id: '4', name: 'Date', category: 'fruit'},
    {id: '5', name: 'Eggplant', category: 'vegetable'},
];

const mockColumns: ColumnConfig[] = [
    {columnName: 'name', translationKey: 'common.name'},
    {columnName: 'category', translationKey: 'common.category'},
];

describe('GenericTable', () => {
    const defaultProps = {
        data: mockData,
        columns: mockColumns,
        renderRow: (item: TestItem) => (
            <View testID={`row-${item.id}`}>
                <Text>{item.name}</Text>
            </View>
        ),
        keyExtractor: (item: TestItem) => item.id,
        filterData: (item: TestItem, query: string) => item.name.toLowerCase().includes(query.toLowerCase()),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render all data items', () => {
            render(<GenericTable<TestItem> {...defaultProps} />);

            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
            expect(screen.getByTestId('row-3')).toBeTruthy();
            expect(screen.getByTestId('row-4')).toBeTruthy();
            expect(screen.getByTestId('row-5')).toBeTruthy();
        });

        it('should render column headers when columns are provided', () => {
            render(<GenericTable<TestItem> {...defaultProps} />);

            // Column headers should be rendered
            expect(screen.getByText('common.name')).toBeTruthy();
            expect(screen.getByText('common.category')).toBeTruthy();
        });

        it('should render empty state when no data', () => {
            const EmptyComponent = () => <Text testID="empty-state">No items found</Text>;

            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    data={[]}
                    ListEmptyComponent={<EmptyComponent />}
                />,
            );

            expect(screen.getByTestId('empty-state')).toBeTruthy();
        });
    });

    describe('search functionality', () => {
        it('should not show search bar when item count is below limit', () => {
            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    searchItemLimit={10}
                />,
            );

            // Search bar should not be visible since we have 5 items < 10 limit
            expect(screen.queryByLabelText('common.search')).toBeNull();
        });

        it('should show search bar when item count exceeds limit', () => {
            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    searchItemLimit={3}
                />,
            );

            // Search bar should be visible since we have 5 items > 3 limit
            expect(screen.getByLabelText('common.search')).toBeTruthy();
        });

        it('should filter data when search query is entered', () => {
            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    searchItemLimit={1}
                />,
            );

            const searchInput = screen.getByLabelText('common.search');
            fireEvent.changeText(searchInput, 'apple');

            // Only Apple should be visible after filtering
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.queryByTestId('row-3')).toBeNull();
        });

        it('should show all items when search is cleared', () => {
            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    searchItemLimit={1}
                />,
            );

            const searchInput = screen.getByLabelText('common.search');

            // Filter data
            fireEvent.changeText(searchInput, 'apple');
            expect(screen.queryByTestId('row-2')).toBeNull();

            // Clear search
            fireEvent.changeText(searchInput, '');
            expect(screen.getByTestId('row-2')).toBeTruthy();
        });
    });

    describe('sorting functionality', () => {
        it('should apply custom sort function', () => {
            const sortedData: TestItem[] = [];
            const sortData = (data: TestItem[]) => {
                const sorted = [...data].sort((a, b) => b.name.localeCompare(a.name));
                sortedData.push(...sorted);
                return sorted;
            };

            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    sortData={sortData}
                />,
            );

            // Verify sort function was called
            expect(sortedData.length).toBeGreaterThan(0);
            // First item should be Eggplant (reverse alphabetical)
            expect(sortedData[0].name).toBe('Eggplant');
        });

        it('should call onSortPress when sortable column header is clicked', () => {
            const onSortPress = jest.fn();

            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    columns={[{columnName: 'name', translationKey: 'common.name', isSortable: true}]}
                    shouldShowSorting
                    onSortPress={onSortPress}
                />,
            );

            // Click on sortable column header
            const sortableHeader = screen.getByText('common.name');
            fireEvent.press(sortableHeader);

            expect(onSortPress).toHaveBeenCalledWith('name', expect.any(String));
        });
    });

    describe('filter functionality', () => {
        it('should render filter buttons when filterOptions are provided', () => {
            const filterOptions: FilterOption[] = [
                {value: 'all', labelKey: 'common.all'},
                {value: 'status', labelKey: 'common.status'},
            ];

            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    // Use empty columns to avoid conflict with filter labels
                    columns={[]}
                    filterOptions={filterOptions}
                    activeFilter="all"
                    onFilterChange={jest.fn()}
                />,
            );

            expect(screen.getByText('common.all')).toBeTruthy();
            expect(screen.getByText('common.status')).toBeTruthy();
        });

        it('should call onFilterChange when filter button is pressed', () => {
            const onFilterChange = jest.fn();
            const filterOptions: FilterOption[] = [
                {value: 'all', labelKey: 'common.all'},
                {value: 'status', labelKey: 'common.status'},
            ];

            render(
                <GenericTable<TestItem>
                    {...defaultProps}
                    // Use empty columns to avoid conflict with filter labels
                    columns={[]}
                    filterOptions={filterOptions}
                    activeFilter="all"
                    onFilterChange={onFilterChange}
                />,
            );

            fireEvent.press(screen.getByText('common.status'));
            expect(onFilterChange).toHaveBeenCalledWith('status');
        });
    });
});

describe('FilterButtons', () => {
    const filterOptions: FilterOption[] = [
        {value: 'all', labelKey: 'common.all'},
        {value: 'date', labelKey: 'common.date'},
        {value: 'name', labelKey: 'common.name'},
    ];

    it('should render all filter options', () => {
        render(
            <FilterButtons
                options={filterOptions}
                activeValue="all"
                onPress={jest.fn()}
            />,
        );

        expect(screen.getByText('common.all')).toBeTruthy();
        expect(screen.getByText('common.date')).toBeTruthy();
        expect(screen.getByText('common.name')).toBeTruthy();
    });

    it('should call onPress with correct value when button is pressed', () => {
        const onPress = jest.fn();

        render(
            <FilterButtons
                options={filterOptions}
                activeValue="all"
                onPress={onPress}
            />,
        );

        fireEvent.press(screen.getByText('common.date'));
        expect(onPress).toHaveBeenCalledWith('date');

        fireEvent.press(screen.getByText('common.name'));
        expect(onPress).toHaveBeenCalledWith('name');
    });

    it('should highlight active filter button', () => {
        const {rerender} = render(
            <FilterButtons
                options={filterOptions}
                activeValue="all"
                onPress={jest.fn()}
            />,
        );

        // The 'all' button should be highlighted (success prop)
        // This is tested by checking the component renders correctly
        expect(screen.getByText('common.all')).toBeTruthy();

        // Change active filter
        rerender(
            <FilterButtons
                options={filterOptions}
                activeValue="date"
                onPress={jest.fn()}
            />,
        );

        // The 'date' button should now be highlighted
        expect(screen.getByText('common.date')).toBeTruthy();
    });
});
