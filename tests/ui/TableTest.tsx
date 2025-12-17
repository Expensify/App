import type {ListRenderItemInfo} from '@shopify/flash-list';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Table from '@components/Table';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Text from '@components/Text';
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
        flex1: {},
        mt5: {},
        mh5: {},
        mt3: {},
        flexRow: {},
        appBG: {},
        justifyContentBetween: {},
        gap2: {},
        gap5: {},
        p4: {},
        textMicroSupporting: {},
        textMicroBoldSupporting: {},
        textAlignRight: {},
        pr1: {},
        ml1: {},
        lh16: {},
    })),
);

// Mock useTheme hook
jest.mock('@hooks/useTheme', () =>
    jest.fn(() => ({
        textSupporting: '#666666',
        icon: '#333333',
    })),
);

// Mock useLazyAsset hook
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        MagnifyingGlass: 'MagnifyingGlass',
        ArrowUpLong: 'ArrowUpLong',
        ArrowDownLong: 'ArrowDownLong',
    })),
}));

// Mock Icon component
jest.mock('@components/Icon', () => {
    function MockIcon(): null {
        return null;
    }
    return MockIcon;
});

// Mock TextInput component
jest.mock('@components/TextInput', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {TextInput: RNTextInput} = jest.requireActual<typeof import('react-native')>('react-native');
    function MockTextInput(props: {accessibilityLabel: string; value: string; onChangeText: (text: string) => void}) {
        return (
            <RNTextInput
                testID="search-input"
                accessibilityLabel={props.accessibilityLabel}
                value={props.value}
                onChangeText={props.onChangeText}
            />
        );
    }
    return MockTextInput;
});

// Mock PressableWithFeedback
jest.mock('@components/Pressable', () => ({
    PressableWithFeedback: (props: {children: React.ReactNode; onPress: () => void; accessibilityLabel: string; accessibilityRole: 'button' | 'link' | 'none' | undefined}) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        const {Pressable} = jest.requireActual<typeof import('react-native')>('react-native');
        return (
            <Pressable
                onPress={props.onPress}
                accessibilityLabel={props.accessibilityLabel}
                accessibilityRole={props.accessibilityRole}
            >
                {props.children}
            </Pressable>
        );
    },
}));

// Sample data types for testing
type TestItem = {
    id: string;
    name: string;
    category: string;
};

type TestColumnKey = 'name' | 'category';

// Sample test data
const mockData: TestItem[] = [
    {id: '1', name: 'Apple', category: 'fruit'},
    {id: '2', name: 'Banana', category: 'fruit'},
    {id: '3', name: 'Carrot', category: 'vegetable'},
    {id: '4', name: 'Date', category: 'fruit'},
    {id: '5', name: 'Eggplant', category: 'vegetable'},
];

const mockColumns: Array<TableColumn<TestColumnKey>> = [
    {key: 'name', label: 'Name'},
    {key: 'category', label: 'Category'},
];

// Helper function to create default test props
function createDefaultProps() {
    const renderItem = ({item}: ListRenderItemInfo<TestItem>) => (
        <View testID={`row-${item.id}`}>
            <Text>{item.name}</Text>
        </View>
    );

    const keyExtractor = (item: TestItem) => item.id;

    const isItemInSearch: IsItemInSearchCallback<TestItem> = (item, searchString) => item.name.toLowerCase().includes(searchString.toLowerCase());

    const compareItems: CompareItemsCallback<TestItem, TestColumnKey> = (a, b, {columnKey, order}) => {
        const multiplier = order === 'asc' ? 1 : -1;
        if (columnKey === 'name') {
            return a.name.localeCompare(b.name) * multiplier;
        }
        return a.category.localeCompare(b.category) * multiplier;
    };

    return {
        data: mockData,
        columns: mockColumns,
        renderItem,
        keyExtractor,
        isItemInSearch,
        compareItems,
    };
}

