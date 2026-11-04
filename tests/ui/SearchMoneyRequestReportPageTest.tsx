import {render} from '@testing-library/react-native';

import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDismissOnMoneyRequestReportRemoval from '@hooks/useDismissOnMoneyRequestReportRemoval';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionThreadReportID from '@hooks/useTransactionThreadReportID';

import useClearReportActionDraftsOnReportChange from '@pages/inbox/report/useClearReportActionDraftsOnReportChange';
import SearchMoneyRequestReportPage from '@pages/Search/SearchMoneyRequestReportPage';

import {createTransactionThreadReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '9990001';
const OTHER_REPORT_ID = '9990002';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: jest.fn()}));
jest.mock('@hooks/useDismissOnMoneyRequestReportRemoval', () => jest.fn());
jest.mock('@hooks/useSubmitToDestinationVisible', () => jest.fn());
jest.mock('@hooks/useReportIsArchived', () => jest.fn());
jest.mock('@hooks/useIsReportReadyToDisplay', () => jest.fn());
jest.mock('@hooks/useParentReportAction', () => jest.fn());
jest.mock('@components/WideRHPContextProvider/useRHPWidth', () => jest.fn());
jest.mock('@hooks/useReportAttributes', () => ({useDerivedReportNameByReportID: jest.fn()}));
jest.mock('@hooks/useDocumentTitle', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
// useThemeStyles is consumed directly in the JSX (e.g. styles.mtAuto), so it needs to return
// an object that answers any style key rather than undefined.
jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});
jest.mock('@pages/inbox/report/useClearReportActionDraftsOnReportChange', () => jest.fn());
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => jest.fn());
jest.mock('@hooks/useTransactionThreadReportID', () => jest.fn());
jest.mock('@components/Search/SearchContext', () => ({useSearchResultsContext: jest.fn()}));
jest.mock('@userActions/Report', () => ({
    createTransactionThreadReport: jest.fn(),
    openReport: jest.fn(),
    updateLastVisitTime: jest.fn(),
    clearDeleteTransactionNavigateBackUrl: jest.fn(),
}));

// All child components are mocked to null: none of them need to actually render for these tests,
// which only assert on the self-heal effect's calls to createTransactionThreadReport.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportView', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(() => null));
jest.mock('@components/DragAndDrop/Provider', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(() => null));
jest.mock('@components/WideRHPOverlayWrapper', () => jest.fn(() => null));
jest.mock('@pages/inbox/ActionListContext', () => ({ActionListContextProvider: jest.fn(() => null)}));
jest.mock('@pages/inbox/ReactionListWrapper', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionEditMessageContext', () => ({ReportActionEditMessageContextProvider: jest.fn(() => null)}));
jest.mock('@gorhom/portal', () => ({PortalHost: jest.fn(() => null)}));

const mockUseNetwork = jest.mocked(useNetwork);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUsePersonalDetails = jest.mocked(usePersonalDetails);
const mockUseDismissOnMoneyRequestReportRemoval = jest.mocked(useDismissOnMoneyRequestReportRemoval);
const mockUseSubmitToDestinationVisible = jest.mocked(useSubmitToDestinationVisible);
const mockUseReportIsArchived = jest.mocked(useReportIsArchived);
const mockUseIsReportReadyToDisplay = jest.mocked(useIsReportReadyToDisplay);
const mockUseParentReportAction = jest.mocked(useParentReportAction);
const mockUseDerivedReportNameByReportID = jest.mocked(useDerivedReportNameByReportID);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseClearReportActionDraftsOnReportChange = jest.mocked(useClearReportActionDraftsOnReportChange);
const mockUseTransactionsAndViolationsForReport = jest.mocked(useTransactionsAndViolationsForReport);
const mockUseTransactionThreadReportID = jest.mocked(useTransactionThreadReportID);
const mockUseSearchResultsContext = jest.mocked(useSearchResultsContext);
const mockCreateTransactionThreadReport = jest.mocked(createTransactionThreadReport);

const mockReport: OnyxTypes.Report = {
    reportID: REPORT_ID,
    reportName: 'Test Expense Report',
    chatReportID: '111',
    ownerAccountID: 1,
    lastVisibleActionCreated: '2024-01-01',
    total: 0,
};

const mockReportLoadingState: OnyxTypes.ReportLoadingState = {
    isLoadingInitialReportActions: false,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    hasOnceLoadedReportActions: true,
};

/** Builds a minimal reportAction fixture. The self-heal effect only reads reportActionID/actionName/originalMessage. */
function buildReportAction(overrides: Partial<OnyxTypes.ReportAction> = {}): OnyxTypes.ReportAction {
    return createMock<OnyxTypes.ReportAction>({
        reportActionID: 'defaultActionID',
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        created: '2024-01-01 00:00:00',
        actorAccountID: 1,
        message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}],
        originalMessage: {},
        shouldShow: true,
        person: [{type: 'TEXT', style: 'strong', text: 'User'}],
        pendingAction: null,
        errors: {},
        ...overrides,
    });
}

