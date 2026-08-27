import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import Table, {composeTableListHeader} from '@components/Table';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import Text from '@components/Text';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {acquireBackgroundInputFocusSuppression} from '@libs/ModalFocusManager';
import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Onyx from 'react-native-onyx';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';

type TestInstance = ReturnType<typeof screen.getByTestId>;

type MockViewToken<T> = {
    item: T;
    key: string;
    index: number | null;
    isViewable: boolean;
    timestamp: number;
};

type MockViewabilityInfo<T> = {
    viewableItems: Array<MockViewToken<T>>;
    changed: Array<MockViewToken<T>>;
};

type MockFlashListProps<T> = {
    data?: T[];
    renderItem?: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;
    initialScrollIndex?: number | null;
    ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
    ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
    ListEmptyComponentStyle?: React.ComponentProps<typeof View>['style'];
    ListFooterComponent?: React.ComponentType | React.ReactElement | null;
    ListFooterComponentStyle?: React.ComponentProps<typeof View>['style'];
    contentContainerStyle?: React.ComponentProps<typeof View>['style'];
    onEndReached?: () => void;
    onChangeStickyIndex?: (current: number, previous: number) => void;
    onLoad?: (info: {elapsedTimeInMs: number}) => void;
    onScroll?: (event: {nativeEvent: {contentOffset: {y: number}}}) => void;
    onStartReached?: () => void;
    onViewableItemsChanged?: (info: MockViewabilityInfo<T>) => void;
    overrideItemLayout?: (layout: {span?: number}, item: T, index: number, maxColumns: number, extraData?: unknown) => void;
    stickyHeaderIndices?: number[];
    viewabilityConfigCallbackPairs?: Array<{
        viewabilityConfig: Record<string, unknown>;
        onViewableItemsChanged: ((info: MockViewabilityInfo<T>) => void) | null;
    }>;
};

const mockFlashListScrollToIndex = jest.fn();
const mockFlashListScrollToItem = jest.fn();
const mockFlashListScrollToOffset = jest.fn();
const mockFlashListGetLayout = jest.fn();
const mockFlashListComputeVisibleIndices = jest.fn();
const mockFlashListGetFirstVisibleIndex = jest.fn();
const mockFlashListMount = jest.fn();
const mockFlashListUnmount = jest.fn();
const mockTextInputFocus = jest.fn();
const mockTextInputBlur = jest.fn();
const mockTextInputMount = jest.fn();
const mockTextInputUnmount = jest.fn();
const mockTextInputNativeFocus = jest.fn();
const mockTextInputNativeBlur = jest.fn();
let mockNextTextInputInstanceID = 0;
let mockFlashListProps: Array<MockFlashListProps<unknown>> = [];
let mockFlashListMeasurementTargetIndexes: number[] = [];
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

