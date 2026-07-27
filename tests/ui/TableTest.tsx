import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import Table, {composeTableHeaderComponent} from '@components/Table';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import Text from '@components/Text';

import CONST from '@src/CONST';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';

type MockFlashListProps<T> = {
    data?: T[];
    renderItem?: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;
    ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
    ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
    ListFooterComponent?: React.ComponentType | React.ReactElement | null;
    ListFooterComponentStyle?: React.ComponentProps<typeof View>['style'];
    contentContainerStyle?: React.ComponentProps<typeof View>['style'];
    onEndReached?: () => void;
    onLoad?: (info: {elapsedTimeInMs: number}) => void;
    onScroll?: (event: {nativeEvent: {contentOffset: {y: number}}}) => void;
    onStartReached?: () => void;
    onViewableItemsChanged?: () => void;
    stickyHeaderIndices?: number[];
};

const mockFlashListScrollToIndex = jest.fn();
const mockFlashListScrollToItem = jest.fn();
const mockFlashListScrollToOffset = jest.fn();
const mockFlashListMount = jest.fn();
const mockFlashListUnmount = jest.fn();
const mockTextInputFocus = jest.fn();
const mockTextInputMount = jest.fn();
const mockTextInputUnmount = jest.fn();
const mockTextInputNativeFocus = jest.fn();
const mockTextInputNativeBlur = jest.fn();
let mockNextTextInputInstanceID = 0;
let mockFlashListProps: Array<MockFlashListProps<unknown>> = [];
let mockShouldUseNarrowLayout = false;

// Mock navigation
jest.mock('@react-navigation/native', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    return {
        NavigationContainer: ({children}: {children: React.ReactNode}) => children,
        NavigationRouteContext: ReactLocal.createContext(undefined),
        ThemeProvider: ({children}: {children: React.ReactNode}) => children,
        useIsFocused: jest.fn(() => true),
        useFocusEffect: jest.fn(),
        useNavigation: () => ({
            addListener: jest.fn(() => jest.fn()),
            dispatch: jest.fn(),
            getState: jest.fn(() => ({routes: []})),
            isFocused: jest.fn(() => true),
            navigate: jest.fn(),
        }),
        useNavigationState: jest.fn(() => ({routes: []})),
        usePreventRemove: jest.fn(),
        useRoute: jest.fn(() => ({params: {}})),
        useTheme: jest.fn(() => ({})),
        createNavigationContainerRef: jest.fn(() => ({
            addListener: jest.fn(() => jest.fn()),
            getCurrentRoute: jest.fn(),
            getState: jest.fn(() => ({routes: []})),
            isReady: jest.fn(() => true),
            navigate: jest.fn(),
            removeListener: jest.fn(),
        })),
        DarkTheme: {},
        DefaultTheme: {},
        LinkingContext: {},
    };
});

jest.mock('@react-navigation/core', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    return {
        NavigationContext: ReactLocal.createContext({}),
        findFocusedRoute: jest.fn(),
        getActionFromState: jest.fn(),
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(() => false),
    },
}));

jest.mock('@components/MenuItem', () => {
    function MockMenuItem(): null {
        return null;
    }
    return MockMenuItem;
});

jest.mock('@components/Modal', () => {
    function MockModal(): null {
        return null;
    }
    return MockModal;
});

jest.mock('@components/ActivityIndicator', () => {
    function MockActivityIndicator(): null {
        return null;
    }
    return MockActivityIndicator;
});

jest.mock('@components/withNavigationFallback', () => (Component: React.ComponentType) => Component);

jest.mock('@userActions/Session', () => ({
    callFunctionIfActionIsAllowed: <TCallback extends ((...args: never[]) => unknown) | undefined>(callback: TCallback) => callback,
}));

jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');

    const renderComponent = (component: React.ComponentType | React.ReactElement | null | undefined) => {
        if (!component) {
            return null;
        }

        if (ReactLocal.isValidElement(component)) {
            return component;
        }

        return ReactLocal.createElement(component);
    };

    const FlashList = ReactLocal.forwardRef(
        (
            props: MockFlashListProps<unknown>,
            ref: React.Ref<{
                scrollToIndex: typeof mockFlashListScrollToIndex;
                scrollToItem: typeof mockFlashListScrollToItem;
                scrollToOffset: typeof mockFlashListScrollToOffset;
            }>,
        ) => {
            mockFlashListProps.push(props);
            const data = props.data ?? [];

            ReactLocal.useEffect(() => {
                mockFlashListMount();
                return () => {
                    mockFlashListUnmount();
                };
            }, []);
            ReactLocal.useImperativeHandle(ref, () => ({
                scrollToIndex: mockFlashListScrollToIndex,
                scrollToItem: mockFlashListScrollToItem,
                scrollToOffset: mockFlashListScrollToOffset,
            }));

            return (
                <RNView testID="flash-list">
                    {renderComponent(props.ListHeaderComponent)}
                    {data.length === 0
                        ? renderComponent(props.ListEmptyComponent)
                        : data.map((item, index) => {
                              const key = props.keyExtractor?.(item, index) ?? String(index);
                              return (
                                  <RNView key={key}>
                                      {props.renderItem?.({
                                          item,
                                          index,
                                          target: 'Cell',
                                      } as ListRenderItemInfo<unknown>)}
                                  </RNView>
                              );
                          })}
                    {!!props.ListFooterComponent && <RNView style={props.ListFooterComponentStyle}>{renderComponent(props.ListFooterComponent)}</RNView>}
                </RNView>
            );
        },
    );

    return {FlashList};
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
        flexGrow1: {flexGrow: 1},
        flexGrow0: {flexGrow: 0},
        flex1: {flex: 1},
        flexColumn: {flexDirection: 'column'},
        flexShrink0: {flexShrink: 0},
        justifyContentCenter: {justifyContent: 'center'},
        mnh0: {minHeight: 0},
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
        pb4: {paddingBottom: 16},
        pb20: {paddingBottom: 80},
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
    useMemoizedLazyIllustrations: jest.fn(() => ({
        EmptyShelves: 'EmptyShelves',
    })),
}));

// Mock the generic empty-state building blocks so Table.EmptyState/Table.NoResultsState render simple markers
jest.mock('@components/EmptyStateComponent/GenericEmptyStateComponent', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {View: RNView, Text: RNText} = jest.requireActual<typeof import('react-native')>('react-native');
    function MockGenericEmptyStateComponent({title, subtitle, minModalHeight = 400}: {title?: string; subtitle?: string; minModalHeight?: number}) {
        return (
            <RNView
                testID="generic-empty-state"
                style={{minHeight: minModalHeight, flexGrow: 1, flexShrink: 0}}
            >
                <RNText>{title}</RNText>
                <RNText>{subtitle}</RNText>
            </RNView>
        );
    }
    return MockGenericEmptyStateComponent;
});

jest.mock('@hooks/useGenericEmptyStateIllustration', () => jest.fn(() => ({})));

jest.mock('@components/ScrollView', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {ScrollView: RNScrollView} = jest.requireActual<typeof import('react-native')>('react-native');
    return RNScrollView;
});

// Mock Icon component
jest.mock('@components/Icon', () => {
    function MockIcon(): null {
        return null;
    }
    return MockIcon;
});

// Mock the responsive hook so that we are rendering in web mode
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({
        shouldUseNarrowLayout: mockShouldUseNarrowLayout,
        isMediumScreenWidth: false,
    }),
}));