function buildIOUAction(reportActionID: string, transactionID: string): OnyxTypes.ReportAction {
    return buildReportAction({
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {IOUTransactionID: transactionID, type: 'create', amount: 100, currency: 'USD'},
    });
}

/** Builds a minimal transaction fixture. createTransactionThreadReport is mocked, so only the fields the
 *  component's own logic reads (transactionID/reportID/pendingAction/linkedTrackedExpenseReportAction) matter. */
function buildTransaction(transactionID: string, reportID: string, overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return {
        transactionID,
        reportID,
        amount: 100,
        currency: 'USD',
        created: '2024-01-01',
        merchant: 'Test Merchant',
        ...overrides,
    } satisfies OnyxTypes.Transaction;
}

type RenderOptions = {
    allReportTransactions?: Record<string, OnyxTypes.Transaction>;
    reportActions?: OnyxTypes.ReportAction[];
    transactionThreadReportID?: string;
    snapshotData?: OnyxTypes.SearchResults['data'];
    allReportViolations?: ReturnType<typeof useTransactionsAndViolationsForReport>['violations'];
    report?: OnyxTypes.Report | undefined;
};

/** Seeds the real REPORT_ACTIONS collection so getReportAction()/getIOUActionForTransactionID() (both real,
 *  not mocked) see it through their module-level Onyx.connect. */
async function seedReportActions(reportID: string, actions: OnyxTypes.ReportAction[]) {
    const actionsByID = Object.fromEntries(actions.map((action) => [action.reportActionID, action]));
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, actionsByID);
    await waitForBatchedUpdatesWithAct();
}

// Only the fields the page reads from `route` (and no `navigation`, which it never touches) are relevant to these tests.
const pageProps = createMock<React.ComponentProps<typeof SearchMoneyRequestReportPage>>({
    route: {
        params: {reportID: REPORT_ID, backTo: undefined},
        name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
        key: 'route-key',
    },
});

