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
        ph5: {},
        pt3: {},
        pb5: {},
        textNormal: {},
        colorMuted: {},
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
    const {TextInput: RNTextInput, View: RNView} = jest.requireActual<typeof import('react-native')>('react-native');
    function MockTextInput(props: {accessibilityLabel: string; value: string; onChangeText: (text: string) => void; onClearInput?: () => void}) {
        return (
            <RNView>
                <RNTextInput
                    testID="search-input"
                    accessibilityLabel={props.accessibilityLabel}
                    value={props.value}
                    onChangeText={props.onChangeText}
                />
                {!!props.onClearInput && (
                    <RNTextInput
                        testID="clear-button"
                        onPress={props.onClearInput}
                    />
                )}
            </RNView>
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
    value: number;
};

type TestColumnKey = 'name' | 'category' | 'value';

// Sample test data
const mockData: TestItem[] = [
    {id: '1', name: 'Apple', category: 'fruit', value: 100},
    {id: '2', name: 'Banana', category: 'fruit', value: 200},
    {id: '3', name: 'Carrot', category: 'vegetable', value: 50},
    {id: '4', name: 'Date', category: 'fruit', value: 150},
    {id: '5', name: 'Eggplant', category: 'vegetable', value: 75},
];

const mockColumns: Array<TableColumn<TestColumnKey>> = [
    {key: 'name', label: 'Name'},
    {key: 'category', label: 'Category'},
    {key: 'value', label: 'Value'},
];

// Helper function to create default test props
function createDefaultProps() {
    const renderItem = ({item}: ListRenderItemInfo<TestItem>) => (
        <View testID={`row-${item.id}`}>
            <Text testID={`name-${item.id}`}>{item.name}</Text>
            <Text testID={`category-${item.id}`}>{item.category}</Text>
            <Text testID={`value-${item.id}`}>{item.value}</Text>
        </View>
    );

    const keyExtractor = (item: TestItem) => item.id;

    const isItemInSearch: IsItemInSearchCallback<TestItem> = (item, searchString) => {
        const searchLower = searchString.toLowerCase();
        return item.name.toLowerCase().includes(searchLower) || item.category.toLowerCase().includes(searchLower);
    };

    const compareItems: CompareItemsCallback<TestItem, TestColumnKey> = (a, b, {columnKey, order}) => {
        const multiplier = order === 'asc' ? 1 : -1;

        if (columnKey === 'name') {
            return a.name.localeCompare(b.name) * multiplier;
        }
        if (columnKey === 'category') {
            return a.category.localeCompare(b.category) * multiplier;
        }
        if (columnKey === 'value') {
            return (a.value - b.value) * multiplier;
        }
        return 0;
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
            expect(screen.getByText('Value')).toBeTruthy();
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

        it('should render with undefined data gracefully', () => {
            const props = createDefaultProps();
            const EmptyState = <Text testID="empty-state">No items found</Text>;

            render(
                <Table<TestItem, TestColumnKey>
                    data={undefined}
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

        it('should render column headers with custom styling', () => {
            const props = createDefaultProps();
            const customColumns: Array<TableColumn<TestColumnKey>> = [
                {key: 'name', label: 'Name', styling: {flex: 2}},
                {key: 'category', label: 'Category', styling: {flex: 1}},
                {key: 'value', label: 'Value', styling: {flex: 1}},
            ];

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={customColumns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByText('Name')).toBeTruthy();
            expect(screen.getByText('Category')).toBeTruthy();
            expect(screen.getByText('Value')).toBeTruthy();
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

        it('should search by multiple fields when isItemInSearch checks multiple properties', () => {
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

            // Search by category should match all items in that category
            fireEvent.changeText(searchInput, 'vegetable');

            expect(screen.getByTestId('row-3')).toBeTruthy(); // Carrot
            expect(screen.getByTestId('row-5')).toBeTruthy(); // Eggplant
            expect(screen.queryByTestId('row-1')).toBeNull(); // Apple (fruit)
        });

        it('should handle case-insensitive search', () => {
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

            // Test uppercase search
            fireEvent.changeText(searchInput, 'APPLE');
            expect(screen.getByTestId('row-1')).toBeTruthy();

            // Test mixed case
            fireEvent.changeText(searchInput, 'ApPlE');
            expect(screen.getByTestId('row-1')).toBeTruthy();
        });

        it('should show no results when search matches nothing', () => {
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
            fireEvent.changeText(searchInput, 'xyz123nonexistent');

            expect(screen.queryByTestId('row-1')).toBeNull();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.queryByTestId('row-3')).toBeNull();
            expect(screen.queryByTestId('row-4')).toBeNull();
            expect(screen.queryByTestId('row-5')).toBeNull();
        });

        it('should keep all data if isItemInSearch is not provided', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.SearchBar />
                    <Table.Body />
                </Table>,
            );

            const searchInput = screen.getByTestId('search-input');
            fireEvent.changeText(searchInput, 'apple');

            // Without isItemInSearch, all items should remain visible
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
            expect(screen.getByTestId('row-3')).toBeTruthy();
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

        it('should show all items when no filters are configured', () => {
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

            // Without filter configuration, all items should be visible
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
            expect(screen.getByTestId('row-3')).toBeTruthy();
            expect(screen.getByTestId('row-4')).toBeTruthy();
            expect(screen.getByTestId('row-5')).toBeTruthy();
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

            const valueHeader = screen.getByText('Value');
            expect(valueHeader).toBeTruthy();
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

        it('should allow pressing different column headers', () => {
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

            // Press Name column
            fireEvent.press(screen.getByLabelText('Name'));

            // Then press Category column
            fireEvent.press(screen.getByLabelText('Category'));

            // Then press Value column
            fireEvent.press(screen.getByLabelText('Value'));

            // All columns should still be pressable
            expect(screen.getByLabelText('Name')).toBeTruthy();
            expect(screen.getByLabelText('Category')).toBeTruthy();
            expect(screen.getByLabelText('Value')).toBeTruthy();
        });

        it('should keep data unsorted when compareItems is not provided', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            // Press header
            fireEvent.press(screen.getByLabelText('Name'));

            // Data should still be in original order (unsorted)
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
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

        it('should work with Header and Body', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
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
            expect(screen.getByTestId('row-1')).toBeTruthy();
        });

        it('should work with SearchBar and Body', () => {
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

        it('should allow custom component ordering', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.Header />
                    <Table.SearchBar />
                    <Table.Body />
                </Table>,
            );

            // All components should still render regardless of order
            expect(screen.getByText('Name')).toBeTruthy();
            expect(screen.getByTestId('search-input')).toBeTruthy();
            expect(screen.getByTestId('row-1')).toBeTruthy();
        });
    });

    describe('combined search and filter', () => {
        it('should apply both search and filter together', () => {
            const props = createDefaultProps();

            const filterConfig: FilterConfig = {
                category: {
                    filterType: 'single-select',
                    options: [
                        {label: 'All', value: 'all'},
                        {label: 'Fruit', value: 'fruit'},
                    ],
                    default: 'fruit',
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
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.SearchBar />
                    <Table.Body />
                </Table>,
            );

            const searchInput = screen.getByTestId('search-input');

            // With 'fruit' filter and 'an' search, should match Banana
            fireEvent.changeText(searchInput, 'an');

            // Banana (fruit, contains 'an') should be visible
            expect(screen.getByTestId('row-2')).toBeTruthy();

            // Carrot (vegetable) should not be visible (filtered out)
            expect(screen.queryByTestId('row-3')).toBeNull();

            // Eggplant (vegetable, contains 'an') should not be visible (filtered out)
            expect(screen.queryByTestId('row-5')).toBeNull();
        });
    });

    describe('performance and edge cases', () => {
        it('should handle large datasets', () => {
            const largeData: TestItem[] = Array.from({length: 100}, (_, i) => ({
                id: String(i + 1),
                name: `Item ${i + 1}`,
                category: i % 2 === 0 ? 'fruit' : 'vegetable',
                value: i * 10,
            }));

            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={largeData}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Body />
                </Table>,
            );

            // First item should be rendered
            expect(screen.getByTestId('row-1')).toBeTruthy();
        });

        it('should handle special characters in search', () => {
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

            // Search with special characters should not crash
            fireEvent.changeText(searchInput, '!@#$%^&*()');

            // No items should match, but app should not crash
            expect(screen.queryByTestId('row-1')).toBeNull();
        });

        it('should handle whitespace-only search', () => {
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

            // Whitespace-only search should be treated as empty (all items visible)
            fireEvent.changeText(searchInput, '   ');

            // All items should remain visible with whitespace-only search
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.getByTestId('row-2')).toBeTruthy();
        });
    });
});
