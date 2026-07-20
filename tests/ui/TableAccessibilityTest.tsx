import {render, screen} from '@testing-library/react-native';

import Table from '@components/Table';
import type {TableColumn, TableData} from '@components/Table';
import {useIsInTableGrid} from '@components/Table/TableSemantics';
import Text from '@components/Text';

import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';
import {View} from 'react-native';

const mockResponsiveLayout = jest.fn<ResponsiveLayoutResult, []>();
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => mockResponsiveLayout(),
}));

jest.mock('@hooks/useMobileSelectionMode', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

jest.mock('@hooks/useAnimatedHighlightStyle', () => ({
    __esModule: true,
    default: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/helpers/openInternalRouteInNewTab', () => ({
    __esModule: true,
    default: jest.fn(() => false),
    getRouteURL: (route: string) => new URL(route.startsWith('/') ? route : `/${route}`, globalThis.location.origin).toString(),
}));

jest.mock('@components/OfflineWithFeedback', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

type TestItem = TableData & {name: string};

type TestColumnKey = 'name' | 'actions';

const mockData: TestItem[] = [
    {keyForList: '1', name: 'Apple', errors: {}},
    {keyForList: '2', name: 'Banana', errors: {requestID: null}},
];

// The label-less `actions` column is the decorative caret column every table carries.
const mockColumns: Array<TableColumn<TestColumnKey>> = [
    {key: 'name', label: 'Name', sortable: true},
    {key: 'actions', label: '', sortable: false},
];

const WIDE_SCREEN: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: false,
    isInNarrowPaneModal: false,
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

type RenderedNode = {props: Record<string, unknown>; children: Array<RenderedNode | string> | null};

/** Collects the props of every rendered node matching the predicate, in render order. */
function propsWhere(matches: (props: Record<string, unknown>) => boolean): Array<Record<string, unknown>> {
    const found: Array<Record<string, unknown>> = [];

    const walk = (node: RenderedNode | RenderedNode[] | string | null) => {
        if (!node || typeof node === 'string') {
            return;
        }

        if (Array.isArray(node)) {
            for (const sibling of node) {
                walk(sibling);
            }
            return;
        }

        if (node.props && matches(node.props)) {
            found.push(node.props);
        }

        for (const child of node.children ?? []) {
            walk(child);
        }
    };

    walk(screen.toJSON());
    return found;
}

/** Collects the props of every rendered node carrying the given role. */
function propsByRole(role: string): Array<Record<string, unknown>> {
    return propsWhere((props) => props.role === role);
}

/** Collects the props of every rendered node carrying the given prop as true. */
function propsByProp(prop: string): Array<Record<string, unknown>> {
    return propsWhere((props) => props[prop] === true);
}

const renderItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
    <Table.Row
        interactive
        rowIndex={index}
        accessibilityLabel={item.name}
    >
        <View role={CONST.ROLE.CELL}>
            <Text>{item.name}</Text>
        </View>
    </Table.Row>
);

function renderTable({data, shouldWrapInGrid, selectionEnabled}: {data: TestItem[]; shouldWrapInGrid: boolean; selectionEnabled: boolean}) {
    const body = (
        <>
            <Table.Header />
            <Table.Body />
        </>
    );

    return render(
        <Table<TestItem, TestColumnKey>
            data={data}
            columns={mockColumns}
            renderItem={renderItem}
            keyExtractor={(item) => item.keyForList}
            title="People"
            selectionEnabled={selectionEnabled}
            selectedKeys={[]}
            onRowSelectionChange={jest.fn()}
        >
            {shouldWrapInGrid ? <Table.Grid>{body}</Table.Grid> : body}
        </Table>,
    );
}

const NARROW_SCREEN: ResponsiveLayoutResult = {
    ...WIDE_SCREEN,
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isSmallScreen: true,
    isLargeScreenWidth: false,
    isExtraLargeScreenWidth: false,
};

/** A cell that takes its role from the table, the way a real row's cells do. */
function TestCell({children}: ChildrenProps) {
    return <View role={useIsInTableGrid() ? CONST.ROLE.CELL : undefined}>{children}</View>;
}

/** Renders rows whose cells ask the table whether to expose themselves. */
function renderTableWithDerivedCells() {
    const renderDerivedItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
        <Table.Row
            interactive
            rowIndex={index}
            accessibilityLabel={item.name}
        >
            <TestCell>
                <Text>{item.name}</Text>
            </TestCell>
        </Table.Row>
    );

    return render(
        <Table<TestItem, TestColumnKey>
            data={mockData}
            columns={mockColumns}
            renderItem={renderDerivedItem}
            keyExtractor={(item) => item.keyForList}
            title="People"
        >
            <Table.Grid>
                <Table.Header />
                <Table.Body />
            </Table.Grid>
        </Table>,
    );
}

