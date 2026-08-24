import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import Table from '@components/Table';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Text from '@components/Text';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
    };
});

// FilterPopupButton (rendered by the filter bar triggers) imports useIsFocused from @react-navigation/core,
// which needs a NavigationContainer unless mocked
jest.mock('@react-navigation/core', () => {
    const actualNavCore = jest.requireActual<typeof Navigation>('@react-navigation/core');
    return {
        ...actualNavCore,
        useIsFocused: jest.fn(() => true),
    };
});

// The settings popover renders MenuItemWithTopDescription, which reads the ScreenWrapper transition context
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

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
        // The dynamic column widths read these spacing values to work out how much room the columns have to share.
        mh5: {marginHorizontal: 20},
        ph3: {paddingHorizontal: 12},
        gap3: {gap: 12},
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
        ml1: {marginLeft: 4},
        lh16: {},
        ph5: {},
        pt3: {},
        pb5: {},
        textNormal: {},
        colorMuted: {},
        getSelectionListPopoverHeight: jest.fn(() => ({})),
        searchBarWidth: jest.fn(() => ({})),
        ml3: {marginLeft: 12},
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

// The real empty state renders illustrations/Lottie, so stub it with a lightweight component we can assert on.
jest.mock('@components/EmptyStateComponent/GenericEmptyStateComponent', () => {
    const {View: RNView, Text: RNText} = jest.requireActual<typeof import('react-native')>('react-native');
    function MockGenericEmptyState({title}: {title?: string}) {
        return (
            <RNView testID="table-empty-state">
                <RNText>{title}</RNText>
            </RNView>
        );
    }
    return MockGenericEmptyState;
});

jest.mock('@hooks/useGenericEmptyStateIllustration', () => jest.fn(() => ({headerMedia: 'illustration'})));

// Table.Row reads the ScreenWrapper transition context, which isn't present in this isolated render
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

// Mock the responsive hook so that we are rendering in web mode by default. It's a jest.fn so individual
// tests (e.g. the immediate-filter popover, which only positions synchronously in the narrow layout) can
// override the return value.
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        shouldUseNarrowLayout: false,
        isMediumScreenWidth: false,
    })),
}));

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

