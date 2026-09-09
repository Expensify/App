import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {CompareItemsCallback, TableColumn} from '@components/Table';
import WorkspaceCompanyCardsTable from '@components/Tables/WorkspaceCompanyCardsTable';
import type {WorkspaceCompanyCardTableItemData} from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableRow';

import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupApp();

const POLICY_ID = 'policy123';
const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 11111111;
const FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;
const BANK_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE as CompanyCardFeedWithNumber;
const ACCOUNT_ID = 1;
const QBO_EXPORT_ACCOUNT_NVP = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT;

let capturedColumns: Array<TableColumn<string, WorkspaceCompanyCardTableItemData>> = [];
let capturedData: WorkspaceCompanyCardTableItemData[] = [];
let capturedCompareItems: CompareItemsCallback<WorkspaceCompanyCardTableItemData, string> | undefined;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: () => ({cardFeedErrors: {}}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false}),
}));

jest.mock('@components/ActivityIndicator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCompanyCardsTableLoadingIndicator" />;
});

jest.mock('@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCompanyCardPageEmptyState" />;
});

type MockTableProps = {
    children?: React.ReactNode;
    columns: Array<TableColumn<string, WorkspaceCompanyCardTableItemData>>;
    data: WorkspaceCompanyCardTableItemData[];
    compareItems: CompareItemsCallback<WorkspaceCompanyCardTableItemData, string>;
};

// The real Table drives a FlashList and its own text measurement, neither of which this test needs: it only checks
// what WorkspaceCompanyCardsTable computes and hands to Table, so the mock captures those props instead of rendering
// the grid.
jest.mock('@components/Table', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');

    function MockTable({children, columns, data, compareItems}: MockTableProps) {
        capturedColumns = columns;
        capturedData = data;
        capturedCompareItems = compareItems;
        return <View testID="WorkspaceCompanyCardsTable">{children}</View>;
    }

    MockTable.FilterBar = () => <View testID="WorkspaceCompanyCardsTableFilterBar" />;
    MockTable.Header = () => <View testID="WorkspaceCompanyCardsTableHeader" />;
    MockTable.ListHeader = ({children}: {children?: React.ReactNode}) => children ?? null;
    MockTable.Body = () => <View testID="WorkspaceCompanyCardsTableBody" />;
    MockTable.EmptyState = () => <View testID="WorkspaceCompanyCardsTableEmptyState" />;
    MockTable.NoResultsState = () => <View testID="WorkspaceCompanyCardsTableNoResultsState" />;
    MockTable.LoadingState = () => <View testID="WorkspaceCompanyCardsTableLoadingIndicator" />;
    return {
        __esModule: true,
        default: MockTable,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        composeTableListHeader: jest.requireActual('@components/Table/composeTableListHeader').default,
    };
});

jest.mock('@components/CardFeedIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="CardFeedIcon" />;
});

jest.mock('@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableHeaderButtons', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCompanyCardsTableHeaderButtons" />;
});

function buildAssignedCard(overrides?: Partial<Card>): Card {
    return createMock<Card>({
        cardID: 555,
        accountID: ACCOUNT_ID,
        bank: BANK_NAME,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        domainName: 'test.exfy',
        fraud: 'none',
        lastUpdated: '',
        nameValuePairs: {},
        ...overrides,
    });
}

function buildCompanyCards(assignedCard?: Card): UseCompanyCardsResult {
    return createMock<UseCompanyCardsResult>({
        feedName: FEED_NAME,
        bankName: BANK_NAME,
        assignedCards: assignedCard ? {[assignedCard.cardID]: assignedCard} : {},
        companyCardEntries: [
            {
                cardName: '4321',
                encryptedCardNumber: 'enc-4321',
                isAssigned: !!assignedCard,
                assignedCard,
            },
        ],
        workspaceCardFeedsStatus: {[DOMAIN_OR_WORKSPACE_ACCOUNT_ID]: {isLoading: false}},
        selectedFeed: {feed: BANK_NAME, status: {}},
        isInitiallyLoadingFeeds: false,
        isNoFeed: false,
        isFeedPending: false,
        isFeedAdded: true,
        onyxMetadata: {
            cardListMetadata: {status: 'loaded'},
            allCardFeedsMetadata: {status: 'loaded'},
            lastSelectedFeedMetadata: {status: 'loaded'},
        },
    });
}

function renderTable(companyCards: UseCompanyCardsResult) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceCompanyCardsTable
                policyID={POLICY_ID}
                isPolicyLoaded
                isPageFetchPending={false}
                domainOrWorkspaceAccountID={DOMAIN_OR_WORKSPACE_ACCOUNT_ID}
                companyCards={companyCards}
                onAssignCard={jest.fn()}
                isAssigningCardDisabled={false}
                canWriteCompanyCards
                isSelectionModeEnabled={false}
                onReloadPage={jest.fn()}
                onReloadFeed={jest.fn()}
            />
        </ComposeProviders>,
    );
}