// Mock TextInput component
jest.mock('@components/TextInput', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {TextInput: RNTextInput, View: RNView} = jest.requireActual<typeof import('react-native')>('react-native');
    type MockTextInputProps = {
        accessibilityLabel: string;
        value: string;
        onChangeText: (text: string) => void;
        onClearInput?: () => void;
        onFocus?: () => void;
        onBlur?: () => void;
    };
    const MockTextInput = ReactLocal.forwardRef((props: MockTextInputProps, ref: React.Ref<{focus: () => void; isFocused: () => boolean}>) => {
        const isFocusedRef = ReactLocal.useRef(false);
        const [nativeID] = ReactLocal.useState(() => `mock-search-input-${++mockNextTextInputInstanceID}`);
        ReactLocal.useEffect(() => {
            mockTextInputMount();
            return () => {
                mockTextInputUnmount();
                if (isFocusedRef.current) {
                    mockTextInputNativeBlur();
                }
            };
        }, []);
        ReactLocal.useImperativeHandle(ref, () => ({
            focus: () => {
                isFocusedRef.current = true;
                mockTextInputFocus();
            },
            isFocused: () => isFocusedRef.current,
        }));

        return (
            <RNView>
                <RNTextInput
                    testID="search-input"
                    nativeID={nativeID}
                    accessibilityLabel={props.accessibilityLabel}
                    value={props.value}
                    onChangeText={props.onChangeText}
                    onFocus={() => {
                        isFocusedRef.current = true;
                        mockTextInputNativeFocus();
                        props.onFocus?.();
                    }}
                    onBlur={() => {
                        isFocusedRef.current = false;
                        mockTextInputNativeBlur();
                        props.onBlur?.();
                    }}
                />
                {!!props.onClearInput && (
                    <RNTextInput
                        testID="clear-button"
                        onPress={props.onClearInput}
                    />
                )}
            </RNView>
        );
    });
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
    keyForList: string;
    id: string;
    name: string;
    category: string;
    value: number;
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

function activateStickyHeadersAfterListLoad() {
    let animationFrameCallback: FrameRequestCallback | undefined;
    const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
        animationFrameCallback = callback;
        return 1;
    });

    act(() => {
        mockFlashListProps.at(-1)?.onLoad?.({elapsedTimeInMs: 1});
    });

    if (!animationFrameCallback) {
        throw new Error('Expected sticky-header activation to be scheduled after FlashList load');
    }

    act(() => {
        animationFrameCallback?.(0);
    });
    requestAnimationFrameSpy.mockRestore();
}

