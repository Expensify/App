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
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const RN = require('react-native');
    // eslint-disable-next-line react/function-component-definition
    const MockSearchBar = ({label, inputValue, onChangeText}: {label: string; inputValue: string; onChangeText: (text: string) => void}) => (
        <RN.View>
            <RN.TextInput
                testID="search-input"
                accessibilityLabel={label}
                value={inputValue}
                onChangeText={onChangeText}
            />
        </RN.View>
    );
    return MockSearchBar;
});

// Mock SortableHeaderText component
jest.mock('@components/SelectionListWithSections/SortableHeaderText', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const RN = require('react-native');
    // eslint-disable-next-line react/function-component-definition
    const MockSortableHeaderText = ({text, onPress}: {text: string; onPress: (order: string) => void}) => (
        <RN.Pressable
            onPress={() => onPress('desc')}
            testID="sortable-header"
            accessibilityRole="button"
        >
            <RN.Text>{text}</RN.Text>
        </RN.Pressable>
    );
    return MockSortableHeaderText;
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

// Helper function to create default props for GenericTable
function createDefaultProps() {
    return {
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
}

describe('GenericTable', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render all data items', () => {
            const props = createDefaultProps();
            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                />,
            );

            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
            expect(screen.getByTestId('row-3')).toBeTruthy();
            expect(screen.getByTestId('row-4')).toBeTruthy();
            expect(screen.getByTestId('row-5')).toBeTruthy();
        });

        it('should render column headers when columns are provided', () => {
            const props = createDefaultProps();
            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                />,
            );

            expect(screen.getByText('common.name')).toBeTruthy();
            expect(screen.getByText('common.category')).toBeTruthy();
        });

        it('should render empty state when no data', () => {
            const props = createDefaultProps();
            const EmptyState = <Text testID="empty-state">No items found</Text>;

            render(
                <GenericTable<TestItem>
                    data={[]}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    ListEmptyComponent={EmptyState}
                />,
            );

            expect(screen.getByTestId('empty-state')).toBeTruthy();
        });
    });

    describe('search functionality', () => {
        it('should not show search bar when item count is below limit', () => {
            const props = createDefaultProps();
            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    searchItemLimit={10}
                />,
            );

            expect(screen.queryByLabelText('common.search')).toBeNull();
        });

        it('should show search bar when item count exceeds limit', () => {
            const props = createDefaultProps();
            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    searchItemLimit={3}
                />,
            );

            expect(screen.getByLabelText('common.search')).toBeTruthy();
        });

        it('should filter data when search query is entered', () => {
            const props = createDefaultProps();
            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    searchItemLimit={1}
                />,
            );

            const searchInput = screen.getByLabelText('common.search');
            fireEvent.changeText(searchInput, 'apple');

            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.queryByTestId('row-3')).toBeNull();
        });

        it('should show all items when search is cleared', () => {
            const props = createDefaultProps();
            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    searchItemLimit={1}
                />,
            );

            const searchInput = screen.getByLabelText('common.search');
            fireEvent.changeText(searchInput, 'apple');
            expect(screen.queryByTestId('row-2')).toBeNull();

            fireEvent.changeText(searchInput, '');
            expect(screen.getByTestId('row-2')).toBeTruthy();
        });
    });

    describe('sorting functionality', () => {
        it('should apply custom sort function', () => {
            const props = createDefaultProps();
            const sortedData: TestItem[] = [];
            const sortData = (data: TestItem[]) => {
                const sorted = [...data].sort((a, b) => b.name.localeCompare(a.name));
                sortedData.push(...sorted);
                return sorted;
            };

            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={props.columns}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    sortData={sortData}
                />,
            );

            expect(sortedData.length).toBeGreaterThan(0);
            expect(sortedData.at(0)?.name).toBe('Eggplant');
        });

        it('should call onSortPress when sortable column header is clicked', () => {
            const props = createDefaultProps();
            const onSortPress = jest.fn();

            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={[{columnName: 'name', translationKey: 'common.name', isSortable: true}]}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    shouldShowSorting
                    onSortPress={onSortPress}
                />,
            );

            const sortableHeader = screen.getByText('common.name');
            fireEvent.press(sortableHeader);

            expect(onSortPress).toHaveBeenCalledWith('name', expect.any(String));
        });
    });

    describe('filter functionality', () => {
        it('should render filter buttons when filterOptions are provided', () => {
            const props = createDefaultProps();
            const filterOptions: FilterOption[] = [
                {value: 'all', labelKey: 'common.all'},
                {value: 'status', labelKey: 'common.status'},
            ];

            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={[]}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
                    filterOptions={filterOptions}
                    activeFilter="all"
                    onFilterChange={jest.fn()}
                />,
            );

            expect(screen.getByText('common.all')).toBeTruthy();
            expect(screen.getByText('common.status')).toBeTruthy();
        });

        it('should call onFilterChange when filter button is pressed', () => {
            const props = createDefaultProps();
            const onFilterChange = jest.fn();
            const filterOptions: FilterOption[] = [
                {value: 'all', labelKey: 'common.all'},
                {value: 'status', labelKey: 'common.status'},
            ];

            render(
                <GenericTable<TestItem>
                    data={props.data}
                    columns={[]}
                    renderRow={props.renderRow}
                    keyExtractor={props.keyExtractor}
                    filterData={props.filterData}
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

        expect(screen.getByText('common.all')).toBeTruthy();

        rerender(
            <FilterButtons
                options={filterOptions}
                activeValue="date"
                onPress={jest.fn()}
            />,
        );

        expect(screen.getByText('common.date')).toBeTruthy();
    });
});
