import type {ListRenderItemInfo} from '@shopify/flash-list';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Table from '@components/Table';
import type {TableColumn, TableData} from '@components/Table';
import Text from '@components/Text';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
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

// Controllable responsive layout mock so each test can simulate a specific screen / RHP context.
const mockResponsiveLayout = jest.fn<ResponsiveLayoutResult, []>();
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => mockResponsiveLayout(),
}));

// Selection mode (mobile long-press mode) is off by default in these tests.
jest.mock('@hooks/useMobileSelectionMode', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

// Mock useLocalize hook so translate returns the key verbatim.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

// Mock useThemeStyles hook
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

// Mock useStyleUtils hook
jest.mock('@hooks/useStyleUtils', () => jest.fn(() => new Proxy({}, {get: () => () => ({})})));

// Mock useTheme hook
jest.mock('@hooks/useTheme', () => jest.fn(() => new Proxy({}, {get: () => '#000000'})));

// Mock useLazyAsset hook
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => new Proxy({}, {get: () => 'MockIcon'})),
}));

// Mock Icon component
jest.mock('@components/Icon', () => {
    function MockIcon(): null {
        return null;
    }
    return MockIcon;
});

// Table.Row uses the row highlight animation, which depends on the ScreenWrapper transition context we don't render here.
jest.mock('@hooks/useAnimatedHighlightStyle', () => ({
    __esModule: true,
    default: jest.fn(() => ({})),
}));

// OfflineWithFeedback pulls in network/Onyx context; render its children directly for this isolated unit test.
jest.mock('@components/OfflineWithFeedback', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {View: RNView} = jest.requireActual<typeof import('react-native')>('react-native');
    function MockOfflineWithFeedback({children}: {children: React.ReactNode}) {
        return <RNView>{children}</RNView>;
    }
    return MockOfflineWithFeedback;
});

type TestItem = TableData & {
    id: string;
    name: string;
};

type TestColumnKey = 'name';

const mockData: TestItem[] = [
    {keyForList: '1', id: '1', name: 'Apple'},
    {keyForList: '2', id: '2', name: 'Banana'},
    {keyForList: '3', id: '3', name: 'Carrot'},
];

const mockColumns: Array<TableColumn<TestColumnKey>> = [{key: 'name', label: 'Name', sortable: false}];

const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
    <Table.Row
        interactive
        rowIndex={index}
        accessibilityLabel={item.name}
    >
        <View testID={`row-${item.id}`}>
            <Text>{item.name}</Text>
        </View>
    </Table.Row>
);

function renderSelectableTable(shouldEnableSelectionInNarrowPaneModal: boolean) {
    return render(
        <Table<TestItem, TestColumnKey>
            data={mockData}
            columns={mockColumns}
            renderItem={renderItem}
            keyExtractor={(item) => item.keyForList}
            selectionEnabled
            selectedKeys={[]}
            onRowSelectionChange={jest.fn()}
            shouldEnableSelectionInNarrowPaneModal={shouldEnableSelectionInNarrowPaneModal}
        >
            <Table.Header />
            <Table.Body />
        </Table>,
    );
}

const RHP_WIDE_SCREEN: ResponsiveLayoutResult = {
    // Inside the RHP shouldUseNarrowLayout is always true even on a wide desktop window.
    shouldUseNarrowLayout: true,
    isInNarrowPaneModal: true,
    isSmallScreenWidth: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: true,
    isSmallScreen: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: false,
};

describe('Table selection inside a narrow pane modal (RHP)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockResponsiveLayout.mockReturnValue(RHP_WIDE_SCREEN);
    });

    // Regression test for https://github.com/Expensify/App/pull/95224:
    // Selection was fully broken for a Table rendered in the RHP because selection visibility keyed off
    // shouldUseNarrowLayout, which is always true in the RHP. Opting into shouldEnableSelectionInNarrowPaneModal
    // must key selection off the real screen size, so checkboxes render on a wide-desktop RHP.
    it('renders selection checkboxes on a wide-desktop RHP when shouldEnableSelectionInNarrowPaneModal is set', () => {
        renderSelectableTable(true);

        expect(screen.getAllByLabelText('common.select')).toHaveLength(mockData.length);
    });

    // The opt-in must be scoped: without the prop, an RHP table keeps the original behavior (no checkboxes on a
    // wide-desktop RHP), so other RHP consumers (Categories, Tags, Expense Rules) are unaffected.
    it('does not render selection checkboxes on a wide-desktop RHP when the opt-in prop is not set', () => {
        renderSelectableTable(false);

        expect(screen.queryAllByLabelText('common.select')).toHaveLength(0);
    });
});
