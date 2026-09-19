/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
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

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.MockedFunction<typeof useCurrentUserPersonalDetails>;
const mockUsePersonalDetails = usePersonalDetails as jest.MockedFunction<typeof usePersonalDetails>;
const mockUseDismissOnMoneyRequestReportRemoval = useDismissOnMoneyRequestReportRemoval as jest.MockedFunction<typeof useDismissOnMoneyRequestReportRemoval>;
const mockUseSubmitToDestinationVisible = useSubmitToDestinationVisible as jest.MockedFunction<typeof useSubmitToDestinationVisible>;
const mockUseReportIsArchived = useReportIsArchived as jest.MockedFunction<typeof useReportIsArchived>;
const mockUseIsReportReadyToDisplay = useIsReportReadyToDisplay as jest.MockedFunction<typeof useIsReportReadyToDisplay>;
const mockUseParentReportAction = useParentReportAction as jest.MockedFunction<typeof useParentReportAction>;
const mockUseDerivedReportNameByReportID = useDerivedReportNameByReportID as jest.MockedFunction<typeof useDerivedReportNameByReportID>;
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUseClearReportActionDraftsOnReportChange = useClearReportActionDraftsOnReportChange as jest.MockedFunction<typeof useClearReportActionDraftsOnReportChange>;
const mockUseTransactionsAndViolationsForReport = useTransactionsAndViolationsForReport as jest.MockedFunction<typeof useTransactionsAndViolationsForReport>;
const mockUseTransactionThreadReportID = useTransactionThreadReportID as jest.MockedFunction<typeof useTransactionThreadReportID>;
const mockUseSearchResultsContext = useSearchResultsContext as jest.MockedFunction<typeof useSearchResultsContext>;
const mockCreateTransactionThreadReport = createTransactionThreadReport as jest.MockedFunction<typeof createTransactionThreadReport>;

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
    return {
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
    } as OnyxTypes.ReportAction;
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
    } as OnyxTypes.Transaction;
}

type RenderOptions = {
    allReportTransactions?: Record<string, OnyxTypes.Transaction>;
    reportActions?: OnyxTypes.ReportAction[];
    transactionThreadReportID?: string;
    snapshotData?: Record<string, unknown>;
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
const pageProps = {
    route: {
        params: {reportID: REPORT_ID, backTo: undefined},
        name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
        key: 'route-key',
    },
} as unknown as React.ComponentProps<typeof SearchMoneyRequestReportPage>;

function renderPage(options: RenderOptions) {
    const {allReportTransactions = {}, reportActions = [], transactionThreadReportID = undefined, snapshotData} = options;
    // `'report' in options` distinguishes "not passed" (default to mockReport) from an explicit
    // `{report: undefined}` (the report-not-loaded-yet case) — a destructuring default would swallow the latter.
    const report = 'report' in options ? options.report : mockReport;
    mockUseTransactionsAndViolationsForReport.mockReturnValue({transactions: allReportTransactions, violations: {}, isLoaded: true});
    mockUseTransactionThreadReportID.mockReturnValue({
        transactionThreadReportID,
        effectiveTransactionThreadReportID: transactionThreadReportID,
        reportActions,
    });
    mockUseSearchResultsContext.mockReturnValue({
        currentSearchResults: snapshotData ? ({data: snapshotData, search: {}} as never) : undefined,
    } as ReturnType<typeof useSearchResultsContext>);
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
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1, login: 'test@example.com', email: 'test@example.com'} as ReturnType<typeof useCurrentUserPersonalDetails>);
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
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        await seedReportActions(REPORT_ID, [createdAction]);
        const transaction = buildTransaction('txn1', REPORT_ID);

        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [createdAction]});
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'txn1'})}));
    });

    it('self-heals when the report has multiple non-IOU actions (CREATED + SUBMITTED), none of them IOU', async () => {
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const submittedAction = buildReportAction({reportActionID: 'a2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        await seedReportActions(REPORT_ID, [createdAction, submittedAction]);
        const transaction = buildTransaction('txn2', REPORT_ID);

        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [createdAction, submittedAction]});
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'txn2'})}));
    });

    it('does not self-heal when the reportActions are stale data from a different report', async () => {
        const staleAction1 = buildReportAction({reportActionID: 'stale1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const staleAction2 = buildReportAction({reportActionID: 'stale2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        // These reportActionIDs only exist under the OTHER report's Onyx bucket, not under REPORT_ID's.
        await seedReportActions(OTHER_REPORT_ID, [staleAction1, staleAction2]);
        const transaction = buildTransaction('txn3', REPORT_ID);

        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [staleAction1, staleAction2]});
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('does not self-heal (and does not double-create) when a real IOU action for the transaction already exists', async () => {
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const iouAction = buildIOUAction('iou1', 'txn4');
        await seedReportActions(REPORT_ID, [createdAction, iouAction]);
        const transaction = buildTransaction('txn4', REPORT_ID);

        renderPage({allReportTransactions: {[transaction.transactionID]: transaction}, reportActions: [createdAction, iouAction]});
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('picks the transaction matching the current report from the search snapshot, even when it is not the first key', async () => {
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        await seedReportActions(REPORT_ID, [createdAction]);

        const wrongReportTransaction = buildTransaction('wrongReportTxn', OTHER_REPORT_ID);
        const correctTransaction = buildTransaction('correctTxn', REPORT_ID);

        // Insertion order matters here: the wrong-report transaction key comes first in the snapshot blob,
        // so picking "the first transactions_ key" (the pre-fix behavior) would resolve to the wrong transaction.
        const snapshotData: Record<string, unknown> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${wrongReportTransaction.transactionID}`]: wrongReportTransaction,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${correctTransaction.transactionID}`]: correctTransaction,
        };

        // No transactions in the main collection, forcing the component to fall back to the snapshot.
        renderPage({allReportTransactions: {}, reportActions: [createdAction], snapshotData});
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'correctTxn'})}));
    });

    it('does not self-heal while the report has not loaded yet, and retries once it does (does not get stuck)', async () => {
        const createdAction = buildReportAction({reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const submittedAction = buildReportAction({reportActionID: 'a2', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED});
        await seedReportActions(REPORT_ID, [createdAction, submittedAction]);
        const transaction = buildTransaction('txn5', REPORT_ID);

        const {rerender} = renderPage({
            allReportTransactions: {[transaction.transactionID]: transaction},
            reportActions: [createdAction, submittedAction],
            report: undefined,
        });
        await waitForBatchedUpdatesWithAct();

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

        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 'txn5'})}));
    });
});