// Mock PressableWithFeedback, but keep the module's other exports (e.g. the Pressable variants the modal
// Backdrop relies on) so the filter popover can still mount.
jest.mock('@components/Pressable', () => ({
    ...jest.requireActual<typeof import('@components/Pressable')>('@components/Pressable'),
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
    keyForList: string;
    id: string;
    name: string;
    category: string;
    value: number;
    disabled?: boolean;
};

type TestColumnKey = 'name' | 'category' | 'value';

// Sample test data
const mockData: TestItem[] = [
    {keyForList: '1', id: '1', name: 'Apple', category: 'fruit', value: 100},
    {keyForList: '2', id: '2', name: 'Banana', category: 'fruit', value: 200},
    {
        keyForList: '3',
        id: '3',
        name: 'Carrot',
        category: 'vegetable',
        value: 50,
    },
    {keyForList: '4', id: '4', name: 'Date', category: 'fruit', value: 150},
    {
        keyForList: '5',
        id: '5',
        name: 'Eggplant',
        category: 'vegetable',
        value: 75,
    },
];

const mockColumns: Array<TableColumn<TestColumnKey>> = [
    {key: 'name', label: 'Name', sortable: true},
    {key: 'category', label: 'Category', sortable: true},
    {key: 'value', label: 'Value', sortable: true},
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
                {key: 'name', label: 'Name', styling: {flex: 2}, sortable: true},
                {
                    key: 'category',
                    label: 'Category',
                    styling: {flex: 1},
                    sortable: true,
                },
                {key: 'value', label: 'Value', styling: {flex: 1}, sortable: true},
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
        it('should render search bar when FilterBar component is used', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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
                    label: 'test',
                    filterType: CONST.TABLES.FILTER_TYPE.SINGLE_SELECT,
                    options: [
                        {label: 'All', value: 'all'},
                        {label: 'Fruit', value: 'fruit'},
                        {label: 'Vegetable', value: 'vegetable'},
                    ],
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

    describe('default-hidden filter (isDefaultViewEmpty)', () => {
        // A filter whose default (empty) selection already hides some rows, mirroring the Workspaces list where
        // archived rows are hidden until the user opts into the "Archived" filter.
        const statusFilterConfig: FilterConfig = {
            status: {
                label: 'Status',
                filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
                immediate: true,
                options: [
                    {label: 'Active', value: 'active'},
                    {label: 'Archived', value: 'archived'},
                ],
            },
        };

        const isItemInStatusFilter: IsItemInFilterCallback<TestItem> = (item, filterValues) => {
            const isArchived = item.category === 'archived';
            // Default view (no selection) shows only active rows.
            if (!filterValues || filterValues.length === 0) {
                return !isArchived;
            }
            if (filterValues.includes('active') && !isArchived) {
                return true;
            }
            return filterValues.includes('archived') && isArchived;
        };

        it('hides the default-hidden rows while still rendering the rest of the data', () => {
            const props = createDefaultProps();
            const data: TestItem[] = [
                {keyForList: '1', id: '1', name: 'Active WS', category: 'active', value: 1},
                {keyForList: '2', id: '2', name: 'Archived WS', category: 'archived', value: 2},
            ];

            render(
                <Table<TestItem, TestColumnKey>
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    filters={statusFilterConfig}
                    isItemInFilter={isItemInStatusFilter}
                >
                    <Table.EmptyState title="No workspaces" />
                    <Table.Body />
                </Table>,
            );

            // The active row shows, the archived row is hidden by the default filter, and because rows remain
            // the empty state must NOT appear.
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.queryByTestId('table-empty-state')).toBeNull();
        });

        it('renders the empty state when the default view hides every row even though data exists', () => {
            const props = createDefaultProps();
            // Every row is hidden by the default filter, so processedData is empty while originalDataLength > 0.
            const data: TestItem[] = [
                {keyForList: '1', id: '1', name: 'Archived A', category: 'archived', value: 1},
                {keyForList: '2', id: '2', name: 'Archived B', category: 'archived', value: 2},
            ];

            render(
                <Table<TestItem, TestColumnKey>
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    filters={statusFilterConfig}
                    isItemInFilter={isItemInStatusFilter}
                >
                    <Table.EmptyState title="No workspaces" />
                    <Table.Body />
                </Table>,
            );

            expect(screen.queryByTestId('row-1')).toBeNull();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.getByTestId('table-empty-state')).toBeTruthy();
        });
    });

    describe('immediate filter', () => {
        const STATUS_ACTIVE = 'active';
        const STATUS_ARCHIVED = 'archived';

        // The filter popover only positions itself synchronously in the narrow layout (the wide layout defers on
        // native `measureInWindow`, whose callback never fires under react-test-renderer).
        const NARROW_LAYOUT = {
            shouldUseNarrowLayout: true,
            isSmallScreenWidth: true,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: false,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: true,
            onboardingIsMediumOrLargerScreenWidth: false,
            isInLandscapeMode: false,
        } as ResponsiveLayoutResult;

        const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};

        const immediateFilterConfig: FilterConfig = {
            status: {
                label: 'Status',
                filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
                immediate: true,
                options: [
                    {label: 'Active', value: STATUS_ACTIVE},
                    {label: 'Archived', value: STATUS_ARCHIVED},
                ],
            },
        };

        // Default (empty) selection shows only active rows; opting into "Archived" reveals archived rows.
        const isItemInImmediateFilter: IsItemInFilterCallback<TestItem> = (item, filterValues) => {
            const isArchived = item.category === 'archived';
            if (!filterValues || filterValues.length === 0) {
                return !isArchived;
            }
            if (filterValues.includes(STATUS_ACTIVE) && !isArchived) {
                return true;
            }
            return filterValues.includes(STATUS_ARCHIVED) && isArchived;
        };

        const immediateData: TestItem[] = [
            {keyForList: '1', id: '1', name: 'Active workspace', category: 'active', value: 1},
            {keyForList: '2', id: '2', name: 'Archived workspace', category: 'archived', value: 2},
        ];

        // The popover machinery needs the real modal/navigation/portal providers, so wrap the table in them
        // (the rest of this suite renders the table bare).
        function ImmediateFilterTable() {
            const props = createDefaultProps();
            return (
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
                    <PortalProvider>
                        <ModalProvider>
                            <NavigationContainer>
                                <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                                    <Table<TestItem, TestColumnKey>
                                        data={immediateData}
                                        columns={props.columns}
                                        renderItem={props.renderItem}
                                        keyExtractor={props.keyExtractor}
                                        filters={immediateFilterConfig}
                                        isItemInFilter={isItemInImmediateFilter}
                                    >
                                        <Table.FilterBar label="Find" />
                                        <Table.Body />
                                    </Table>
                                </ScreenWrapperStatusContext.Provider>
                            </NavigationContainer>
                        </ModalProvider>
                    </PortalProvider>
                </ComposeProviders>
            );
        }

        const openFilter = async () => {
            fireEvent.press(screen.getByLabelText('search.filtersHeader'));
            await waitForBatchedUpdatesWithAct();
            await waitFor(() => {
                expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ARCHIVED}`)).toBeOnTheScreen();
            });
        };

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            });
            (useResponsiveLayout as jest.Mock).mockReturnValue(NARROW_LAYOUT);
        });

        afterEach(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            (useResponsiveLayout as jest.Mock).mockReturnValue({shouldUseNarrowLayout: false, isMediumScreenWidth: false});
        });

        it('applies a selection immediately without an Apply button', async () => {
            render(<ImmediateFilterTable />);
            await waitForBatchedUpdatesWithAct();

            // Only the active row shows by default.
            expect(screen.getByTestId('row-1')).toBeOnTheScreen();
            expect(screen.queryByTestId('row-2')).toBeNull();

            await openFilter();

            // The `immediate` filter renders its options inline, so there is no staged Apply/Reset footer.
            expect(screen.queryByText('common.apply')).toBeNull();

            // Selecting "Archived" surfaces the archived row right away, with no Apply press needed.
            fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ARCHIVED}`));
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId('row-2')).toBeOnTheScreen();
        });

        it('toggles a selection off immediately, restoring the default view', async () => {
            render(<ImmediateFilterTable />);
            await waitForBatchedUpdatesWithAct();

            await openFilter();
            fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ARCHIVED}`));
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId('row-2')).toBeOnTheScreen();

            // Toggling the same option off immediately hides the archived row again.
            fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ARCHIVED}`));
            await waitForBatchedUpdatesWithAct();
            expect(screen.queryByTestId('row-2')).toBeNull();
            expect(screen.getByTestId('row-1')).toBeOnTheScreen();
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

        it('should work with FilterBar and Body', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.FilterBar label="Search" />
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
                    label: 'test',
                    filterType: CONST.TABLES.FILTER_TYPE.SINGLE_SELECT,
                    options: [{label: 'All', value: 'all'}],
                },
            };

            render(
                <NavigationContainer>
                    <Table<TestItem, TestColumnKey>
                        data={props.data}
                        columns={props.columns}
                        renderItem={props.renderItem}
                        keyExtractor={props.keyExtractor}
                        isItemInSearch={props.isItemInSearch}
                        compareItems={props.compareItems}
                        filters={filterConfig}
                    >
                        <Table.FilterBar label="Search" />
                        <Table.Header />
                        <Table.Body />
                    </Table>
                </NavigationContainer>,
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
                    <Table.FilterBar label="Search" />
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
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey, 'category'>>();

            const filterConfig: FilterConfig<'category'> = {
                category: {
                    label: 'test',
                    filterType: CONST.TABLES.FILTER_TYPE.SINGLE_SELECT,
                    options: [
                        {label: 'All', value: 'all'},
                        {label: 'Fruit', value: 'fruit'},
                    ],
                },
            };

            const isItemInFilter: IsItemInFilterCallback<TestItem> = (item, filterValues) => {
                if (!filterValues || filterValues.length === 0 || filterValues.includes('all')) {
                    return true;
                }
                return filterValues.includes(item.category);
            };

            render(
                <NavigationContainer>
                    <Table<TestItem, TestColumnKey, 'category'>
                        ref={tableRef}
                        data={props.data}
                        columns={props.columns}
                        renderItem={props.renderItem}
                        keyExtractor={props.keyExtractor}
                        filters={filterConfig}
                        isItemInFilter={isItemInFilter}
                        isItemInSearch={props.isItemInSearch}
                    >
                        <Table.FilterBar label="Search" />
                        <Table.Body />
                    </Table>
                </NavigationContainer>,
            );

            act(() => {
                tableRef.current?.updateFilter({key: 'category', value: ['fruit']});
            });

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
                keyForList: String(i + 1),
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
                    <Table.FilterBar label="Search" />
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
                    <Table.FilterBar label="Search" />
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

    describe('row selection (shift+click)', () => {
        const renderSelectableRow = ({item, index}: ListRenderItemInfo<TestItem>) => (
            <Table.Row
                interactive
                rowIndex={index}
                disabled={item.disabled}
                accessibilityLabel={item.name}
            >
                <Text testID={`name-${item.id}`}>{item.name}</Text>
            </Table.Row>
        );

        function ControlledSelectableTable({data = mockData, initialSelected = []}: {data?: TestItem[]; initialSelected?: string[]}) {
            const [selectedKeys, setSelectedKeys] = React.useState<string[]>(initialSelected);
            const props = createDefaultProps();
            return (
                <View>
                    <Text testID="selected-keys">{[...selectedKeys].sort().join(',')}</Text>
                    <Table<TestItem, TestColumnKey>
                        data={data}
                        columns={props.columns}
                        renderItem={renderSelectableRow}
                        keyExtractor={props.keyExtractor}
                        selectionEnabled
                        selectedKeys={selectedKeys}
                        onRowSelectionChange={setSelectedKeys}
                    >
                        <Table.Header />
                        <Table.Body />
                    </Table>
                </View>
            );
        }

        const pressRow = (index: number, shiftKey = false) => {
            const checkbox = screen.getAllByLabelText('common.select').at(index);
            if (!checkbox) {
                throw new Error(`No selectable row at index ${index}`);
            }
            fireEvent.press(checkbox, shiftKey ? {shiftKey: true} : undefined);
        };

        it('should select the range between a clicked anchor and a shift+clicked row', () => {
            render(<ControlledSelectableTable />);

            pressRow(0);
            pressRow(3, true);

            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,2,3,4$/);
        });

        it('should move the range endpoint on a consecutive shift+click, deselecting rows that fall out of the range', () => {
            render(<ControlledSelectableTable />);

            pressRow(0);
            pressRow(4, true);
            pressRow(2, true);

            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,2,3$/);
        });

        it('should range-select when the press event carries shiftKey only on nativeEvent', () => {
            render(<ControlledSelectableTable />);

            pressRow(0);
            const checkbox = screen.getAllByLabelText('common.select').at(3);
            if (!checkbox) {
                throw new Error('No selectable row at index 3');
            }
            fireEvent.press(checkbox, {nativeEvent: {shiftKey: true}});

            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,2,3,4$/);
        });

        it('should select from the first selectable row when shift+click is the first action', () => {
            render(<ControlledSelectableTable />);

            pressRow(2, true);

            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,2,3$/);
        });

        it('should collapse the selection when Select All is followed by a shift+click', () => {
            render(<ControlledSelectableTable />);

            fireEvent.press(screen.getByLabelText('workspace.common.selectAll'));
            pressRow(2, true);

            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,2,3$/);
        });

        it('should exclude disabled rows from the range', () => {
            const dataWithDisabledRow = mockData.map((item, index) => (index === 2 ? {...item, disabled: true} : item));
            render(<ControlledSelectableTable data={dataWithDisabledRow} />);

            pressRow(0);
            pressRow(4, true);

            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,2,4,5$/);
        });
    });
});
