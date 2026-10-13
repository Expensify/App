import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {MoneyRequestReportTransactionListController, TransactionListItemData} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import MoneyRequestReportTransactionList from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import MoneyRequestReportTransactionsNavigation from '@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type * as SearchContext from '@components/Search/SearchContext';
import type {SortOrder} from '@components/Search/types';

import * as ReportActions from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {StableReport} from '@src/selectors/Report';
import type {ReportActions as OnyxReportActions, Transaction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/** The slice of the transaction list's controller the tests below read. */
type CapturedController = Pick<MoneyRequestReportTransactionListController, 'tableColumnHeader' | 'transactionListItems'>;

// Drives the RHP-open check both the transaction list and the navigation component make through findFocusedRoute().
// Undefined reproduces the real module's behaviour while the navigation ref isn't ready, which is what the existing
// tests below run against.
const mockFocusedRoute: {value: {name: string; key: string} | undefined} = {value: undefined};

// Populated by the mocked unified list below with the controller the transaction list renders it with.
const mockUnifiedList: {controller: CapturedController | undefined} = {controller: undefined};

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual() returns the real module for partial mocking
    const actualNavigation = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- returning the real module plus a few overridden hooks is the standard Jest partial-mock pattern
    return {
        ...actualNavigation,
        useIsFocused: () => true,
        useFocusEffect: () => {},
        findFocusedRoute: () => mockFocusedRoute.value,
    };
});

// The unified list is a FlashList. The tests below only need the controller it is handed, which carries the rendered
// row order and the real column-header element.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportUnifiedList', () => ({
    __esModule: true,
    default: ({controller}: {controller: CapturedController}) => {
        mockUnifiedList.controller = controller;
        return null;
    },
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({
        shouldUseNarrowLayout: false,
        isSmallScreenWidth: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: true,
        isExtraLargeScreenWidth: true,
        onboardingIsMediumOrLargerScreenWidth: true,
    }),
}));

jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

// The transaction list only reads the selection slice of the search context, and the real provider needs a
// NavigationContainer, so the two selection hooks are stubbed instead of mounting the whole provider tree.
jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof SearchContext>('@components/Search/SearchContext'),
    useSearchSelectionContext: () => ({selectedTransactionIDs: []}),
    useSearchSelectionActions: () => ({setSelectedTransactions: () => {}, clearSelectedTransactions: () => {}}),
}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: jest.fn(), unmarkReportRHPWidth: jest.fn()}),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    __esModule: true,
    // The provider itself only seeds context the components under test read through the mocked hook below, so it is a
    // passthrough here. It still has to be a component: the transaction-list tests compose it as a provider.
    default: ({children}: {children: React.ReactNode}) => children,
    usePersonalDetails: () => ({}),
}));

// usePermissions reads its beta contexts from the module mocked above, which no longer exports them. The only beta the
// transaction table consults decides whether the vendor column is offered, and these tests assert row order rather
// than columns, so reporting every beta as off is enough.
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
}));

const mockIsOffline = {value: false};

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline.value}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: 'a@b.com', accountID: 1}),
}));

const IOU_REPORT_ID = 'iou1';
const FIRST_TRANSACTION_ID = 't1';
const SECOND_TRANSACTION_ID = 't2';