describe('Table', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFlashListProps = [];
        mockShouldUseNarrowLayout = false;
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

            const emptyStateScrollView = screen.getByTestId('table-empty-state-scroll-view');
            expect(within(emptyStateScrollView).getByTestId('empty-state')).toBeTruthy();
            expect(StyleSheet.flatten(emptyStateScrollView.parent?.props.style)).toEqual(
                expect.not.objectContaining({
                    paddingBottom: 16,
                }),
            );
            expect(StyleSheet.flatten(emptyStateScrollView.props.contentContainerStyle)).toEqual(
                expect.objectContaining({
                    flexGrow: 1,
                    paddingBottom: 16,
                }),
            );
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

        it('should render headerComponent and keep row indexes aligned with data rows', () => {
            const props = createDefaultProps();
            const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
                <View testID={`row-${item.id}`}>
                    <Text testID={`row-index-${item.id}`}>{index}</Text>
                    <Text>{item.name}</Text>
                </View>
            );

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('table-header-component')).toBeTruthy();
            expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
            expect(screen.getByTestId('row-index-1').props.children).toBe(0);
            expect(mockFlashListProps.at(-1)?.ListHeaderComponent).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 2);
        });

        it('should compose ListHeaderComponent and headerComponent as the first list row', () => {
            const props = createDefaultProps();
            const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
                <View testID={`row-${item.id}`}>
                    <Text testID={`row-index-${item.id}`}>{index}</Text>
                    <Text>{item.name}</Text>
                </View>
            );

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    ListHeaderComponent={<Text testID="table-list-header-component">List header</Text>}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('table-list-header-component')).toBeTruthy();
            expect(screen.getByTestId('table-header-component')).toBeTruthy();
            expect(screen.getByTestId('row-index-1').props.children).toBe(0);
            expect(mockFlashListProps.at(-1)?.ListHeaderComponent).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 2);
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            activateStickyHeadersAfterListLoad();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([1]);
        });

        it('should preserve a composed search slot when an earlier optional header slot toggles', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();
            const renderTable = (shouldShowOptionalHeader: boolean) => (
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    headerComponent={composeTableHeaderComponent(shouldShowOptionalHeader && <Text testID="optional-header">Optional header</Text>, <Table.FilterBar label="Search" />)}
                >
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable(false));
            const searchInput = screen.getByTestId('search-input');
            const searchInputNativeID: unknown = searchInput.props.nativeID;
            fireEvent(searchInput, 'focus');
            fireEvent.changeText(searchInput, 'apple');

            rerender(renderTable(true));

            expect(screen.getByTestId('optional-header')).toBeTruthy();
            expect(screen.getByTestId('search-input').props.nativeID).toBe(searchInputNativeID);
            expect(screen.getByTestId('search-input').props.value).toBe('apple');
            expect(tableRef.current?.getActiveSearchString()).toBe('apple');
            expect(mockTextInputMount).toHaveBeenCalledTimes(1);
            expect(mockTextInputUnmount).not.toHaveBeenCalled();
            expect(mockTextInputNativeFocus).toHaveBeenCalledTimes(1);
            expect(mockTextInputNativeBlur).not.toHaveBeenCalled();
            expect(mockTextInputFocus).not.toHaveBeenCalled();

            rerender(renderTable(false));

            expect(screen.queryByTestId('optional-header')).toBeNull();
            expect(screen.getByTestId('search-input').props.nativeID).toBe(searchInputNativeID);
            expect(screen.getByTestId('search-input').props.value).toBe('apple');
            expect(tableRef.current?.getActiveSearchString()).toBe('apple');
            expect(mockTextInputMount).toHaveBeenCalledTimes(1);
            expect(mockTextInputUnmount).not.toHaveBeenCalled();
            expect(mockTextInputNativeBlur).not.toHaveBeenCalled();
            expect(mockTextInputFocus).not.toHaveBeenCalled();
        });

        it('should activate the sticky table header after the first list layout', () => {
            const props = createDefaultProps();
            const renderTable = (data: TestItem[]) => (
                <Table<TestItem, TestColumnKey>
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable([]));
            expect(screen.getByTestId('flash-list')).toBeTruthy();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            act(() => {
                mockFlashListProps.at(-1)?.onLoad?.({elapsedTimeInMs: 1});
            });
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            let animationFrameCallback: FrameRequestCallback | undefined;
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrameCallback = callback;
                return 1;
            });

            rerender(renderTable(props.data));
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 2);

            if (!animationFrameCallback) {
                throw new Error('Expected sticky-header activation to be scheduled when rows appear');
            }

            act(() => {
                animationFrameCallback?.(0);
            });
            requestAnimationFrameSpy.mockRestore();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([1]);
        });

        it('should temporarily remove the sticky table header while search has no results', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    headerComponent={
                        <>
                            <Text testID="table-header-component">Page header</Text>
                            <Table.FilterBar label="Search" />
                        </>
                    }
                    shouldUseStickyColumnHeader
                >
                    <Table.NoResultsState />
                    <Table.Body />
                </Table>,
            );

            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([1]);
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 2);

            fireEvent.changeText(screen.getByTestId('search-input'), 'xyz123nonexistent');

            expect(screen.getByTestId('flash-list')).toBeTruthy();
            expect(screen.getByTestId('generic-empty-state')).toBeTruthy();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);

            let animationFrameCallback: FrameRequestCallback | undefined;
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrameCallback = callback;
                return 1;
            });

            fireEvent.changeText(screen.getByTestId('search-input'), '');

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 2);

            if (!animationFrameCallback) {
                throw new Error('Expected sticky-header activation to be rescheduled when rows return');
            }

            act(() => {
                animationFrameCallback?.(0);
            });
            requestAnimationFrameSpy.mockRestore();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([1]);
        });

        it('should defer sticky table header activation again when the list remounts', () => {
            const props = createDefaultProps();
            const renderTable = (data: TestItem[]) => (
                <Table<TestItem, TestColumnKey>
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable(props.data));
            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);

            rerender(renderTable([]));
            expect(screen.queryByTestId('flash-list')).toBeNull();

            rerender(renderTable(props.data));
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
        });

        it('should preserve scrollToIndex when rows return after a page-header empty state', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();
            const renderTable = (data: TestItem[]) => (
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    shouldUseStickyColumnHeader
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable([]));
            expect(screen.getByTestId('flash-list')).toBeTruthy();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);

            rerender(renderTable(props.data));
            const scrollToIndex = tableRef.current?.scrollToIndex;
            if (!scrollToIndex) {
                throw new Error('Expected table ref methods to be restored after rows return');
            }

            act(() => {
                scrollToIndex({index: 0, animated: false});
            });

            expect(mockFlashListScrollToIndex).toHaveBeenCalledWith({
                index: 2,
                animated: false,
            });
        });

        it('should defer sticky table header activation when sticky mode turns back on', () => {
            const props = createDefaultProps();
            const renderTable = (shouldUseStickyColumnHeader: boolean) => (
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    shouldUseStickyColumnHeader={shouldUseStickyColumnHeader}
                >
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable(true));
            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([1]);

            rerender(renderTable(false));
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            let animationFrameCallback: FrameRequestCallback | undefined;
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrameCallback = callback;
                return 1;
            });

            rerender(renderTable(true));
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            if (!animationFrameCallback) {
                throw new Error('Expected sticky-header activation to be rescheduled when sticky mode turns back on');
            }

            act(() => {
                animationFrameCallback?.(0);
            });
            requestAnimationFrameSpy.mockRestore();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([1]);
        });

        it('should not add a page-header row when no page header is provided', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>,
            );

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);

            activateStickyHeadersAfterListLoad();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
            const tableHandle = tableRef.current;
            if (!tableHandle) {
                throw new Error('Expected table ref to be set');
            }
            const scrollToIndex = tableHandle.scrollToIndex as (params: {index: number; animated: boolean}) => void;

            act(() => {
                scrollToIndex({index: 0, animated: false});
            });

            expect(mockFlashListScrollToIndex).toHaveBeenCalledWith({
                index: 1,
                animated: false,
            });
        });

        it('should offset scrollToIndex calls when synthetic header rows are present', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>,
            );
            const tableHandle = tableRef.current;
            if (!tableHandle) {
                throw new Error('Expected table ref to be set');
            }
            const scrollToIndex = tableHandle.scrollToIndex as (params: {index: number; animated: boolean}) => void;

            act(() => {
                scrollToIndex({index: 0, animated: false});
            });

            expect(mockFlashListScrollToIndex).toHaveBeenCalledWith({
                index: 2,
                animated: false,
            });
        });

        it('should forward scrollToIndex without offset when no synthetic rows are present', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Body />
                </Table>,
            );
            const tableHandle = tableRef.current;
            if (!tableHandle) {
                throw new Error('Expected table ref to be set');
            }
            const scrollToIndex = tableHandle.scrollToIndex as (params: {index: number; animated: boolean}) => void;

            act(() => {
                scrollToIndex({index: 0, animated: false});
            });

            expect(mockFlashListScrollToIndex).toHaveBeenCalledWith({
                index: 0,
                animated: false,
            });
        });

        it('should render a page-header empty state in the persistent FlashList footer', () => {
            const props = createDefaultProps();
            const EmptyState = <Text testID="empty-state">No items found</Text>;

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    ListEmptyComponent={EmptyState}
                >
                    <Table.Body />
                </Table>,
            );

            const flashList = screen.getByTestId('flash-list');
            expect(within(flashList).getByTestId('table-header-component')).toBeTruthy();
            expect(within(flashList).getByTestId('empty-state')).toBeTruthy();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.ListFooterComponentStyle).toBeUndefined();
        });

        it('should render ListEmptyComponent without mounting FlashList when only the sticky header keeps the body mounted', () => {
            const props = createDefaultProps();
            const EmptyState = <Text testID="empty-state">No items found</Text>;

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    ListEmptyComponent={EmptyState}
                    shouldUseStickyColumnHeader
                >
                    <Table.Body />
                </Table>,
            );

            expect(screen.getAllByTestId('empty-state')).toHaveLength(1);
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(mockFlashListProps).toHaveLength(0);
        });

        it('should render Table.EmptyState in the persistent list footer when a page header is present', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                    shouldUseStickyColumnHeader
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.Body />
                </Table>,
            );

            // The empty state renders exactly once below the stable page-header row without
            // becoming a recycled list cell.
            const flashList = screen.getByTestId('flash-list');
            expect(screen.getAllByTestId('generic-empty-state')).toHaveLength(1);
            expect(within(flashList).getByTestId('generic-empty-state')).toBeTruthy();
            expect(within(flashList).getByTestId('table-header-component')).toBeTruthy();
            expect(screen.queryByTestId('table-empty-state-scroll-view')).toBeNull();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.ListFooterComponentStyle).toBeUndefined();
        });

        it('should keep an oversized page-header empty state naturally scrollable without flexing the footer over the header', () => {
            const props = createDefaultProps();
            mockShouldUseNarrowLayout = true;

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    headerComponent={<Text testID="table-header-component">Page header</Text>}
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.Body />
                </Table>,
            );

            expect(StyleSheet.flatten(mockFlashListProps.at(-1)?.contentContainerStyle)).toEqual(
                expect.objectContaining({
                    paddingBottom: 80,
                }),
            );
            expect(StyleSheet.flatten(mockFlashListProps.at(-1)?.contentContainerStyle)).not.toEqual(expect.objectContaining({flexGrow: 1}));
            expect(mockFlashListProps.at(-1)?.ListFooterComponentStyle).toBeUndefined();
            const genericEmptyState = within(screen.getByTestId('flash-list')).getByTestId('generic-empty-state');
            expect(StyleSheet.flatten(genericEmptyState.props.style)).toEqual(expect.objectContaining({minHeight: 400, flexGrow: 1, flexShrink: 0}));
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);
            expect(screen.queryByTestId('table-empty-state-scroll-view')).toBeNull();
        });

        it('should keep the focused search input mounted when a page-header table changes to no results', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();
            const onEndReached = jest.fn();
            const onStartReached = jest.fn();
            const onViewableItemsChanged = jest.fn();

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    headerComponent={
                        <>
                            <Text testID="table-header-component">Page header</Text>
                            <Table.FilterBar label="Search" />
                        </>
                    }
                    shouldUseStickyColumnHeader
                    onEndReached={onEndReached}
                    onStartReached={onStartReached}
                    onViewableItemsChanged={onViewableItemsChanged}
                >
                    <Table.NoResultsState />
                    <Table.Body />
                </Table>,
            );

            const searchInput = screen.getByTestId('search-input');
            const searchInputNativeID: unknown = searchInput.props.nativeID;
            expect(tableRef.current?.getActiveSearchString()).toBe('');
            expect(mockFlashListMount).toHaveBeenCalledTimes(1);
            expect(mockFlashListUnmount).not.toHaveBeenCalled();
            expect(mockTextInputMount).toHaveBeenCalledTimes(1);
            expect(mockTextInputUnmount).not.toHaveBeenCalled();
            fireEvent(searchInput, 'focus');
            expect(mockTextInputNativeFocus).toHaveBeenCalledTimes(1);
            expect(mockTextInputNativeBlur).not.toHaveBeenCalled();
            expect(mockTextInputFocus).not.toHaveBeenCalled();
            fireEvent.changeText(searchInput, 'no-match-search');

            const flashList = screen.getByTestId('flash-list');
            expect(screen.getAllByTestId('generic-empty-state')).toHaveLength(1);
            expect(within(flashList).getByTestId('generic-empty-state')).toBeTruthy();
            expect(within(flashList).getByTestId('table-header-component')).toBeTruthy();
            expect(within(flashList).getByTestId('search-input').props.value).toBe('no-match-search');
            expect(within(flashList).getByTestId('search-input').props.nativeID).toBe(searchInputNativeID);
            expect(tableRef.current?.getActiveSearchString()).toBe('no-match-search');
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.onEndReached).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.onStartReached).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.onViewableItemsChanged).toBeUndefined();
            expect(mockFlashListScrollToOffset).toHaveBeenCalledWith({offset: 0, animated: false});
            expect(mockFlashListMount).toHaveBeenCalledTimes(1);
            expect(mockFlashListUnmount).not.toHaveBeenCalled();
            expect(mockTextInputMount).toHaveBeenCalledTimes(1);
            expect(mockTextInputUnmount).not.toHaveBeenCalled();
            expect(mockTextInputNativeFocus).toHaveBeenCalledTimes(1);
            expect(mockTextInputNativeBlur).not.toHaveBeenCalled();
            expect(mockTextInputFocus).not.toHaveBeenCalled();
            expect(screen.queryByTestId('table-empty-state-scroll-view')).toBeNull();

            fireEvent.changeText(searchInput, '');

            expect(screen.getByTestId('flash-list')).toBeTruthy();
            expect(screen.queryByTestId('generic-empty-state')).toBeNull();
            expect(screen.getByTestId('search-input').props.nativeID).toBe(searchInputNativeID);
            expect(tableRef.current?.getActiveSearchString()).toBe('');
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 2);
            expect(mockFlashListProps.at(-1)?.onEndReached).toBe(onEndReached);
            expect(mockFlashListProps.at(-1)?.onStartReached).toBe(onStartReached);
            expect(mockFlashListProps.at(-1)?.onViewableItemsChanged).toBe(onViewableItemsChanged);
            expect(mockFlashListMount).toHaveBeenCalledTimes(1);
            expect(mockFlashListUnmount).not.toHaveBeenCalled();
            expect(mockTextInputMount).toHaveBeenCalledTimes(1);
            expect(mockTextInputUnmount).not.toHaveBeenCalled();
            expect(mockTextInputNativeFocus).toHaveBeenCalledTimes(1);
            expect(mockTextInputNativeBlur).not.toHaveBeenCalled();
            expect(mockTextInputFocus).not.toHaveBeenCalled();
        });

        it('should clear the query when the page-header search input is actually removed', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();
            const renderTable = (shouldShowSearch: boolean) => (
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    headerComponent={
                        <>
                            <Text testID="table-header-component">Page header</Text>
                            {shouldShowSearch && <Table.FilterBar label="Search" />}
                        </>
                    }
                >
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable(true));
            const searchInput = screen.getByTestId('search-input');
            fireEvent(searchInput, 'focus');
            fireEvent.changeText(searchInput, 'apple');
            expect(tableRef.current?.getActiveSearchString()).toBe('apple');

            rerender(renderTable(false));

            expect(screen.queryByTestId('search-input')).toBeNull();
            expect(tableRef.current?.getActiveSearchString()).toBe('');
            expect(mockTextInputUnmount).toHaveBeenCalledTimes(1);
            expect(mockTextInputNativeBlur).toHaveBeenCalledTimes(1);
            expect(mockFlashListMount).toHaveBeenCalledTimes(1);
            expect(mockFlashListUnmount).not.toHaveBeenCalled();
        });

        it('should preserve a styled list footer without letting it displace the no-results content', () => {
            const props = createDefaultProps();
            const listFooterComponentStyle = {
                flexGrow: 1,
                justifyContent: 'flex-end' as const,
            };

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    headerComponent={
                        <>
                            <Text testID="table-header-component">Page header</Text>
                            <Table.FilterBar label="Search" />
                        </>
                    }
                    ListFooterComponent={<Text testID="list-footer">Disclaimer</Text>}
                    ListFooterComponentStyle={listFooterComponentStyle}
                    shouldUseStickyColumnHeader
                >
                    <Table.NoResultsState />
                    <Table.Body contentContainerStyle={{flexGrow: 1, minHeight: 600, paddingBottom: 12}} />
                </Table>,
            );

            expect(screen.getAllByTestId('list-footer')).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.ListFooterComponentStyle).toEqual(listFooterComponentStyle);

            fireEvent.changeText(screen.getByTestId('search-input'), 'no-match-search');

            const flashList = screen.getByTestId('flash-list');
            expect(screen.getByTestId('generic-empty-state')).toBeTruthy();
            expect(screen.getAllByTestId('list-footer')).toHaveLength(1);
            expect(within(flashList).getByTestId('list-footer')).toBeTruthy();
            expect(StyleSheet.flatten(mockFlashListProps.at(-1)?.contentContainerStyle)).toEqual(
                expect.objectContaining({
                    flexGrow: 1,
                    minHeight: 600,
                    paddingBottom: 12,
                }),
            );
            expect(mockFlashListProps.at(-1)?.ListFooterComponentStyle).toBeUndefined();
            const footerAncestorStyles: unknown[] = [];
            let footerAncestor = screen.getByTestId('list-footer').parent;
            while (footerAncestor) {
                footerAncestorStyles.push(StyleSheet.flatten(footerAncestor.props.style));
                footerAncestor = footerAncestor.parent;
            }
            expect(footerAncestorStyles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        flexGrow: 0,
                        justifyContent: listFooterComponentStyle.justifyContent,
                    }),
                ]),
            );

            fireEvent.changeText(screen.getByTestId('search-input'), '');

            expect(screen.getByTestId('flash-list')).toBeTruthy();
            expect(screen.getAllByTestId('list-footer')).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.ListFooterComponentStyle).toEqual(listFooterComponentStyle);
        });

        it('should render Table.EmptyState as a sibling when no page header is present', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.Body />
                </Table>,
            );

            // Without a page header the body renders nothing and the empty state fills the table area.
            expect(screen.getByTestId('generic-empty-state')).toBeTruthy();
            expect(screen.queryByTestId('flash-list')).toBeNull();
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

        it('should preserve headerComponent search state while filtering data', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    headerComponent={<Table.FilterBar label="Search" />}
                >
                    <Table.Body />
                </Table>,
            );

            fireEvent.changeText(screen.getByTestId('search-input'), 'apple');

            expect(screen.getByTestId('search-input').props.value).toBe('apple');
            expect(screen.getByTestId('row-1')).toBeTruthy();
            expect(screen.queryByTestId('row-2')).toBeNull();
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
});