function renderPage(options: RenderOptions) {
    const {allReportTransactions = {}, reportActions = [], transactionThreadReportID = undefined, snapshotData, allReportViolations = {}} = options;
    // `'report' in options` distinguishes "not passed" (default to mockReport) from an explicit
    // `{report: undefined}` (the report-not-loaded-yet case) — a destructuring default would swallow the latter.
    const report = 'report' in options ? options.report : mockReport;
    mockUseTransactionsAndViolationsForReport.mockReturnValue({transactions: allReportTransactions, violations: allReportViolations, isLoaded: true});
    mockUseTransactionThreadReportID.mockReturnValue({
        transactionThreadReportID,
        effectiveTransactionThreadReportID: transactionThreadReportID,
        reportActions,
    });
    mockUseSearchResultsContext.mockReturnValue(
        createMock<ReturnType<typeof useSearchResultsContext>>({
            currentSearchResults: snapshotData ? createMock<OnyxTypes.SearchResults>({data: snapshotData, search: {}}) : undefined,
        }),
    );
    mockUseOnyx.mockImplementation((key: string) => {
        if (key === `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`) {
            return [mockReportLoadingState, {status: 'loaded'}];
        }
        if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
            return [report, {status: 'loaded'}];
        }
        if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`) {
            return [true, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.IS_LOADING_APP) {
            return [false, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });

    return render(<SearchMoneyRequestReportPage {...pageProps} />);
}

describe('SearchMoneyRequestReportPage (legacy transaction self-heal)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1, login: 'test@example.com', email: 'test@example.com'});
        mockUsePersonalDetails.mockReturnValue({});
        mockUseDismissOnMoneyRequestReportRemoval.mockReturnValue(undefined);
        mockUseSubmitToDestinationVisible.mockReturnValue(jest.fn());
        mockUseReportIsArchived.mockReturnValue(false);
        mockUseIsReportReadyToDisplay.mockReturnValue({isEditingDisabled: false, isCurrentReportLoadedFromOnyx: true});
        mockUseParentReportAction.mockReturnValue(undefined);
        mockUseDerivedReportNameByReportID.mockReturnValue(undefined);
        mockUseResponsiveLayout.mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
        mockUseClearReportActionDraftsOnReportChange.mockReturnValue(undefined);
        // renderPage() sets the full useOnyx routing (including the report key, which some tests override).
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('self-heals when the report has a single non-IOU action (e.g. just CREATED)', async () => {
        // Given real report actions identify the current report's legacy transaction
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        await seedReportActions(REPORT_ID, [createdAction]);
        const transaction = buildTransaction('txn1', REPORT_ID);

        // When the real page effect evaluates the available report and transaction data
        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [createdAction]});
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'txn1'})}));
    });

    it('self-heals when the report has multiple non-IOU actions (CREATED + SUBMITTED), none of them IOU', async () => {
        // Given real report actions identify the current report's legacy transaction
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const submittedAction = buildReportAction({reportActionID: 'a2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        await seedReportActions(REPORT_ID, [createdAction, submittedAction]);
        const transaction = buildTransaction('txn2', REPORT_ID);

        // When the real page effect evaluates the available report and transaction data
        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [createdAction, submittedAction]});
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'txn2'})}));
    });

    it('does not self-heal when the reportActions are stale data from a different report', async () => {
        // Given these actions exist only in another report's Onyx bucket
        const staleAction1 = buildReportAction({reportActionID: 'stale1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const staleAction2 = buildReportAction({reportActionID: 'stale2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        // These reportActionIDs only exist under the OTHER report's Onyx bucket, not under REPORT_ID's.
        await seedReportActions(OTHER_REPORT_ID, [staleAction1, staleAction2]);
        const transaction = buildTransaction('txn3', REPORT_ID);

        // When the real page effect evaluates the available report and transaction data
        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [staleAction1, staleAction2]});
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('does not self-heal (and does not double-create) when a real IOU action for the transaction already exists', async () => {
        // Given real report actions identify the current report's legacy transaction
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const iouAction = buildIOUAction('iou1', 'txn4');
        await seedReportActions(REPORT_ID, [createdAction, iouAction]);
        const transaction = buildTransaction('txn4', REPORT_ID);

        // When the real page effect evaluates the available report and transaction data
        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [createdAction, iouAction]});
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('picks the transaction matching the current report from the search snapshot, even when it is not the first key', async () => {
        // Given real report actions identify the current report's legacy transaction
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        await seedReportActions(REPORT_ID, [createdAction]);

        const wrongReportTransaction = buildTransaction('wrongReportTxn', OTHER_REPORT_ID);
        const correctTransaction = buildTransaction('correctTxn', REPORT_ID);

        // Insertion order matters here: the wrong-report transaction key comes first in the snapshot blob,
        // so picking "the first transactions_ key" (the pre-fix behavior) would resolve to the wrong transaction.
        const snapshotData: OnyxTypes.SearchResults['data'] = {};
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${wrongReportTransaction.transactionID}`] = wrongReportTransaction;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${correctTransaction.transactionID}`] = correctTransaction;

        // No transactions in the main collection, forcing the component to fall back to the snapshot.
        // When the real page effect evaluates the available report and transaction data
        renderPage({allReportTransactions: {}, reportActions: [createdAction], snapshotData});
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'correctTxn'})}));
    });

    it('does not self-heal while the report has not loaded yet, and retries once it does (does not get stuck)', async () => {
        // Given real report actions identify the current report's legacy transaction
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const submittedAction = buildReportAction({reportActionID: 'a2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        await seedReportActions(REPORT_ID, [createdAction, submittedAction]);
        const transaction = buildTransaction('txn5', REPORT_ID);

        // When the page opens before its report has loaded
        const {rerender} = renderPage({
            allReportTransactions: {[transaction.transactionID]: transaction},
            reportActions: [createdAction, submittedAction],
            report: undefined,
        });
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();

        // The report finishes loading on a later render. If the effect had already marked itself as
        // "created" while report was still undefined, this retry would never happen.
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`) {
                return [mockReportLoadingState, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
                return [mockReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`) {
                return [true, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        rerender(<SearchMoneyRequestReportPage {...pageProps} />);
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'txn5'})}));
    });

    it('does not self-heal when the loaded report belongs to a different reportID than the route (stale report from a previous navigation)', async () => {
        // Given real report actions identify the current report's legacy transaction
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const submittedAction = buildReportAction({reportActionID: 'a2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        await seedReportActions(REPORT_ID, [createdAction, submittedAction]);
        const transaction = buildTransaction('txn6', REPORT_ID);
        // `report` still reflects the previously viewed report (OTHER_REPORT_ID), even though the route,
        // reportActions and transaction have already moved on to REPORT_ID.
        const staleReport: OnyxTypes.Report = {...mockReport, reportID: OTHER_REPORT_ID};

        // When the real page effect evaluates the available report and transaction data
        renderPage({
            allReportTransactions: {[transaction.transactionID]: transaction},
            reportActions: [createdAction, submittedAction],
            report: staleReport,
        });
        await waitForBatchedUpdatesWithAct();

        // Then thread creation respects the report and transaction identity guards
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('keeps the first matching snapshot object and selects only its own violations', async () => {
        // Given unrelated keys and a wrong-report transaction precede two matching transactions
        const createdAction = buildReportAction({reportActionID: 'ordered-created'});
        await seedReportActions(REPORT_ID, [createdAction]);
        const wrong = buildTransaction('wrong', OTHER_REPORT_ID);
        const first = buildTransaction('first', REPORT_ID);
        const second = buildTransaction('second', REPORT_ID);
        const firstViolations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}] satisfies OnyxTypes.TransactionViolations;
        const secondViolations = [{name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION}] satisfies OnyxTypes.TransactionViolations;
        const snapshotData: OnyxTypes.SearchResults['data'] = {};
        snapshotData[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`] = mockReport;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${wrong.transactionID}`] = wrong;
        snapshotData[`${ONYXKEYS.COLLECTION.POLICY}workspace`] = {
            id: 'workspace',
            name: 'Snapshot workspace',
            outputCurrency: CONST.CURRENCY.USD,
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.CORPORATE,
            owner: 'owner@example.com',
        };
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${second.transactionID}`] = secondViolations;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${first.transactionID}`] = first;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${second.transactionID}`] = second;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${first.transactionID}`] = firstViolations;

        // When the real page falls back to its typed snapshot
        renderPage({reportActions: [createdAction], snapshotData});
        await waitForBatchedUpdatesWithAct();

        // Then insertion order and the selected transactionID determine both exact argument identities
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
        const call = mockCreateTransactionThreadReport.mock.calls.at(0);
        expect(call).toBeDefined();
        expect(call?.[0].transaction).toBe(first);
        expect(call?.[0].transactionViolations).toBe(firstViolations);
    });

    it('leaves violations absent when only another snapshot transaction has them', async () => {
        // Given the selected transaction has no violation key of its own
        const createdAction = buildReportAction({reportActionID: 'missing-violations'});
        await seedReportActions(REPORT_ID, [createdAction]);
        const transaction = buildTransaction('withoutViolations', REPORT_ID);
        const snapshotData: OnyxTypes.SearchResults['data'] = {};
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}other`] = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}];

        // When the page selects that transaction
        renderPage({reportActions: [createdAction], snapshotData});
        await waitForBatchedUpdatesWithAct();

        // Then an unrelated array cannot substitute for absence
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
        const call = mockCreateTransactionThreadReport.mock.calls.at(0);
        expect(call).toBeDefined();
        expect(call?.[0].transaction).toBe(transaction);
        expect(call?.[0].transactionViolations).toBeUndefined();
    });

    const unrelatedSnapshotData: OnyxTypes.SearchResults['data'] = {};
    unrelatedSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}wrong`] = buildTransaction('wrong', OTHER_REPORT_ID);
    const snapshotScenarios: Array<{name: string; snapshotData: OnyxTypes.SearchResults['data'] | undefined}> = [
        {name: 'absent snapshot', snapshotData: undefined},
        {name: 'empty snapshot', snapshotData: {}},
        {name: 'no matching transaction', snapshotData: unrelatedSnapshotData},
    ];

    it.each(snapshotScenarios)('does not create a thread for $name', async ({snapshotData}) => {
        // Given report actions are available but no matching transaction can be selected
        const createdAction = buildReportAction({reportActionID: 'no-match'});
        await seedReportActions(REPORT_ID, [createdAction]);

        // When the production fallback inspects absent, empty, or unrelated data
        renderPage({reportActions: [createdAction], snapshotData});
        await waitForBatchedUpdatesWithAct();

        // Then no thread is created from missing or wrong-report input
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('prefers live transaction and violation identities over competing snapshot data', async () => {
        // Given live data and snapshot data disagree for the current report
        const createdAction = buildReportAction({reportActionID: 'live-created'});
        await seedReportActions(REPORT_ID, [createdAction]);
        const live = buildTransaction('live', REPORT_ID);
        const snapshot = buildTransaction('snapshot', REPORT_ID);
        const liveViolations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}] satisfies OnyxTypes.TransactionViolations;
        const snapshotViolations = [{name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION}] satisfies OnyxTypes.TransactionViolations;

        const snapshotData: OnyxTypes.SearchResults['data'] = {};
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${snapshot.transactionID}`] = snapshot;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${snapshot.transactionID}`] = snapshotViolations;

        // When the page sees a live collection member, with violations at its existing ID lookup
        renderPage({
            allReportTransactions: {[live.transactionID]: live},
            allReportViolations: {[live.transactionID]: liveViolations},
            reportActions: [createdAction],
            snapshotData,
        });
        await waitForBatchedUpdatesWithAct();

        // Then snapshot fallback cannot replace either live object
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
        const call = mockCreateTransactionThreadReport.mock.calls.at(0);
        expect(call).toBeDefined();
        expect(call?.[0].transaction).toBe(live);
        expect(call?.[0].transactionViolations).toBe(liveViolations);
    });

    it('prefers live violations for a transaction selected from the snapshot', async () => {
        // Given the current hook lookup supplies violations while the transaction exists only in the snapshot
        const createdAction = buildReportAction({reportActionID: 'live-violations'});
        await seedReportActions(REPORT_ID, [createdAction]);
        const transaction = buildTransaction('snapshotWithLiveViolations', REPORT_ID);
        const liveViolations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}] satisfies OnyxTypes.TransactionViolations;
        const snapshotViolations = [{name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION}] satisfies OnyxTypes.TransactionViolations;
        const snapshotData: OnyxTypes.SearchResults['data'] = {};
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
        snapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] = snapshotViolations;

        // When the real page finds both competing violation arrays using its unchanged key convention
        renderPage({reportActions: [createdAction], snapshotData, allReportViolations: {[transaction.transactionID]: liveViolations}});
        await waitForBatchedUpdatesWithAct();

        // Then live violations win independently of the transaction fallback
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
        const call = mockCreateTransactionThreadReport.mock.calls.at(0);
        expect(call).toBeDefined();
        expect(call?.[0].transaction).toBe(transaction);
        expect(call?.[0].transactionViolations).toBe(liveViolations);
    });
});