function buildIOUActions(): OnyxReportActions {
    const action = {
        ...createRandomReportAction(2),
        reportActionID: 'action2',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childReportID: 'thread2',
        originalMessage: {IOUTransactionID: SECOND_TRANSACTION_ID, IOUReportID: IOU_REPORT_ID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
    };
    return {action2: action};
}

function buildTransaction(transactionID: string, index: number): Transaction {
    return {...createRandomTransaction(index), transactionID, reportID: IOU_REPORT_ID};
}

describe('MoneyRequestReportTransactionsNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline.value = false;
        await Onyx.clear();
        // The report's own actions are deliberately absent: this is the cache-cleared shape, where the
        // seeded sibling IDs are known but the IOU actions that resolve them have not been fetched yet.
        await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, [FIRST_TRANSACTION_ID, SECOND_TRANSACTION_ID]);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${FIRST_TRANSACTION_ID}`, buildTransaction(FIRST_TRANSACTION_ID, 0));
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${SECOND_TRANSACTION_ID}`, buildTransaction(SECOND_TRANSACTION_ID, 1));
        await waitForBatchedUpdates();
    });

    it('does not mint a thread or navigate when next is pressed before the report actions load', async () => {
        const createThreadSpy = jest.spyOn(ReportActions, 'createTransactionThreadReport');
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        // Both arrows render with the generic button role; the second one is next.
        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        expect(buttons).toHaveLength(2);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(createThreadSpy).not.toHaveBeenCalled();
        });
        expect(setParamsSpy).not.toHaveBeenCalled();
    });

    it('fetches the sibling parent report instead of dropping the press, then replays it when the action lands', async () => {
        const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);

        // The press is staged rather than dropped: the sibling's parent report is fetched.
        await waitFor(() => {
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: IOU_REPORT_ID}));
        });
        expect(setParamsSpy).not.toHaveBeenCalled();
    });

    it('abandons a staged press when the user has navigated elsewhere', async () => {
        jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
        const createThreadSpy = jest.spyOn(ReportActions, 'createTransactionThreadReport');
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});
        const getActiveRouteSpy = jest.spyOn(Navigation, 'getActiveRoute');
        getActiveRouteSpy.mockReturnValue(ROUTES.REPORT_WITH_ID.getRoute('origin'));

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);
        await waitForBatchedUpdates();

        // The user moved on before the fetch settled, so the staged press must not navigate.
        getActiveRouteSpy.mockReturnValue(ROUTES.REPORT_WITH_ID.getRoute('elsewhere'));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`, buildIOUActions());
        await waitForBatchedUpdates();

        expect(setParamsSpy).not.toHaveBeenCalled();
        expect(createThreadSpy).not.toHaveBeenCalled();
    });

    it('resolves the sibling offline rather than leaving the arrow dead', async () => {
        mockIsOffline.value = true;
        const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);

        // Offline there is nothing to fetch, so the press must fall through instead of being staged. Without a
        // cached IOU action there is no thread to resolve either, so the sibling's own report is the target: a
        // thread minted from a missing parent action could not be built at all.
        await waitFor(() => {
            expect(setParamsSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: IOU_REPORT_ID, anchorTransactionID: SECOND_TRANSACTION_ID}));
        });
        expect(openReportSpy).not.toHaveBeenCalled();
    });
});

const EXPENSE_REPORT_ID = 'expense1';
const POLICY_ID = 'policy1';

function buildExpenseReportTransaction(transactionID: string, created: string, category: string, index: number): Transaction {
    return {...createRandomTransaction(index), transactionID, reportID: EXPENSE_REPORT_ID, created, category, currency: 'USD', amount: -1000};
}

function buildTransactionListElement(transactions: Transaction[], reportID: string) {
    const report = {
        reportID,
        policyID: POLICY_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        currency: 'USD',
        ownerAccountID: 1,
    } as StableReport;

    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MoneyRequestReportTransactionList
                report={report}
                transactions={transactions}
                newTransactions={[]}
                reportActions={[]}
                hasComments={false}
                visibleReportActions={[]}
                renderReportAction={() => <View />}
                reportActionsExtraData={undefined}
                linkedReportActionID={undefined}
                listRef={null}
                accessibilityLabel="transactions"
                onListLayout={jest.fn()}
                onScroll={jest.fn()}
                onScrollBeginDrag={jest.fn()}
                onContentSizeChange={jest.fn()}
                onViewableItemsChanged={jest.fn()}
                onEndReached={jest.fn()}
                onStartReached={jest.fn()}
                contentContainerStyle={undefined}
                isLoadingInitialActions={false}
            />
        </ComposeProviders>
    );
}

function pressDateHeader(sortOrder: SortOrder) {
    // The controller types the header as a plain ReactElement, so the one prop these tests drive is narrowed here
    // rather than by duplicating the controller's own type.
    const columnHeader = mockUnifiedList.controller?.tableColumnHeader;
    if (!React.isValidElement<{onSortPress?: (sortBy: string, sortOrder: SortOrder) => void}>(columnHeader)) {
        throw new Error('the sortable column header did not render');
    }
    const onSortPress = columnHeader.props.onSortPress;
    if (!onSortPress) {
        throw new Error('the sortable column header rendered without onSortPress');
    }
    act(() => {
        onSortPress(CONST.SEARCH.TABLE_COLUMNS.DATE, sortOrder);
    });
}

function getRenderedTransactionIDs(): string[] {
    const listItems = mockUnifiedList.controller?.transactionListItems ?? [];
    return listItems.filter((item): item is Extract<TransactionListItemData, {type: 'transaction'}> => item.type === 'transaction').map((item) => item.transaction.transactionID);
}

async function getCarouselTransactionIDs(): Promise<string[] | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS,
            callback: (ids) => {
                Onyx.disconnect(connection);
                resolve(ids);
            },
        });
    });
}

// The RHP prev/next arrows walk the transaction IDs this list seeds, so the seed has to stay equal to the rows the
// user is actually looking at. Sorting is the case that breaks it: the rows move within their groups, and if the seed
// is built from anything other than the rendered groups (a flat date sort, say) "next" jumps to a row that isn't
// below the current one on screen.
describe('MoneyRequestReportTransactionList - RHP arrow order', () => {
    // The newest expense is in the alphabetically-last category, so a flat date sort and the rendered order disagree:
    // under Date DESC the newest expense (4, Travel) is not the first row, because the alphabetical Meals group still
    // renders first.
    const transactions = [
        buildExpenseReportTransaction('1', '2026-09-15', 'Meals', 0),
        buildExpenseReportTransaction('2', '2026-09-16', 'Travel', 1),
        buildExpenseReportTransaction('3', '2026-09-17', 'Meals', 2),
        buildExpenseReportTransaction('4', '2026-09-18', 'Travel', 3),
    ];

    // Expense 3 is the one carrying an RBR, and it has to be an expense that is not already first: it is the second row
    // of the alphabetically-first group, so an RBR-first ordering would visibly pull it to the top. Without a
    // violation anywhere in the report the order assertions below hold whether or not the table hoists RBR rows, so
    // they would guard nothing against the hoist being reintroduced.
    const RBR_TRANSACTION_ID = '3';

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline.value = false;
        mockUnifiedList.controller = undefined;
        // The list only seeds the carousel while a transaction thread is open in the RHP.
        mockFocusedRoute.value = {name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'rhp'};
        await Onyx.clear();
        await clearActiveTransactionIDs();
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${RBR_TRANSACTION_ID}`, [
            {name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
        ]);
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        mockFocusedRoute.value = undefined;
    });

    it('seeds the arrows with the rendered row order, and re-seeds it when a column is sorted', async () => {
        // Given a grouped report where one expense that is not the oldest carries a violation, so an RBR-first
        // ordering and the plain date ordering put different rows in the first position
        render(buildTransactionListElement(transactions, EXPENSE_REPORT_ID));
        await waitForBatchedUpdates();

        // Then the rows must read as Date ascending bucketed into alphabetical groups — Meals (1, 3) then Travel
        // (2, 4) — because the table obeys the selected column and never pulls the RBR expense (3) out of its date
        // position, and the arrows must follow that rendered order rather than the flat date order the rows were
        // sorted into
        const initialRenderedOrder = getRenderedTransactionIDs();
        expect(initialRenderedOrder).toEqual(['1', '3', '2', '4']);
        expect(await getCarouselTransactionIDs()).toEqual(initialRenderedOrder);

        // When the user presses the Date header to switch to descending
        pressDateHeader(CONST.SEARCH.SORT_ORDER.DESC);
        await waitForBatchedUpdates();

        const sortedRenderedOrder = getRenderedTransactionIDs();
        // Then the rows reverse inside each group while the group headers stay alphabetical, so Meals (3, 1) still
        // renders before Travel (4, 2), because group order is a separate axis from the column sort and is
        // deliberately unaffected by it
        expect(sortedRenderedOrder).toEqual(['3', '1', '4', '2']);
        expect(await getCarouselTransactionIDs()).toEqual(sortedRenderedOrder);
    });
});