/** Renders a table already sorted by its one sortable column. */
function renderSortedTable() {
    return render(
        <Table<TestItem, TestColumnKey>
            data={mockData}
            columns={mockColumns}
            renderItem={renderItem}
            keyExtractor={(item) => item.keyForList}
            initialSortColumn="name"
            title="People"
        >
            <Table.Grid>
                <Table.Header />
                <Table.Body />
            </Table.Grid>
        </Table>,
    );
}

const mockRoutes: Route[] = [ROUTES.SETTINGS_SHARE_CODE, ROUTES.SETTINGS_PREFERENCES];

/** Renders rows whose affordance is a `Table.RowLink`, with or without a destination behind it. */
function renderTableWithRowLinks({shouldProvideRoute, shouldDisableRows}: {shouldProvideRoute: boolean; shouldDisableRows: boolean}) {
    const renderLinkItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
        <Table.Row
            interactive
            rowIndex={index}
            accessibilityLabel={item.name}
            disabled={shouldDisableRows}
            route={shouldProvideRoute ? mockRoutes.at(index) : undefined}
        >
            <View role={CONST.ROLE.CELL}>
                <Table.RowLink
                    accessibilityLabel={item.name}
                    sentryLabel="test"
                >
                    <Text>{item.name}</Text>
                </Table.RowLink>
            </View>
        </Table.Row>
    );

    return render(
        <Table<TestItem, TestColumnKey>
            data={mockData}
            columns={mockColumns}
            renderItem={renderLinkItem}
            keyExtractor={(item) => item.keyForList}
            title="People"
        >
            <Table.Grid>
                <Table.Header />
                <Table.Body />
            </Table.Grid>
        </Table>,
    );
}

/** Renders rows that each carry a footer, optionally alongside errors so a row renders two extra rows. */
function renderTableWithFooters({shouldAddErrors}: {shouldAddErrors: boolean}) {
    const data = mockData.map((item) => (shouldAddErrors ? {...item, errors: {failure: 'Something went wrong'}} : item));

    const renderFooterItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
        <Table.Row
            interactive
            rowIndex={index}
            accessibilityLabel={item.name}
        >
            <View role={CONST.ROLE.CELL}>
                <Text>{item.name}</Text>
            </View>
        </Table.Row>
    );

    return render(
        <Table<TestItem, TestColumnKey>
            data={data}
            columns={mockColumns}
            renderItem={renderFooterItem}
            renderRowFooter={(item) => <Text>{`Footer for ${item.name}`}</Text>}
            keyExtractor={(item) => item.keyForList}
            title="People"
        >
            <Table.Grid>
                <Table.Header />
                <Table.Body />
            </Table.Grid>
        </Table>,
    );
}

function renderTableWithErrors() {
    const dataWithErrors = mockData.map((item) => ({...item, errors: {failure: 'Something went wrong'}}));

    const renderErrorItem = ({item, index}: ListRenderItemInfo<TestItem>) => (
        <Table.Row
            interactive
            rowIndex={index}
            accessibilityLabel={item.name}
        >
            <View role={CONST.ROLE.CELL}>
                <Text>{item.name}</Text>
            </View>
        </Table.Row>
    );

    return render(
        <Table<TestItem, TestColumnKey>
            data={dataWithErrors}
            columns={mockColumns}
            renderItem={renderErrorItem}
            keyExtractor={(item) => item.keyForList}
            title="People"
        >
            <Table.Grid>
                <Table.Header />
                <Table.Body />
            </Table.Grid>
        </Table>,
    );
}

