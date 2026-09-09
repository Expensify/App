import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {CompareItemsCallback, TableColumn} from '@components/Table';
import type {WorkspaceExpensifyCardTableRowData} from '@components/Tables/WorkspaceExpensifyCardsTable';
import WorkspaceExpensifyCardsTable from '@components/Tables/WorkspaceExpensifyCardsTable';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupApp();

let capturedColumns: Array<TableColumn<string, WorkspaceExpensifyCardTableRowData>> = [];
let capturedCompareItems: CompareItemsCallback<WorkspaceExpensifyCardTableRowData, string> | undefined;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false}),
}));

type MockTableProps = {
    children?: React.ReactNode;
    columns: Array<TableColumn<string, WorkspaceExpensifyCardTableRowData>>;
    compareItems: CompareItemsCallback<WorkspaceExpensifyCardTableRowData, string>;
};

// The real Table drives a FlashList and its own text measurement, neither of which this test needs: it only checks
// the columns and comparator WorkspaceExpensifyCardsTable computes, so the mock captures those props instead of
// rendering the grid.
jest.mock('@components/Table', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');

    function MockTable({children, columns, compareItems}: MockTableProps) {
        capturedColumns = columns;
        capturedCompareItems = compareItems;
        return <View testID="WorkspaceExpensifyCardsTable">{children}</View>;
    }

    MockTable.FilterBar = () => <View testID="WorkspaceExpensifyCardsTableFilterBar" />;
    MockTable.Header = () => <View testID="WorkspaceExpensifyCardsTableHeader" />;
    MockTable.ListHeader = ({children}: {children?: React.ReactNode}) => children ?? null;
    MockTable.Body = () => <View testID="WorkspaceExpensifyCardsTableBody" />;
    MockTable.NoResultsState = () => <View testID="WorkspaceExpensifyCardsTableNoResultsState" />;
    return {
        __esModule: true,
        default: MockTable,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        composeTableListHeader: jest.requireActual('@components/Table/composeTableListHeader').default,
    };
});

jest.mock('@pages/workspace/expensifyCard/WorkspaceCardListLabels', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCardListLabels" />;
});

function buildCard(overrides?: Partial<Card>): Card {
    return createMock<Card>({
        cardID: 999,
        accountID: 1,
        bank: CONST.EXPENSIFY_CARD.BANK,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        domainName: 'test.exfy',
        fraud: 'none',
        lastUpdated: '',
        availableSpend: 10000,
        nameValuePairs: {cardTitle: 'Ops card', unapprovedExpenseLimit: 100000, limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY},
        ...overrides,
    });
}

function buildRow(overrides?: Partial<WorkspaceExpensifyCardTableRowData>): WorkspaceExpensifyCardTableRowData {
    const card = overrides?.card ?? buildCard();

    return createMock<WorkspaceExpensifyCardTableRowData>({
        keyForList: String(card.cardID),
        cardID: card.cardID,
        card,
        lastFourPAN: '1234',
        name: card.nameValuePairs?.cardTitle ?? '',
        cardholder: {accountID: 1, displayName: 'Alice Smith', login: 'alice@example.com'},
        limit: card.nameValuePairs?.unapprovedExpenseLimit ?? 0,
        remainingLimit: card.availableSpend ?? 0,
        currency: 'USD',
        isVirtual: false,
        limitType: card.nameValuePairs?.limitType,
        action: jest.fn(),
        onClose: jest.fn(),
        ...overrides,
    });
}

function renderTable(cards: WorkspaceExpensifyCardTableRowData[], shouldShowExportAccountColumn: boolean) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceExpensifyCardsTable
                policyID="policy123"
                cards={cards}
                selectionEnabled={false}
                selectedKeys={[]}
                onRowSelectionChange={jest.fn()}
                shouldShowExportAccountColumn={shouldShowExportAccountColumn}
            />
        </ComposeProviders>,
    );
}

describe('WorkspaceExpensifyCardsTable Export account column', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows the column when the caller says the connection is eligible', async () => {
        renderTable([buildRow({exportAccountTitle: 'Amex Corporate'})], true);
        await waitForBatchedUpdates();

        expect(screen.getByTestId('WorkspaceExpensifyCardsTable')).toBeTruthy();
        expect(capturedColumns.map((column) => column.key)).toContain('exportAccount');
    });

    it('hides the column when the caller says the connection is not eligible', async () => {
        renderTable([buildRow()], false);
        await waitForBatchedUpdates();

        expect(capturedColumns.map((column) => column.key)).not.toContain('exportAccount');
    });

    it('sorts by export account title, falling back to the cardholder name on ties', async () => {
        renderTable([buildRow()], true);
        await waitForBatchedUpdates();

        expect(capturedCompareItems).toBeDefined();

        const rowA = buildRow({cardID: 1, cardholder: {accountID: 1, displayName: 'Zed', login: 'zed@example.com'}, exportAccountTitle: 'Amex Corporate'});
        const rowB = buildRow({cardID: 2, cardholder: {accountID: 2, displayName: 'Ann', login: 'ann@example.com'}, exportAccountTitle: 'Default card'});

        const ascending = capturedCompareItems?.(rowA, rowB, {columnKey: 'exportAccount', order: CONST.SEARCH.SORT_ORDER.ASC});
        expect(ascending).toBeLessThan(0);

        // Ties on export account title fall through to the cardholder name comparison.
        const rowC = buildRow({cardID: 3, cardholder: {accountID: 3, displayName: 'Ann', login: 'ann2@example.com'}, exportAccountTitle: 'Amex Corporate'});
        const tieBreak = capturedCompareItems?.(rowA, rowC, {columnKey: 'exportAccount', order: CONST.SEARCH.SORT_ORDER.ASC});
        expect(tieBreak).toBeGreaterThan(0);
    });
});