async function setQBOPolicy(nvpExportAccount?: string) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
        id: POLICY_ID,
        connections: {
            quickbooksOnline: {
                config: {
                    nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                },
                data: {
                    creditCards: [{id: 'qbo-cc-1', name: 'Amex Corporate', currency: 'USD'}],
                },
            },
        },
    });
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'Alice Smith', login: 'alice@example.com'},
    });

    return buildAssignedCard({nameValuePairs: nvpExportAccount === undefined ? {} : {[QBO_EXPORT_ACCOUNT_NVP]: nvpExportAccount}});
}

describe('WorkspaceCompanyCardsTable Export account column', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows the column and the resolved title when the connection is eligible', async () => {
        const card = await setQBOPolicy('qbo-cc-1');
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        expect(screen.getByTestId('WorkspaceCompanyCardsTable')).toBeTruthy();
        expect(capturedColumns.map((column) => column.key)).toContain('exportAccount');
        expect(capturedData.at(0)?.exportAccountTitle).toBe('Amex Corporate');
    });

    it('hides the column when the details page would hide the Accounting section too', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            connections: {
                quickbooksOnline: {
                    config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL},
                    data: {creditCards: []},
                },
            },
        });
        renderTable(buildCompanyCards(buildAssignedCard()));
        await waitForBatchedUpdates();

        expect(capturedColumns.map((column) => column.key)).not.toContain('exportAccount');
    });

    it('hides the column when no accounting connection exists', async () => {
        renderTable(buildCompanyCards(buildAssignedCard()));
        await waitForBatchedUpdates();

        expect(capturedColumns.map((column) => column.key)).not.toContain('exportAccount');
    });

    it('shows the default label when the card has no export NVP', async () => {
        const card = await setQBOPolicy(undefined);
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        expect(capturedData.at(0)?.exportAccountTitle).toBe(TestHelper.translateLocal('workspace.moreFeatures.companyCards.defaultCard'));
    });

    it('renders an empty export cell for an unassigned card without crashing', async () => {
        await setQBOPolicy('qbo-cc-1');
        renderTable(buildCompanyCards(undefined));
        await waitForBatchedUpdates();

        expect(capturedData.at(0)?.isAssigned).toBe(false);
        expect(capturedData.at(0)?.exportAccountTitle).toBeUndefined();
    });

    it('sorts by export account title, falling back to the card name on ties', async () => {
        await setQBOPolicy('qbo-cc-1');
        const cardA = buildAssignedCard({cardID: 1, nameValuePairs: {[QBO_EXPORT_ACCOUNT_NVP]: 'qbo-cc-1'}});
        const cardB = buildAssignedCard({cardID: 2, nameValuePairs: {[QBO_EXPORT_ACCOUNT_NVP]: CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE}});
        renderTable(buildCompanyCards(cardA));
        await waitForBatchedUpdates();

        expect(capturedCompareItems).toBeDefined();

        const rowA = createMock<WorkspaceCompanyCardTableItemData>({
            keyForList: 'a',
            cardName: '1111',
            isAssigned: true,
            isCardDeleted: false,
            assignedCard: cardA,
            exportAccountTitle: 'Amex Corporate',
        });
        const rowB = createMock<WorkspaceCompanyCardTableItemData>({
            keyForList: 'b',
            cardName: '2222',
            isAssigned: true,
            isCardDeleted: false,
            assignedCard: cardB,
            exportAccountTitle: TestHelper.translateLocal('workspace.moreFeatures.companyCards.defaultCard'),
        });

        const ascending = capturedCompareItems?.(rowA, rowB, {columnKey: 'exportAccount', order: CONST.SEARCH.SORT_ORDER.ASC});
        expect(ascending).toBeLessThan(0);

        const descending = capturedCompareItems?.(rowA, rowB, {columnKey: 'exportAccount', order: CONST.SEARCH.SORT_ORDER.DESC});
        expect(descending).toBeGreaterThan(0);

        // Two rows sharing the default export account fall back to the card name for a stable order.
        const rowC = createMock<WorkspaceCompanyCardTableItemData>({...rowB, keyForList: 'c', cardName: '0000'});
        const tieBreak = capturedCompareItems?.(rowB, rowC, {columnKey: 'exportAccount', order: CONST.SEARCH.SORT_ORDER.ASC});
        expect(tieBreak).toBeGreaterThan(0);
    });

    it('keeps rendering when the export column disappears mid-session', async () => {
        const card = await setQBOPolicy('qbo-cc-1');
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        expect(capturedColumns.map((column) => column.key)).toContain('exportAccount');

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            connections: {quickbooksOnline: {config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL}}},
        });
        await waitForBatchedUpdates();

        expect(capturedColumns.map((column) => column.key)).not.toContain('exportAccount');
        expect(screen.getByTestId('WorkspaceCompanyCardsTable')).toBeTruthy();
    });
});