// FilterPopupButton (rendered by the filter bar triggers) imports useIsFocused from @react-navigation/core,
// which needs a NavigationContainer unless mocked
jest.mock('@react-navigation/core', () => {
    const actualNavCore = jest.requireActual<typeof Navigation>('@react-navigation/core');
    return {
        ...actualNavCore,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(() => false),
    },
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

jest.mock('@components/MenuItem', () => {
    function MockMenuItem(): null {
        return null;
    }
    return MockMenuItem;
});

jest.mock('@components/Modal', () => {
    function MockModal({isVisible, children}: {isVisible: boolean; children?: React.ReactNode}): React.ReactNode {
        return isVisible ? children : null;
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
                getLayout: typeof mockFlashListGetLayout;
                computeVisibleIndices: typeof mockFlashListComputeVisibleIndices;
                getFirstVisibleIndex: typeof mockFlashListGetFirstVisibleIndex;
            }>,
        ) => {
            mockFlashListProps.push(props);
            const data = props.data ?? [];
            const stickyHeaderIndex = props.stickyHeaderIndices?.at(0);
            const stickyHeaderItem = stickyHeaderIndex === undefined ? undefined : data.at(stickyHeaderIndex);
            const emptyComponent = renderComponent(props.ListEmptyComponent);
            const renderedEmptyComponent = props.ListEmptyComponentStyle ? <RNView style={props.ListEmptyComponentStyle}>{emptyComponent}</RNView> : emptyComponent;

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
                getLayout: mockFlashListGetLayout,
                computeVisibleIndices: mockFlashListComputeVisibleIndices,
                getFirstVisibleIndex: mockFlashListGetFirstVisibleIndex,
            }));

            return (
                <RNView testID="flash-list">
                    {renderComponent(props.ListHeaderComponent)}
                    {data.length === 0
                        ? renderedEmptyComponent
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
                    {mockFlashListMeasurementTargetIndexes.map((index) => {
                        const item = data.at(index);
                        if (item === undefined) {
                            return null;
                        }

                        return (
                            <RNView
                                key={`measurement-${index}`}
                                testID={`flash-list-measurement-${index}`}
                            >
                                {props.renderItem?.({
                                    item,
                                    index,
                                    target: 'Measurement',
                                } as ListRenderItemInfo<unknown>)}
                            </RNView>
                        );
                    })}
                    {stickyHeaderItem !== undefined && stickyHeaderIndex !== undefined && (
                        <RNView testID="flash-list-sticky-header">
                            {props.renderItem?.({
                                item: stickyHeaderItem,
                                index: stickyHeaderIndex,
                                target: 'StickyHeader',
                            } as ListRenderItemInfo<unknown>)}
                        </RNView>
                    )}
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
        shouldUseNarrowLayout: mockShouldUseNarrowLayout,
        isMediumScreenWidth: false,
    })),
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
        editable?: boolean;
    };
    const MockTextInput = ReactLocal.forwardRef((props: MockTextInputProps, ref: React.Ref<{focus: () => void; blur: () => void; isFocused: () => boolean}>) => {
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
            blur: () => {
                isFocusedRef.current = false;
                mockTextInputBlur();
            },
            isFocused: () => isFocusedRef.current,
        }));

        return (
            <RNView>
                <RNTextInput
                    testID="search-input"
                    nativeID={nativeID}
                    accessibilityLabel={props.accessibilityLabel}
                    editable={props.editable}
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

// Mock PressableWithFeedback, but keep the module's other exports (e.g. the Pressable variants the modal
// Backdrop relies on) so the filter popover can still mount.
jest.mock('@components/Pressable', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/Pressable'),
    PressableWithFeedback: ({children, ...props}: {children: React.ReactNode}) => {
        const {Pressable} = jest.requireActual<Record<string, React.FC<Record<string, unknown>>>>('react-native');
        // Forward every prop (testID, onPress, accessibility props, …) so list rows inside the filter popover
        // stay pressable by their testID.
        return <Pressable {...props}>{children}</Pressable>;
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

function getHostTableRows(): TestInstance[] {
    return screen.UNSAFE_getAllByProps({role: CONST.ROLE.ROW}).filter((row) => typeof row.type === 'string');
}

function getHostTableRowsWithin(container: TestInstance): TestInstance[] {
    return within(container)
        .UNSAFE_getAllByProps({role: CONST.ROLE.ROW})
        .filter((row) => typeof row.type === 'string');
}

describe('Table', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFlashListProps = [];
        mockFlashListMeasurementTargetIndexes = [];
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

            expect(screen.getByLabelText('Name')).toBeTruthy();
            expect(screen.getByLabelText('Category')).toBeTruthy();
            expect(screen.getByLabelText('Value')).toBeTruthy();
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

            expect(screen.getByLabelText('Name')).toBeTruthy();
            expect(screen.getByLabelText('Category')).toBeTruthy();
            expect(screen.getByLabelText('Value')).toBeTruthy();
        });

        it('should relocate the declared Table.Header into the sticky list row when a page header is present', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.Header testID="declared-table-header" />
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Body />
                </Table>,
            );

            expect(Table.Header.type).toBe('header');
            expect(within(screen.getByTestId('flash-list')).getByTestId('declared-table-header')).toBeTruthy();
            expect(screen.getAllByTestId('table-header-component')).toHaveLength(1);
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            activateStickyHeadersAfterListLoad();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
        });

        it('should render ListHeader and keep row indexes aligned with data rows', () => {
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
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('table-header-component')).toBeTruthy();
            expect(screen.getAllByLabelText('Name').length).toBeGreaterThan(0);
            expect(screen.getByTestId('row-index-1').props.children).toBe(0);
            expect(mockFlashListProps.at(-1)?.ListHeaderComponent).toBeDefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);
        });

        it('should compose ListHeaderComponent and ListHeader as the persistent list header', () => {
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
                    ListHeaderComponent={<Text testID="table-list-header-component">List header</Text>}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('table-list-header-component')).toBeTruthy();
            expect(screen.getByTestId('table-header-component')).toBeTruthy();
            expect(screen.getByTestId('row-index-1').props.children).toBe(0);
            expect(mockFlashListProps.at(-1)?.ListHeaderComponent).toBeDefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

            activateStickyHeadersAfterListLoad();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
        });

        it('should use ListHeaderComponent alone as page content for the declared table header', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    ListHeaderComponent={<Text testID="table-list-header-component">List header</Text>}
                >
                    <Table.Header testID="declared-table-header" />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('table-list-header-component')).toBeTruthy();
            expect(within(screen.getByTestId('flash-list')).getByTestId('declared-table-header')).toBeTruthy();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();

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

        it('should keep page-header rows in a persistent physical table ancestor', () => {
            const props = createDefaultProps();
            const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
                <Table.Row
                    rowIndex={index}
                    interactive={false}
                    accessibilityLabel={item.name}
                >
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.name}</Text>
                    </View>
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.category}</Text>
                    </View>
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.value}</Text>
                    </View>
                </Table.Row>
            );

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={renderItem}
                    keyExtractor={props.keyExtractor}
                    title="Members"
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page controls</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            const table = screen.getByLabelText('Members');
            const rows = getHostTableRows().filter((row) => row.props['aria-hidden'] !== true);
            const pageControls = screen.getByTestId('table-header-component');

            expect(within(table).getByTestId('table-header-component')).toBe(pageControls);
            expect(within(table).queryByRole(CONST.ROLE.ROWGROUP)).toBeNull();
            expect(getHostTableRowsWithin(table).filter((row) => row.props['aria-hidden'] !== true)).toHaveLength(rows.length);
            expect(table.props['aria-rowcount']).toBe(props.data.length + 1);
            expect(table.props['aria-colcount']).toBe(props.columns.length);
        });

        it('should expose only data rows when a page-header table has no active column header', () => {
            const props = createDefaultProps();
            const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
                <Table.Row
                    rowIndex={index}
                    interactive={false}
                    accessibilityLabel={item.name}
                >
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.name}</Text>
                    </View>
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.category}</Text>
                    </View>
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.value}</Text>
                    </View>
                </Table.Row>
            );

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={renderItem}
                    keyExtractor={props.keyExtractor}
                    title="Members"
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page controls</Text>
                    </Table.ListHeader>
                    <Table.Body />
                </Table>,
            );

            const table = screen.getByLabelText('Members');
            const rows = getHostTableRows().filter((row) => row.props['aria-hidden'] !== true);

            expect(within(table).getByTestId('table-header-component')).toBeTruthy();
            expect(within(table).queryByRole(CONST.ROLE.ROWGROUP)).toBeNull();
            expect(table.props['aria-rowcount']).toBe(props.data.length);
            expect(rows.at(0)?.props['aria-rowindex']).toBe(1);
        });

        it('should expose only the active sticky semantic header', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    title="Members"
                    selectionEnabled
                    selectedKeys={[]}
                    onRowSelectionChange={jest.fn()}
                >
                    <Table.ListHeader>
                        <Text>Page controls</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            const initialHeaders = getHostTableRows().filter((row) => row.props['aria-rowindex'] === 1 && row.props['aria-hidden'] !== true);
            expect(initialHeaders).toHaveLength(1);

            activateStickyHeadersAfterListLoad();
            act(() => {
                mockFlashListProps.at(-1)?.onChangeStickyIndex?.(0, -1);
            });

            const allHeaders = getHostTableRows().filter((row) => row.props['aria-rowindex'] === 1);
            const accessibleHeaders = allHeaders.filter((row) => row.props['aria-hidden'] !== true);
            const hiddenHeaders = allHeaders.filter((row) => row.props['aria-hidden'] === true);
            expect(accessibleHeaders).toHaveLength(1);
            expect(hiddenHeaders).toHaveLength(1);

            const hiddenHeader = hiddenHeaders.at(0);
            const accessibleHeader = accessibleHeaders.at(0);
            if (!hiddenHeader || !accessibleHeader) {
                throw new Error('Expected one hidden and one accessible table header');
            }
            expect(
                within(hiddenHeader)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'Name'})
                    .some((node) => node.props.disabled === true && node.props.tabIndex === -1),
            ).toBe(true);
            expect(
                within(hiddenHeader)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'workspace.common.selectAll'})
                    .some((node) => node.props.disabled === true && node.props.tabIndex === -1),
            ).toBe(true);
            expect(
                within(accessibleHeader)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'Name'})
                    .some((node) => node.props.disabled === false && node.props.tabIndex === undefined),
            ).toBe(true);
            expect(
                within(accessibleHeader)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'workspace.common.selectAll'})
                    .some((node) => node.props.disabled === false && node.props.tabIndex === undefined),
            ).toBe(true);
            expect(screen.getByTestId('flash-list-sticky-header')).toBeTruthy();
        });

        it('should keep FlashList measurement copies inert without remounting the focused search input', () => {
            const props = createDefaultProps();
            const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
                <Table.Row
                    rowIndex={index}
                    interactive
                    accessibilityLabel={item.name}
                >
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.name}</Text>
                    </View>
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.category}</Text>
                    </View>
                    <View role={CONST.ROLE.CELL}>
                        <Text>{item.value}</Text>
                    </View>
                </Table.Row>
            );
            const renderTable = () => (
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                    title="Members"
                    selectionEnabled
                    selectedKeys={[]}
                    onRowSelectionChange={jest.fn()}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page controls</Text>
                        <Table.FilterBar label="Search" />
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>
            );

            // The page controls live in FlashList's persistent header. Only the column header and data rows are
            // virtualized, at indexes 0 and 1 respectively.
            mockFlashListMeasurementTargetIndexes = [0, 1];
            const {rerender} = render(renderTable());

            const table = screen.getByLabelText('Members');
            const visibleRows = getHostTableRows().filter((row) => row.props['aria-hidden'] !== true);
            expect(within(table).getByTestId('table-header-component')).toBeTruthy();
            expect(getHostTableRowsWithin(table).filter((row) => row.props['aria-hidden'] !== true)).toHaveLength(visibleRows.length);
            expect(mockFlashListProps.at(-1)?.ListHeaderComponent).toBeDefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);

            const virtualizedHeaderMeasurement = screen.getByTestId('flash-list-measurement-0');
            expect(within(virtualizedHeaderMeasurement).queryByTestId('table-header-component')).toBeNull();
            expect(within(virtualizedHeaderMeasurement).queryByTestId('search-input')).toBeNull();
            expect(within(virtualizedHeaderMeasurement).queryByRole(CONST.ROLE.TABLE)).toBeNull();
            const measurementHeader = getHostTableRowsWithin(screen.getByTestId('flash-list-measurement-0')).at(0);
            const measurementDataRow = getHostTableRowsWithin(screen.getByTestId('flash-list-measurement-1')).at(0);
            if (!measurementHeader || !measurementDataRow) {
                throw new Error('Expected FlashList measurement copies for the header and first data row');
            }
            expect(measurementHeader.props['aria-hidden']).toBe(true);
            expect(measurementHeader.props.id).toBeUndefined();
            expect(measurementHeader.props.inert).toBe(true);
            expect(measurementDataRow.props['aria-hidden']).toBe(true);
            expect(measurementDataRow.props.id).toBeUndefined();
            expect(measurementDataRow.props.inert).toBe(true);
            expect(measurementDataRow.props.tabIndex).toBe(-1);
            expect(measurementDataRow.props.onPress).toBeUndefined();
            expect(within(screen.getByTestId('flash-list-measurement-1')).UNSAFE_queryAllByProps({tabIndex: 0})).toHaveLength(0);
            expect(
                within(measurementHeader)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'Name'})
                    .some((node) => node.props.disabled === true && node.props.tabIndex === -1),
            ).toBe(true);
            expect(
                within(measurementHeader)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'workspace.common.selectAll'})
                    .some((node) => node.props.disabled === true && node.props.tabIndex === -1),
            ).toBe(true);
            expect(
                within(measurementDataRow)
                    .UNSAFE_getAllByProps({accessibilityLabel: 'common.select'})
                    .some((node) => node.props.disabled === true && node.props.tabIndex === -1),
            ).toBe(true);

            const searchInput = screen.getByTestId('search-input');
            const searchInputNativeID: unknown = searchInput.props.nativeID;
            fireEvent(searchInput, 'focus');
            fireEvent.changeText(searchInput, 'a');

            mockFlashListMeasurementTargetIndexes = [];
            rerender(renderTable());

            expect(screen.getByTestId('search-input').props.nativeID).toBe(searchInputNativeID);
            expect(screen.getByTestId('search-input').props.value).toBe('a');
            expect(mockFlashListMount).toHaveBeenCalledTimes(1);
            expect(mockFlashListUnmount).not.toHaveBeenCalled();
            expect(mockTextInputMount).toHaveBeenCalledTimes(1);
            expect(mockTextInputUnmount).not.toHaveBeenCalled();
            expect(mockTextInputNativeBlur).not.toHaveBeenCalled();
        });

        it('keeps table search suppressed until every modal owner releases and then blurs without refocusing', () => {
            const props = createDefaultProps();
            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.ListHeader>
                        <Table.FilterBar label="Search" />
                    </Table.ListHeader>
                    <Table.Body />
                </Table>,
            );

            const searchInput = screen.getByTestId('search-input');
            fireEvent(searchInput, 'focus');
            fireEvent.changeText(searchInput, 'apple');

            let releaseFirstOwner = () => {};
            let releaseSecondOwner = () => {};
            act(() => {
                releaseFirstOwner = acquireBackgroundInputFocusSuppression();
                releaseSecondOwner = acquireBackgroundInputFocusSuppression();
            });

            expect(screen.getByTestId('search-input').props.editable).toBe(false);
            expect(mockTextInputFocus).not.toHaveBeenCalled();
            expect(mockTextInputBlur).not.toHaveBeenCalled();

            act(() => releaseFirstOwner());
            expect(screen.getByTestId('search-input').props.editable).toBe(false);
            expect(mockTextInputBlur).not.toHaveBeenCalled();

            act(() => releaseSecondOwner());
            expect(screen.getByTestId('search-input').props.editable).toBe(true);
            expect(mockTextInputFocus).not.toHaveBeenCalled();
            expect(mockTextInputBlur).toHaveBeenCalledTimes(1);
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
                >
                    <Table.ListHeader>
                        {composeTableListHeader(shouldShowOptionalHeader && <Text testID="optional-header">Optional header</Text>, <Table.FilterBar label="Search" />)}
                    </Table.ListHeader>
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

        it('should defer sticky table header activation until a remounted page-header list loads', () => {
            const props = createDefaultProps();
            const renderTable = (data: TestItem[]) => (
                <Table<TestItem, TestColumnKey>
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable(props.data));
            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);

            rerender(renderTable([]));
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(mockFlashListUnmount).toHaveBeenCalledTimes(1);

            let animationFrameCallback: FrameRequestCallback | undefined;
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrameCallback = callback;
                return 1;
            });

            rerender(renderTable(props.data));
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);
            expect(animationFrameCallback).toBeUndefined();

            act(() => {
                mockFlashListProps.at(-1)?.onLoad?.({elapsedTimeInMs: 1});
            });

            if (!animationFrameCallback) {
                throw new Error('Expected sticky-header activation to be scheduled after the remounted list loads');
            }

            act(() => {
                animationFrameCallback?.(0);
            });
            requestAnimationFrameSpy.mockRestore();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
        });

        it('should temporarily remove the sticky table header while search has no results', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                        <Table.FilterBar label="Search" />
                    </Table.ListHeader>
                    <Table.NoResultsState />
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);

            fireEvent.changeText(screen.getByTestId('search-input'), 'xyz123nonexistent');

            expect(screen.getByTestId('flash-list')).toBeTruthy();
            expect(screen.getByTestId('generic-empty-state')).toBeTruthy();
            expect(screen.queryByRole(CONST.ROLE.TABLE)).toBeNull();
            expect(screen.queryByRole(CONST.ROLE.ROWGROUP)).toBeNull();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(0);
            act(() => tableRef.current?.scrollToIndex({index: 0, animated: false}));
            expect(mockFlashListScrollToIndex).toHaveBeenLastCalledWith({index: 0, animated: false});

            let animationFrameCallback: FrameRequestCallback | undefined;
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrameCallback = callback;
                return 1;
            });

            fireEvent.changeText(screen.getByTestId('search-input'), '');

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);

            if (!animationFrameCallback) {
                throw new Error('Expected sticky-header activation to be rescheduled when rows return');
            }

            act(() => {
                animationFrameCallback?.(0);
            });
            requestAnimationFrameSpy.mockRestore();

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
            act(() => tableRef.current?.scrollToIndex({index: 0, animated: false}));
            expect(mockFlashListScrollToIndex).toHaveBeenLastCalledWith({index: 1, animated: false});
        });

        it('should defer sticky table header activation again when the list remounts', () => {
            const props = createDefaultProps();
            const renderTable = (data: TestItem[]) => (
                <Table<TestItem, TestColumnKey>
                    data={data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
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
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable([]));
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(screen.getByTestId('table-empty-state-scroll-view')).toBeTruthy();

            rerender(renderTable(props.data));
            expect(screen.getByTestId('flash-list')).toBeTruthy();
            const scrollToIndex = tableRef.current?.scrollToIndex;
            if (!scrollToIndex) {
                throw new Error('Expected table ref methods to be restored after rows return');
            }

            act(() => {
                scrollToIndex({index: 0, animated: false});
            });

            expect(mockFlashListScrollToIndex).toHaveBeenCalledWith({
                index: 1,
                animated: false,
            });
        });

        it('should defer sticky table header activation when the declared header returns', () => {
            const props = createDefaultProps();
            const renderTable = (shouldShowTableHeader: boolean) => (
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    {shouldShowTableHeader && <Table.Header />}
                    <Table.Body />
                </Table>
            );

            const {rerender} = render(renderTable(true));
            activateStickyHeadersAfterListLoad();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);

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

            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toEqual([0]);
        });

        it('should keep the declared Table.Header inline without a page header', () => {
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
                    <Table.Header testID="declared-table-header" />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('declared-table-header')).toBeTruthy();
            expect(within(screen.getByTestId('flash-list')).queryByTestId('declared-table-header')).toBeNull();
            expect(mockFlashListProps.at(-1)?.stickyHeaderIndices).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length);
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

        it('should offset scrollToIndex calls for the synthetic table-header row', () => {
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
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
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
                index: 1,
                animated: false,
            });
        });

        it('should translate index-bearing FlashList props around the synthetic table-header row', () => {
            const props = createDefaultProps();
            const onViewableItemsChanged = jest.fn();
            const pairedOnViewableItemsChanged = jest.fn();
            const overrideItemLayout = jest.fn();

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    initialScrollIndex={2}
                    onViewableItemsChanged={onViewableItemsChanged}
                    overrideItemLayout={overrideItemLayout}
                    viewabilityConfigCallbackPairs={[
                        {
                            viewabilityConfig: {itemVisiblePercentThreshold: 50},
                            onViewableItemsChanged: pairedOnViewableItemsChanged,
                        },
                    ]}
                >
                    <Table.ListHeader>
                        <Text>Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            const flashListProps = mockFlashListProps.at(-1);
            const syntheticHeader = flashListProps?.data?.at(0);
            const firstDataRow = flashListProps?.data?.at(1);
            if (!flashListProps || !syntheticHeader || !firstDataRow) {
                throw new Error('Expected synthetic and data rows to be supplied to FlashList');
            }

            expect(flashListProps.initialScrollIndex).toBe(3);

            const layout = {};
            flashListProps.overrideItemLayout?.(layout, syntheticHeader, 0, 1);
            expect(overrideItemLayout).not.toHaveBeenCalled();
            flashListProps.overrideItemLayout?.(layout, firstDataRow, 1, 1, 'extra');
            expect(overrideItemLayout).toHaveBeenCalledWith(layout, firstDataRow, 0, 1, 'extra');

            const viewabilityInfo = {
                viewableItems: [
                    {
                        item: syntheticHeader,
                        key: 'synthetic-header',
                        index: 0,
                        isViewable: true,
                        timestamp: 1,
                    },
                    {
                        item: firstDataRow,
                        key: 'first-data-row',
                        index: 1,
                        isViewable: true,
                        timestamp: 1,
                    },
                ],
                changed: [
                    {
                        item: firstDataRow,
                        key: 'first-data-row',
                        index: 1,
                        isViewable: false,
                        timestamp: 1,
                    },
                ],
            };
            const expectedViewabilityInfo = {
                viewableItems: [
                    {
                        item: firstDataRow,
                        key: 'first-data-row',
                        index: 0,
                        isViewable: true,
                        timestamp: 1,
                    },
                ],
                changed: [
                    {
                        item: firstDataRow,
                        key: 'first-data-row',
                        index: 0,
                        isViewable: false,
                        timestamp: 1,
                    },
                ],
            };

            flashListProps.onViewableItemsChanged?.(viewabilityInfo);
            flashListProps.viewabilityConfigCallbackPairs?.at(0)?.onViewableItemsChanged?.(viewabilityInfo);

            expect(onViewableItemsChanged).toHaveBeenCalledWith(expectedViewabilityInfo);
            expect(pairedOnViewableItemsChanged).toHaveBeenCalledWith(expectedViewabilityInfo);
        });

        it('should translate index-bearing FlashList ref methods and preserve the scroll promise', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();
            const scrollPromise = Promise.resolve();
            const rowLayout = {x: 0, y: 100, width: 100, height: 40};
            mockFlashListScrollToIndex.mockReturnValueOnce(scrollPromise);
            mockFlashListGetLayout.mockReturnValueOnce(rowLayout);
            mockFlashListComputeVisibleIndices.mockReturnValue({
                startIndex: 0,
                endIndex: 2,
            });

            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.ListHeader>
                        <Text>Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(tableRef.current?.scrollToIndex({index: 0, animated: false})).toBe(scrollPromise);
            expect(mockFlashListScrollToIndex).toHaveBeenCalledWith({
                index: 1,
                animated: false,
            });
            expect(tableRef.current?.getLayout(0)).toBe(rowLayout);
            expect(mockFlashListGetLayout).toHaveBeenCalledWith(1);
            expect(tableRef.current?.computeVisibleIndices()).toEqual({
                startIndex: 0,
                endIndex: 1,
            });
            expect(tableRef.current?.getFirstVisibleIndex()).toBe(0);

            mockFlashListComputeVisibleIndices.mockReturnValue({
                startIndex: 0,
                endIndex: 0,
            });
            expect(tableRef.current?.computeVisibleIndices()).toEqual({
                startIndex: -1,
                endIndex: -2,
            });
            expect(tableRef.current?.getFirstVisibleIndex()).toBe(-1);
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

        it('should render a page-header empty state in the centered standalone layout', () => {
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
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Body />
                </Table>,
            );

            expect(screen.getByTestId('table-header-component')).toBeTruthy();
            expect(screen.getByTestId('empty-state')).toBeTruthy();
            expect(screen.getByTestId('table-empty-state-scroll-view')).toBeTruthy();
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(mockFlashListProps).toHaveLength(0);
        });

        it('should render ListEmptyComponent without mounting FlashList when the declared header renders null', () => {
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
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getAllByTestId('empty-state')).toHaveLength(1);
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(mockFlashListProps).toHaveLength(0);
        });

        it('should render Table.EmptyState below a page header in the centered standalone layout', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.EmptyState title="No items yet" />
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header />
                    <Table.Body />
                </Table>,
            );

            expect(screen.getAllByTestId('generic-empty-state')).toHaveLength(1);
            expect(screen.getByTestId('table-header-component')).toBeTruthy();
            expect(screen.getByTestId('table-empty-state-scroll-view')).toBeTruthy();
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(mockFlashListProps).toHaveLength(0);
        });

        it('should center a truly empty table when its composed FilterBar renders null', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.ListHeader>{composeTableListHeader(undefined, <Table.FilterBar label="Search" />)}</Table.ListHeader>
                    <Table.EmptyState title="No items yet" />
                    <Table.Body />
                </Table>,
            );

            expect(screen.queryByTestId('search-input')).toBeNull();
            expect(screen.queryByTestId('flash-list')).toBeNull();
            expect(screen.getByTestId('table-empty-state-scroll-view')).toBeTruthy();
            const emptyStateAncestorStyles: unknown[] = [];
            let emptyStateAncestor = screen.getByTestId('generic-empty-state').parent;
            while (emptyStateAncestor) {
                emptyStateAncestorStyles.push(StyleSheet.flatten(emptyStateAncestor.props.style));
                emptyStateAncestor = emptyStateAncestor.parent;
            }
            expect(emptyStateAncestorStyles).toEqual(expect.arrayContaining([expect.objectContaining({justifyContent: 'center'})]));
        });

        it('should keep an oversized page-header empty state centered and scrollable', () => {
            const props = createDefaultProps();
            mockShouldUseNarrowLayout = true;

            render(
                <Table<TestItem, TestColumnKey>
                    data={[]}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.EmptyState title="No items yet" />
                    <Table.Body contentContainerStyle={{minHeight: 600, paddingBottom: 12}} />
                </Table>,
            );

            const emptyStateScrollView = screen.getByTestId('table-empty-state-scroll-view');
            expect(StyleSheet.flatten(emptyStateScrollView.props.contentContainerStyle)).toEqual(
                expect.objectContaining({
                    flexGrow: 1,
                    paddingBottom: 80,
                }),
            );
            const genericEmptyState = screen.getByTestId('generic-empty-state');
            expect(StyleSheet.flatten(genericEmptyState.props.style)).toEqual(expect.objectContaining({minHeight: 400, flexGrow: 1, flexShrink: 0}));
            const emptyStateAncestorStyles: unknown[] = [];
            let emptyStateAncestor = genericEmptyState.parent;
            while (emptyStateAncestor) {
                emptyStateAncestorStyles.push(StyleSheet.flatten(emptyStateAncestor.props.style));
                emptyStateAncestor = emptyStateAncestor.parent;
            }
            expect(emptyStateAncestorStyles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({justifyContent: 'center'}),
                    expect.objectContaining({
                        minHeight: undefined,
                        paddingBottom: 12,
                    }),
                ]),
            );
            expect(screen.queryByTestId('flash-list')).toBeNull();
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
                    onEndReached={onEndReached}
                    onStartReached={onStartReached}
                    onViewableItemsChanged={onViewableItemsChanged}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                        <Table.FilterBar label="Search" />
                    </Table.ListHeader>
                    <Table.NoResultsState />
                    <Table.Header />
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
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(0);
            expect(StyleSheet.flatten(mockFlashListProps.at(-1)?.ListEmptyComponentStyle)).toEqual(
                expect.objectContaining({
                    flexGrow: 1,
                    justifyContent: 'center',
                }),
            );
            expect(StyleSheet.flatten(mockFlashListProps.at(-1)?.contentContainerStyle)).toEqual(expect.objectContaining({flexGrow: 1}));
            expect(mockFlashListProps.at(-1)?.onEndReached).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.onStartReached).toBeUndefined();
            expect(mockFlashListProps.at(-1)?.onViewableItemsChanged).toBeUndefined();
            expect(mockFlashListScrollToOffset).toHaveBeenCalledWith({
                offset: 0,
                animated: false,
            });
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
            expect(mockFlashListProps.at(-1)?.data).toHaveLength(props.data.length + 1);
            expect(mockFlashListProps.at(-1)?.onEndReached).toBe(onEndReached);
            expect(mockFlashListProps.at(-1)?.onStartReached).toBe(onStartReached);
            expect(mockFlashListProps.at(-1)?.onViewableItemsChanged).toEqual(expect.any(Function));
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
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                        {shouldShowSearch && <Table.FilterBar label="Search" />}
                    </Table.ListHeader>
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
                    ListFooterComponent={<Text testID="list-footer">Disclaimer</Text>}
                    ListFooterComponentStyle={listFooterComponentStyle}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                        <Table.FilterBar label="Search" />
                    </Table.ListHeader>
                    <Table.NoResultsState />
                    <Table.Header />
                    <Table.Body
                        contentContainerStyle={{
                            flexGrow: 1,
                            minHeight: 600,
                            paddingBottom: 12,
                        }}
                    />
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
            expect(StyleSheet.flatten(mockFlashListProps.at(-1)?.ListFooterComponentStyle)).toEqual(
                expect.objectContaining({
                    flexGrow: 0,
                    justifyContent: listFooterComponentStyle.justifyContent,
                }),
            );
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

        it('should preserve ListHeader search state while filtering data', () => {
            const props = createDefaultProps();

            render(
                <Table<TestItem, TestColumnKey>
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    isItemInSearch={props.isItemInSearch}
                >
                    <Table.ListHeader>
                        <Table.FilterBar label="Search" />
                    </Table.ListHeader>
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
            expect(screen.queryByTestId('generic-empty-state')).toBeNull();
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
            expect(screen.getByTestId('generic-empty-state')).toBeTruthy();
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
            jest.mocked(useResponsiveLayout).mockReturnValue(NARROW_LAYOUT);
        });

        afterEach(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            jest.mocked(useResponsiveLayout).mockReturnValue({
                shouldUseNarrowLayout: false,
                isSmallScreenWidth: false,
                isInNarrowPaneModal: false,
                isExtraSmallScreenHeight: false,
                isMediumScreenWidth: false,
                isLargeScreenWidth: false,
                isExtraLargeScreenWidth: false,
                isExtraSmallScreenWidth: false,
                isSmallScreen: false,
                onboardingIsMediumOrLargerScreenWidth: false,
                isInLandscapeMode: false,
            });
        });

        // A staged (non-immediate) MULTI_SELECT variant used to contrast the two rendering paths.
        const stagedFilterConfig: FilterConfig = {
            status: {
                label: 'Status',
                filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
                options: [
                    {label: 'Active', value: STATUS_ACTIVE},
                    {label: 'Archived', value: STATUS_ARCHIVED},
                ],
            },
        };

        function StagedFilterTable() {
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
                                        filters={stagedFilterConfig}
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

        it('renders the filter options inline without a staged Apply/Reset footer', async () => {
            render(<ImmediateFilterTable />);
            await waitForBatchedUpdatesWithAct();

            // Only the active row shows by default (archived is hidden until opted into).
            expect(screen.getByTestId('row-1')).toBeOnTheScreen();
            expect(screen.queryByTestId('row-2')).toBeNull();

            await openFilter();

            // Both options render inline in the popover.
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ACTIVE}`)).toBeOnTheScreen();
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ARCHIVED}`)).toBeOnTheScreen();

            // `immediate` applies each selection right away, so there is no staged Apply/Reset footer.
            expect(screen.queryByText('common.apply')).toBeNull();
            expect(screen.queryByText('common.reset')).toBeNull();
        });

        it('renders a staged Apply/Reset footer when the filter is not immediate', async () => {
            render(<StagedFilterTable />);
            await waitForBatchedUpdatesWithAct();

            await openFilter();

            // Without `immediate`, the same MULTI_SELECT filter stages selections behind an Apply/Reset footer.
            expect(screen.getByText('common.apply')).toBeOnTheScreen();
            expect(screen.getByText('common.reset')).toBeOnTheScreen();
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
            const nameHeader = screen.getByLabelText('Name');
            expect(nameHeader).toBeTruthy();

            const categoryHeader = screen.getByLabelText('Category');
            expect(categoryHeader).toBeTruthy();

            const valueHeader = screen.getByLabelText('Value');
            expect(valueHeader).toBeTruthy();
        });

        it('should toggle sort order through the relocated declared column header', () => {
            const props = createDefaultProps();
            const tableRef = React.createRef<TableHandle<TestItem, TestColumnKey>>();
            render(
                <Table<TestItem, TestColumnKey>
                    ref={tableRef}
                    data={props.data}
                    columns={props.columns}
                    renderItem={props.renderItem}
                    keyExtractor={props.keyExtractor}
                    compareItems={props.compareItems}
                >
                    <Table.ListHeader>
                        <Text testID="table-header-component">Page header</Text>
                    </Table.ListHeader>
                    <Table.Header testID="declared-table-header" />
                    <Table.Body />
                </Table>,
            );

            const nameHeader = within(screen.getByTestId('declared-table-header')).getByLabelText('Name');
            fireEvent.press(nameHeader);

            expect(tableRef.current?.getActiveSorting()).toEqual({columnKey: 'name', order: 'desc'});
            expect(tableRef.current?.getProcessedData().map((item) => item.name)).toEqual(['Eggplant', 'Date', 'Carrot', 'Banana', 'Apple']);
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

            expect(screen.getByLabelText('Name')).toBeTruthy();
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
            expect(screen.getByLabelText('Name')).toBeTruthy();
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
            expect(screen.getByLabelText('Name')).toBeTruthy();
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

        function ControlledSelectableTable({
            data = mockData,
            initialSelected = [],
            showSearch = false,
            shouldPreserveSelectionOnSearch = false,
        }: {
            data?: TestItem[];
            initialSelected?: string[];
            showSearch?: boolean;
            shouldPreserveSelectionOnSearch?: boolean;
        }) {
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
                        shouldPreserveSelectionOnSearch={shouldPreserveSelectionOnSearch}
                        selectedKeys={selectedKeys}
                        isItemInSearch={props.isItemInSearch}
                        onRowSelectionChange={setSelectedKeys}
                    >
                        {showSearch && <Table.FilterBar label="Search" />}
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

        it('should preserve opted-in selection through a no-results search and clear', () => {
            render(
                <ControlledSelectableTable
                    showSearch
                    shouldPreserveSelectionOnSearch
                />,
            );

            pressRow(0);
            pressRow(2);
            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,3$/);
            fireEvent.changeText(screen.getByTestId('search-input'), 'no matching row');
            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,3$/);

            fireEvent.changeText(screen.getByTestId('search-input'), '');
            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^1,3$/);
        });

        it('should keep clearing selection on search when preservation is not enabled', () => {
            render(<ControlledSelectableTable showSearch />);

            pressRow(0);
            pressRow(2);
            fireEvent.changeText(screen.getByTestId('search-input'), 'no matching row');
            expect(screen.getByTestId('selected-keys')).toHaveTextContent(/^$/);
        });
    });
});
