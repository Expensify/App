import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {CompareItemsCallback, TableColumn} from '@components/Table';
import WorkspaceCompanyCardsTable from '@components/Tables/WorkspaceCompanyCardsTable';
import type {WorkspaceCompanyCardTableItemData} from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableRow';

import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import type {PartialDeep} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupApp();

const POLICY_ID = 'policy123';
const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 11111111;
const FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;
const BANK_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE as CompanyCardFeedWithNumber;
const ACCOUNT_ID = 1;
const QBO_EXPORT_ACCOUNT_NVP = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT;
const ROOT_ERROR_KEY = 'rootError';
const START_DATE_ERROR_KEY = 'startDateError';

let capturedColumns: Array<TableColumn<string, WorkspaceCompanyCardTableItemData>> = [];
let capturedData: WorkspaceCompanyCardTableItemData[] = [];
let capturedCompareItems: CompareItemsCallback<WorkspaceCompanyCardTableItemData, string> | undefined;
let mockCardFeedErrors: Record<string, {shouldPromptBrokenConnection?: boolean}> = {};

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: () => ({cardFeedErrors: mockCardFeedErrors}),
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

    // Kept outside MockTable, which the React Compiler treats as a component: capturing render props into a module
    // variable is only for this test's assertions and would otherwise look like an impure component body.
    function captureTableProps(columns: MockTableProps['columns'], data: MockTableProps['data'], compareItems: MockTableProps['compareItems']) {
        capturedColumns = columns;
        capturedData = data;
        capturedCompareItems = compareItems;
    }

    function MockTable({children, columns, data, compareItems}: MockTableProps) {
        captureTableProps(columns, data, compareItems);
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

function buildAssignedCard(overrides?: PartialDeep<Card, {recurseIntoArrays: true}>): Card {
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
        mockCardFeedErrors = {};
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

describe('WorkspaceCompanyCardsTable row feedback', () => {
    beforeEach(async () => {
        mockCardFeedErrors = {};
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('combines root and transaction start date errors on the same row', async () => {
        // Given an assigned card whose unassignment and start-date updates both failed
        const card = buildAssignedCard({
            errors: {[ROOT_ERROR_KEY]: 'Unassignment failed'},
            errorFields: {scrapeMinDate: {[START_DATE_ERROR_KEY]: 'Start date update failed'}},
        });

        // When the company cards table builds its row data
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then both failures are forwarded together instead of competing for one slot
        expect(capturedData.at(0)?.errors).toEqual({[ROOT_ERROR_KEY]: 'Unassignment failed', [START_DATE_ERROR_KEY]: 'Start date update failed'});
    });

    it('forwards the transaction start date pending state to the row', async () => {
        // Given an assigned card with an offline transaction start date update
        const card = buildAssignedCard({pendingFields: {scrapeMinDate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}});

        // When the company cards table builds its row data
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then OfflineWithFeedback receives the field-level pending state
        expect(capturedData.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
    });

    it('prioritizes card deletion over a pending transaction start date update', async () => {
        // Given a card that is being unassigned while its transaction start date update is still pending
        const card = buildAssignedCard({
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingFields: {scrapeMinDate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });

        // When the company cards table builds its row data
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then the root deletion remains authoritative and the row is filtered from the online table
        expect(capturedData).toHaveLength(0);
    });

    it('shows a failed unassignment after its optimistic deletion is rolled back', async () => {
        // Given an unassignment failure while the transaction start date update is still pending
        const card = buildAssignedCard({
            pendingAction: null,
            pendingFields: {scrapeMinDate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            errors: {[ROOT_ERROR_KEY]: 'Unassignment failed'},
        });

        // When the company cards table builds its row data
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then the row returns with its RBR while retaining the field-level pending feedback
        expect(capturedData).toHaveLength(1);
        expect(capturedData.at(0)?.errors).toEqual({[ROOT_ERROR_KEY]: 'Unassignment failed'});
        expect(capturedData.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
    });

    it('keeps a failed transaction start date update visible while the feed-level connection error is displayed', async () => {
        // Given a broken feed and a card with both root and start-date errors
        mockCardFeedErrors = {[FEED_NAME]: {shouldPromptBrokenConnection: true}};
        const card = buildAssignedCard({
            errors: {[ROOT_ERROR_KEY]: 'Unassignment failed'},
            errorFields: {scrapeMinDate: {[START_DATE_ERROR_KEY]: 'Start date update failed'}},
        });

        // When the company cards table builds its row data
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then the feed-level prompt owns the root error while the independent field failure remains actionable on the row
        expect(capturedData.at(0)?.errors).toEqual({[START_DATE_ERROR_KEY]: 'Start date update failed'});
    });
});

describe('WorkspaceCompanyCardsTable Last updated column', () => {
    beforeEach(async () => {
        mockCardFeedErrors = {};
        await Onyx.clear();
        await waitForBatchedUpdates();

        // Pins "now" so the current year check is stable. The viewer has no timezone set, so the default Los Angeles one applies.
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        jest.setSystemTime(new Date('2026-07-20T19:00:00Z'));
    });

    afterEach(async () => {
        jest.useRealTimers();
        // The locale is global, so a Spanish run must not leak into later tests.
        await IntlStore.load(CONST.LOCALES.EN);
    });

    async function renderWithCard(card?: Card) {
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdatesWithAct();
        return capturedData.at(0);
    }

    function buildSortRow(keyForList: string, cardName: string, lastScrape?: string) {
        return createMock<WorkspaceCompanyCardTableItemData>({
            keyForList,
            cardName,
            isAssigned: true,
            isCardDeleted: false,
            assignedCard: buildAssignedCard({lastScrape}),
        });
    }

    it('adds a sortable Last updated column', async () => {
        // Given any company card feed
        // When the table renders
        await renderWithCard(buildAssignedCard());

        // Then the column uses the details page label and can be sorted
        const column = capturedColumns.find((tableColumn) => tableColumn.key === 'lastUpdated');
        expect(column?.label).toBe(TestHelper.translateLocal('workspace.moreFeatures.companyCards.lastUpdated'));
        expect(column?.sortable).toBe(true);
    });

    it('shows the sync day in the viewer timezone with the full timestamp in the tooltip', async () => {
        // Given a sync at 03:00 UTC on July 11, which is still July 10 in Los Angeles
        // When the table builds the row
        const row = await renderWithCard(buildAssignedCard({lastScrape: '2026-07-11 03:00:00'}));

        // Then the cell shows the local day like Spend, and the tooltip matches the details page value
        expect(row?.lastUpdatedText).toBe('Jul 10');
        expect(row?.lastUpdatedTooltip).toBe('2026-07-10 20:00:00');
    });

    it('adds the year for a sync in a past year', async () => {
        // Given a card that last synced the year before
        // When the table builds the row
        const row = await renderWithCard(buildAssignedCard({lastScrape: '2025-07-10 20:00:00'}));

        // Then the year is shown so the date is not read as this year
        expect(row?.lastUpdatedText).toBe('Jul 10, 2025');
    });

    it('shows Updating... while an update runs, without a tooltip', async () => {
        // Given a card whose "Update card" request is in flight
        // When the table builds the row
        const row = await renderWithCard(buildAssignedCard({lastScrape: '2026-07-11 03:00:00', isLoadingLastUpdated: true}));

        // Then the cell matches the details page, which also shows Updating...
        expect(row?.lastUpdatedText).toBe(TestHelper.translateLocal('workspace.moreFeatures.companyCards.updating'));
        expect(row?.lastUpdatedTooltip).toBeUndefined();
    });

    it('shows Never for an assigned card that never synced', async () => {
        // Given an assigned card without a lastScrape
        // When the table builds the row
        const row = await renderWithCard(buildAssignedCard());

        // Then the cell says Never, like the details page, and has no tooltip
        expect(row?.lastUpdatedText).toBe(TestHelper.translateLocal('workspace.moreFeatures.companyCards.neverUpdated'));
        expect(row?.lastUpdatedTooltip).toBeUndefined();
    });

    it('shows Never instead of crashing for a malformed lastScrape', async () => {
        // Given a card whose lastScrape cannot be parsed, which would make date-fns format throw
        // When the table builds the row
        const row = await renderWithCard(buildAssignedCard({lastScrape: 'not-a-date'}));

        // Then the table still renders and the card reads as never synced
        expect(screen.getByTestId('WorkspaceCompanyCardsTable')).toBeTruthy();
        expect(row?.lastUpdatedText).toBe(TestHelper.translateLocal('workspace.moreFeatures.companyCards.neverUpdated'));
    });

    it('leaves the cell empty for an unassigned card', async () => {
        // Given an unassigned card, which has no sync history
        // When the table builds the row
        const row = await renderWithCard(undefined);

        // Then there is no text and no tooltip
        expect(row?.isAssigned).toBe(false);
        expect(row?.lastUpdatedText).toBeUndefined();
        expect(row?.lastUpdatedTooltip).toBeUndefined();
    });

    it('orders the month and day by the app language', async () => {
        // Given the app language is Spanish
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES);
        await waitForBatchedUpdatesWithAct();

        // When the table builds the row for a card synced this year
        const row = await renderWithCard(buildAssignedCard({lastScrape: '2026-07-11 03:00:00'}));

        // Then the day comes first like Spend dates in Spanish, and the tooltip keeps the details page format
        expect(row?.lastUpdatedText).toBe('10 jul');
        expect(row?.lastUpdatedTooltip).toBe('2026-07-10 20:00:00');
    });

    it('sorts by sync time with never synced cards as the oldest', async () => {
        // Given the table compare function
        await renderWithCard(buildAssignedCard());
        expect(capturedCompareItems).toBeDefined();

        const older = buildSortRow('older', '2222', '2026-07-01 10:00:00');
        const newer = buildSortRow('newer', '1111', '2026-07-15 10:00:00');
        const never = buildSortRow('never', '3333');

        // When rows are compared by Last updated
        // Then ascending puts older syncs first, never synced ones before all of them, and descending flips both
        expect(capturedCompareItems?.(older, newer, {columnKey: 'lastUpdated', order: CONST.SEARCH.SORT_ORDER.ASC})).toBeLessThan(0);
        expect(capturedCompareItems?.(never, older, {columnKey: 'lastUpdated', order: CONST.SEARCH.SORT_ORDER.ASC})).toBeLessThan(0);
        expect(capturedCompareItems?.(older, newer, {columnKey: 'lastUpdated', order: CONST.SEARCH.SORT_ORDER.DESC})).toBeGreaterThan(0);
        expect(capturedCompareItems?.(never, older, {columnKey: 'lastUpdated', order: CONST.SEARCH.SORT_ORDER.DESC})).toBeGreaterThan(0);
    });

    it('falls back to the card name when two cards synced at the same time', async () => {
        // Given two cards with the same lastScrape
        await renderWithCard(buildAssignedCard());
        const first = buildSortRow('first', '1111', '2026-07-01 10:00:00');
        const second = buildSortRow('second', '2222', '2026-07-01 10:00:00');

        // When they are compared by Last updated
        const result = capturedCompareItems?.(first, second, {columnKey: 'lastUpdated', order: CONST.SEARCH.SORT_ORDER.ASC});

        // Then the card name decides, so the order stays stable
        expect(result).toBeLessThan(0);
    });
});