describe('Table accessibility semantics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockResponsiveLayout.mockReturnValue(WIDE_SCREEN);
    });

    describe('row index contract', () => {
        it('numbers the header row 1 and the data rows from 2, matching aria-rowcount', () => {
            renderTable({data: mockData, shouldWrapInGrid: true, selectionEnabled: false});

            expect(propsByRole(CONST.ROLE.TABLE).at(0)?.['aria-rowcount']).toBe(mockData.length + 1);
            expect(propsByRole(CONST.ROLE.ROW).map((row) => row['aria-rowindex'])).toEqual([1, 2, 3]);
        });

        it('reports no rows when the table is empty rather than counting a header that is not rendered', () => {
            renderTable({data: [], shouldWrapInGrid: true, selectionEnabled: false});

            expect(propsByRole(CONST.ROLE.TABLE).at(0)?.['aria-rowcount']).toBe(0);
        });
    });

    describe('column headers', () => {
        it('exposes one columnheader per data column, excluding the decorative caret column', () => {
            renderTable({data: mockData, shouldWrapInGrid: true, selectionEnabled: false});

            expect(propsByRole(CONST.ROLE.COLUMNHEADER)).toHaveLength(1);
        });

        it('leaves aria-sort off every header while nothing is sorted', () => {
            renderTable({data: mockData, shouldWrapInGrid: true, selectionEnabled: false});

            expect(propsWhere((props) => props['aria-sort'] !== undefined)).toHaveLength(0);
        });

        it('puts aria-sort on the sorted header alone', () => {
            renderSortedTable();

            expect(propsWhere((props) => props['aria-sort'] !== undefined).map((props) => props['aria-sort'])).toEqual(['ascending']);
        });
    });

    describe('rows', () => {
        it('does not name the row inside a table', () => {
            renderTable({data: mockData, shouldWrapInGrid: true, selectionEnabled: false});

            expect(screen.queryByLabelText('Apple')).not.toBeOnTheScreen();
            expect(propsByRole(CONST.ROLE.ROW).at(1)?.['aria-label']).toBeUndefined();
        });

        it('names the row when it is a button outside a table', () => {
            renderTable({data: mockData, shouldWrapInGrid: false, selectionEnabled: false});

            expect(screen.getByLabelText('Apple')).toBeOnTheScreen();
            expect(propsByRole(CONST.ROLE.ROW)).toHaveLength(0);
        });

        it('adds no spanning cell for rows whose errors are empty or cleared to null', () => {
            renderTable({data: mockData, shouldWrapInGrid: true, selectionEnabled: false});

            expect(propsByRole(CONST.ROLE.CELL)).toHaveLength(mockData.length);
        });

        it('renders a row error as its own spanning row, numbered in sequence', () => {
            renderTableWithErrors();

            const rows = propsByRole(CONST.ROLE.ROW);
            const spanningCells = propsWhere((props) => props['aria-colspan'] !== undefined);

            expect(rows.map((row) => row['aria-rowindex'])).toEqual([1, 2, 3, 4, 5]);
            expect(propsByRole(CONST.ROLE.TABLE).at(0)?.['aria-rowcount']).toBe(5);
            expect(spanningCells).toHaveLength(mockData.length);
            expect(propsByProp('aria-hidden')).toHaveLength(0);
        });

        it('announces a row affordance as a button until the row is given a destination', () => {
            renderTableWithRowLinks({shouldProvideRoute: false, shouldDisableRows: false});

            expect(propsByRole(CONST.ROLE.LINK)).toHaveLength(0);
            expect(propsByRole(CONST.ROLE.BUTTON)).toHaveLength(mockData.length);
            expect(propsWhere((props) => props.href !== undefined)).toHaveLength(0);
        });

        it('announces a row affordance as a link, backed by a real href, once the row has a destination', () => {
            renderTableWithRowLinks({shouldProvideRoute: true, shouldDisableRows: false});

            const links = propsByRole(CONST.ROLE.LINK);

            expect(links).toHaveLength(mockData.length);
            expect(links.map((link) => link.href)).toEqual(mockRoutes.map((mockRoute) => `${window.location.origin}/${mockRoute}`));
        });

        it('withholds the href from a disabled row, which would otherwise navigate for real', () => {
            renderTableWithRowLinks({shouldProvideRoute: true, shouldDisableRows: true});

            expect(propsWhere((props) => props.href !== undefined)).toHaveLength(0);
            expect(propsByRole(CONST.ROLE.LINK)).toHaveLength(0);
        });

        it('keeps a row footer inside a table, as its own row counted by the index contract', () => {
            renderTableWithFooters({shouldAddErrors: false});

            const rows = propsByRole(CONST.ROLE.ROW);
            const spanningCells = propsWhere((props) => props['aria-colspan'] !== undefined);

            expect(screen.getByText('Footer for Apple')).toBeOnTheScreen();
            expect(rows.map((row) => row['aria-rowindex'])).toEqual([1, 2, 3, 4, 5]);
            expect(propsByRole(CONST.ROLE.TABLE).at(0)?.['aria-rowcount']).toBe(5);
            expect(spanningCells).toHaveLength(mockData.length);
        });

        it('numbers a footer row and an error row separately when one row renders both', () => {
            renderTableWithFooters({shouldAddErrors: true});

            expect(propsByRole(CONST.ROLE.ROW).map((row) => row['aria-rowindex'])).toEqual([1, 2, 3, 4, 5, 6, 7]);
            expect(propsByRole(CONST.ROLE.TABLE).at(0)?.['aria-rowcount']).toBe(7);
        });

        it('leaves cells unexposed in a narrow layout, where there is no table or row to hold them', () => {
            mockResponsiveLayout.mockReturnValue(NARROW_SCREEN);
            renderTableWithDerivedCells();

            expect(propsByRole(CONST.ROLE.CELL)).toHaveLength(0);
            expect(propsByRole(CONST.ROLE.ROW)).toHaveLength(0);
            expect(propsByRole(CONST.ROLE.TABLE)).toHaveLength(0);
        });

        it('exposes those same cells once the layout is wide enough to be a table', () => {
            renderTableWithDerivedCells();

            expect(propsByRole(CONST.ROLE.CELL)).toHaveLength(mockData.length);
        });

        it('names each selection checkbox after the row it selects', () => {
            renderTable({data: mockData, shouldWrapInGrid: true, selectionEnabled: true});

            expect(screen.getByLabelText('common.select Apple')).toBeOnTheScreen();
            expect(screen.getByLabelText('common.select Banana')).toBeOnTheScreen();
        });
    });
});