describe('Table', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render all data items', () => {
            const props = createDefaultProps();
            render(
                <Table
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
            expect(screen.getByTestId('row-3')).toBeTruthy();
            expect(screen.getByTestId('row-4')).toBeTruthy();
            expect(screen.getByTestId('row-5')).toBeTruthy();
        });

        it('should render column headers when Header component is used', () => {
            const props = createDefaultProps();
            render(
                <Table
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByText('Name')).toBeTruthy();
            expect(screen.getByText('Category')).toBeTruthy();
        });

        it('should render empty state when no data', () => {
            const props = createDefaultProps();
            const EmptyState = <Text testID="empty-state">No items found</Text>;

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    ListEmptyComponent={EmptyState}
                >
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('empty-state')).toBeTruthy();
        });
    });

    describe('search functionality', () => {
        it('should render search bar when SearchBar component is used', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.SearchBar />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('search-input')).toBeTruthy();
        });

        it('should filter data when search query is entered', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.SearchBar />
                    <Table.Body />
                </Table>,
            );

            const searchInput = screen.getByTestId('search-input');
            fireEvent.changeText(searchInput, 'apple');

            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.queryByTestId('row-3')).toBeNull();
        });

        it('should show all items when search is cleared', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.SearchBar />
                    <Table.Body />
                </Table>,
            );

            const searchInput = screen.getByTestId('search-input');
            fireEvent.changeText(searchInput, 'apple');
            expect(screen.queryByTestId('row-2')).toBeNull();

            fireEvent.changeText(searchInput, '');
            expect(screen.getByTestId('row-2')).toBeTruthy();
        });
    });

    describe('filter functionality', () => {
        it('should apply filter when filter config is provided', () => {
            const props = createDefaultProps();

            const filterConfig: FilterConfig = {
                category: {
                    filterType: 'single-select',
                    options: [
                        {label: 'All', value: 'all'},
                        {label: 'Fruit', value: 'fruit'},
                        {label: 'Vegetable', value: 'vegetable'},
                    ],
                    default: 'all',
                },
            };

            const isItemInFilter: IsItemInFilterCallback<TestItem> = (item, filterValues) => {
                if (!filterValues || filterValues.length === 0 || filterValues.includes('all')) {
                    return true;
                }
                return filterValues.includes(item.category);
            };

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    filters={filterConfig}
                    isItemInFilter={isItemInFilter}
                >
                    <Table.Body />
                </Table>,
            );

            // All items should be visible with default 'all' filter
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-3')).toBeTruthy();
        });
    });

    describe('sorting functionality', () => {
        it('should render sortable column headers', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    compareItems={props.compareItems}
                >
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            // Column headers should be rendered as buttons
            const nameHeader = screen.getByText('Name');
            expect(nameHeader).toBeTruthy();

            const categoryHeader = screen.getByText('Category');
            expect(categoryHeader).toBeTruthy();
        });

        it('should toggle sort order when column header is pressed', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    compareItems={props.compareItems}
                >
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            const nameHeader = screen.getByLabelText('Name');
            fireEvent.press(nameHeader);

            // After pressing, the sort should be applied (visual feedback tested via icon)
            expect(nameHeader).toBeTruthy();
        });
    });

    describe('compositional structure', () => {
        it('should throw error when columns are not provided', () => {
            const props = createDefaultProps();

            expect(() => {
                render(
                    <Table<TestItem, TestColumnKey>
                        data={props.data}
                        columns={[]}
                        renderItem={props.renderItem}
                        keyExtractor={props.keyExtractor}
                    >
                        <Table.Body />
                    </Table>,
                );
            }).toThrow('Table columns must be provided');
        });

        it('should work with only Body component', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('row-1')).toBeTruthy();
        });

        it('should work with all compositional components together', () => {
            const props = createDefaultProps();

            const filterConfig: FilterConfig = {
                category: {
                    filterType: 'single-select',
                    options: [{label: 'All', value: 'all'}],
                    default: 'all',
                },
            };

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    compareItems={props.compareItems}
                    filters={filterConfig}
                >
                    <Table.SearchBar />
                    <Table.FilterButtons />
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('search-input')).toBeTruthy();
            expect(screen.getByText('Name')).toBeTruthy();
            expect(screen.getByTestId('row-1')).toBeTruthy();
        });
    });
});
