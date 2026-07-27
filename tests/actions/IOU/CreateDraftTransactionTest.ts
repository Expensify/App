import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type * as PolicyUtils from '@libs/PolicyUtils';
import '@libs/actions/IOU/MoneyRequest';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';

import currencyList from '../../unit/currencyList.json';
import {createPolicyExpenseChat, createRandomReport, createSelfDM} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import {getGlobalFetchMock, getOnyxData} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
const mockedIsReportTopmostSplitNavigator = jest.mocked(isReportTopmostSplitNavigator);
// In production, requestMoney defers its API.write() call until the target screen's
// content lays out (or a safety timeout fires). In tests there is no target component
// to flush the deferred write, so we bypass the deferral by executing the callback immediately.
jest.mock('@libs/deferredLayoutWrite', () => ({
    registerDeferredWrite: (_key: string, callback: () => void) => callback(),
    flushDeferredWrite: jest.fn(),
    cancelDeferredWrite: jest.fn(),
    hasDeferredWrite: () => false,
    getOptimisticWatchKey: () => undefined,
    deferOrExecuteWrite: (apiWrite: () => void) => apiWrite(),
    reserveDeferredWriteChannel: jest.fn(),
    resetForTesting: jest.fn(),
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const unapprovedCashHash = 71801560;
const unapprovedCashSimilarSearchHash = 1832274510;
jest.mock('@src/libs/SearchQueryUtils', () => {
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => ({
            hash: unapprovedCashHash,
            query: 'test',
            type: 'expense',
            status: ['drafts', 'outstanding'],
            filters: {operator: 'eq', left: 'reimbursable', right: 'yes'},
            flatFilters: [{key: 'reimbursable', filters: [{operator: 'eq', value: 'yes'}]}],
            inputQuery: '',
            recentSearchHash: 89,
            similarSearchHash: unapprovedCashSimilarSearchHash,
            sortBy: 'tag',
            sortOrder: 'asc',
        })),
        buildCannedSearchQuery: jest.fn(),
    };
});

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/IOU', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createDraftTransactionAndNavigateToParticipantSelector', () => {
        it('should clear existing draft transactions when draftTransactionIDs is provided', async () => {
            // Given existing draft transactions
            const existingDraftTransaction1: Transaction = {...createRandomTransaction(1), transactionID: 'existing-draft-1'};
            const existingDraftTransaction2: Transaction = {...createRandomTransaction(2), transactionID: 'existing-draft-2'};

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingDraftTransaction1.transactionID}`, existingDraftTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingDraftTransaction2.transactionID}`, existingDraftTransaction2);

            // Given a selfDM report and a transaction to categorize
            const selfDMReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);
            const transactionToCategorize: Transaction = {...createRandomTransaction(3), transactionID: 'transaction-to-categorize'};

            // Given a report action ID for the track expense
            const reportActionID = '1';

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionToCategorize.transactionID}`, transactionToCategorize);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When createDraftTransactionAndNavigateToParticipantSelector is called with draftTransactionIDs
            createDraftTransactionAndNavigateToParticipantSelector({
                reportID: selfDMReport.reportID,
                actionName: CONST.IOU.ACTION.CATEGORIZE,
                reportActionID,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                draftTransactionIDs: [existingDraftTransaction1.transactionID, existingDraftTransaction2.transactionID],
                activePolicy: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                transaction: transactionToCategorize,
                currentUserAccountID: RORY_ACCOUNT_ID,
                currentUserEmail: RORY_EMAIL,
                currentUserLocalCurrency: '',
                filteredPoliciesCount: 0,
                firstPolicyID: undefined,
            });
            await waitForBatchedUpdates();

            // Then the existing draft transactions should be cleared
            let updatedTransactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                callback: (val) => {
                    updatedTransactionDrafts = val;
                },
            });

            // Old drafts should be cleared
            expect(updatedTransactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingDraftTransaction1.transactionID}`]).toBeFalsy();
            expect(updatedTransactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingDraftTransaction2.transactionID}`]).toBeFalsy();

            // New draft should be created for the transaction being categorized
            expect(updatedTransactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionToCategorize.transactionID}`]).toBeTruthy();
        });

        it('should create a draft transaction with correct data when categorizing', async () => {
            // Given a selfDM report and a transaction with specific data
            const selfDMReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);
            const originalTransaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID: 'original-transaction',
                amount: 5000,
                currency: 'USD',
            };

            // Given a report action ID for the track expense
            const reportActionID = '1';

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransaction.transactionID}`, originalTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When createDraftTransactionAndNavigateToParticipantSelector is called with empty allTransactionDrafts
            createDraftTransactionAndNavigateToParticipantSelector({
                reportID: selfDMReport.reportID,
                actionName: CONST.IOU.ACTION.CATEGORIZE,
                reportActionID,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                draftTransactionIDs: [],
                activePolicy: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                transaction: originalTransaction,
                currentUserAccountID: RORY_ACCOUNT_ID,
                currentUserEmail: RORY_EMAIL,
                currentUserLocalCurrency: '',
                filteredPoliciesCount: 0,
                firstPolicyID: undefined,
            });
            await waitForBatchedUpdates();

            // Then a draft transaction should be created with the correct data
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                callback: (val) => {
                    transactionDrafts = val;
                },
            });

            const draftTransaction = transactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${originalTransaction.transactionID}`];
            expect(draftTransaction).toBeTruthy();
            expect(draftTransaction?.amount).toBe(-originalTransaction.amount);
            expect(draftTransaction?.currency).toBe(originalTransaction.currency);
            expect(draftTransaction?.actionableWhisperReportActionID).toBe(reportActionID);
            expect(draftTransaction?.linkedTrackedExpenseReportID).toBe(selfDMReport.reportID);
        });

        it('should not create draft transaction when transaction is undefined', async () => {
            // Given a selfDM report
            const selfDMReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When createDraftTransactionAndNavigateToParticipantSelector is called with undefined transaction
            createDraftTransactionAndNavigateToParticipantSelector({
                reportID: selfDMReport.reportID,
                actionName: CONST.IOU.ACTION.CATEGORIZE,
                reportActionID: 'some-report-action-id',
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                draftTransactionIDs: [],
                activePolicy: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                transaction: undefined,
                currentUserAccountID: RORY_ACCOUNT_ID,
                currentUserEmail: RORY_EMAIL,
                currentUserLocalCurrency: '',
                filteredPoliciesCount: 0,
                firstPolicyID: undefined,
            });
            await waitForBatchedUpdates();

            // Then no draft transaction should be created
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                callback: (val) => {
                    transactionDrafts = val;
                },
            });

            expect(Object.keys(transactionDrafts ?? {}).length).toBe(0);
        });

        it('should not create draft transaction when reportID is undefined', async () => {
            // Given a transaction
            const transaction: Transaction = {...createRandomTransaction(1), transactionID: 'test-transaction'};
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            // When createDraftTransactionAndNavigateToParticipantSelector is called with undefined reportID
            createDraftTransactionAndNavigateToParticipantSelector({
                reportID: undefined,
                actionName: CONST.IOU.ACTION.CATEGORIZE,
                reportActionID: 'some-report-action-id',
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                draftTransactionIDs: [],
                activePolicy: undefined,
                transaction,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                currentUserAccountID: RORY_ACCOUNT_ID,
                currentUserEmail: RORY_EMAIL,
                currentUserLocalCurrency: '',
                filteredPoliciesCount: 0,
                firstPolicyID: undefined,
            });
            await waitForBatchedUpdates();

            // Then no draft transaction should be created
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                callback: (val) => {
                    transactionDrafts = val;
                },
            });

            expect(Object.keys(transactionDrafts ?? {}).length).toBe(0);
        });

        describe('submitting a tracked expense to an employer', () => {
            const POLICY_ID = 'policy-with-access';

            async function setUpSelfDMTrackedExpense() {
                const selfDMReport = createSelfDM(1, RORY_ACCOUNT_ID);
                const policyExpenseChat: Report = {
                    ...createPolicyExpenseChat(2),
                    ownerAccountID: RORY_ACCOUNT_ID,
                    policyID: POLICY_ID,
                };
                const trackedExpense: Transaction = {
                    ...createRandomTransaction(1),
                    transactionID: 'tracked-expense',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${trackedExpense.transactionID}`, trackedExpense);
                await waitForBatchedUpdates();

                return {selfDMReport, policyExpenseChat, trackedExpense};
            }

            function getConfirmationRouteBackTo() {
                const confirmationRoute = jest
                    .mocked(Navigation.navigate)
                    .mock.calls.map(([route]) => String(route))
                    .find((route) => route.includes('confirmation'));
                return new URLSearchParams(confirmationRoute?.split('?').at(1)).get('backTo');
            }

            async function getDraftTransaction(transactionID: string) {
                let transactionDrafts: OnyxCollection<Transaction>;
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                    callback: (val) => {
                        transactionDrafts = val;
                    },
                });
                return transactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`];
            }

            it('should bind the draft transaction to the destination chat when exactly one workspace is accessible', async () => {
                // Given a tracked self DM expense and a single workspace the user can submit to
                const {selfDMReport, policyExpenseChat, trackedExpense} = await setUpSelfDMTrackedExpense();

                // When the expense is submitted to the employer, skipping the destination picker
                createDraftTransactionAndNavigateToParticipantSelector({
                    reportID: selfDMReport.reportID,
                    actionName: CONST.IOU.ACTION.SUBMIT,
                    reportActionID: '1',
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    draftTransactionIDs: [],
                    activePolicy: undefined,
                    userBillingGracePeriodEnds: undefined,
                    amountOwed: 0,
                    transaction: trackedExpense,
                    currentUserAccountID: RORY_ACCOUNT_ID,
                    currentUserEmail: RORY_EMAIL,
                    currentUserLocalCurrency: '',
                    submitDestination: CONST.IOU.SUBMIT_DESTINATION.EMPLOYER,
                    filteredPoliciesCount: 1,
                    firstPolicyID: POLICY_ID,
                });
                await waitForBatchedUpdates();

                // Then the draft is no longer unreported, so the confirmation page resolves the destination workspace
                const draftTransaction = await getDraftTransaction(trackedExpense.transactionID);
                expect(draftTransaction?.reportID).toBe(policyExpenseChat.reportID);
                expect(draftTransaction?.participants?.at(0)?.reportID).toBe(policyExpenseChat.reportID);

                // And the user lands on the confirmation page for that workspace
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.SUBMIT, CONST.IOU.TYPE.SUBMIT, trackedExpense.transactionID, policyExpenseChat.reportID),
                );
            });

            it('should send the user back to the report they are viewing when a draft workspace is created', async () => {
                // Given a tracked self DM expense the user drilled into, so the expense thread is the visible report
                const {selfDMReport, trackedExpense} = await setUpSelfDMTrackedExpense();
                mockedIsReportTopmostSplitNavigator.mockReturnValue(true);

                // When the expense is submitted to the employer and there is no workspace to submit to
                createDraftTransactionAndNavigateToParticipantSelector({
                    reportID: selfDMReport.reportID,
                    actionName: CONST.IOU.ACTION.SUBMIT,
                    reportActionID: '1',
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    draftTransactionIDs: [],
                    activePolicy: undefined,
                    userBillingGracePeriodEnds: undefined,
                    amountOwed: 0,
                    transaction: trackedExpense,
                    currentUserAccountID: RORY_ACCOUNT_ID,
                    currentUserEmail: RORY_EMAIL,
                    currentUserLocalCurrency: '',
                    submitDestination: CONST.IOU.SUBMIT_DESTINATION.EMPLOYER,
                    defaultWorkspaceName: "Rory's Workspace",
                    filteredPoliciesCount: 0,
                    firstPolicyID: undefined,
                });
                await waitForBatchedUpdates();

                // Then back from the confirmation page returns to the visible report, not the self DM the expense lives on
                expect(getConfirmationRouteBackTo()).toBe(ROUTES.REPORT_WITH_ID.getRoute(topMostReportID));
            });

            it('should fall back to the expense report when no report is visible behind the confirmation page', async () => {
                // Given the flow is started from somewhere other than a report, e.g. the Search tab
                const {selfDMReport, trackedExpense} = await setUpSelfDMTrackedExpense();
                mockedIsReportTopmostSplitNavigator.mockReturnValue(false);

                // When the expense is submitted to the employer and there is no workspace to submit to
                createDraftTransactionAndNavigateToParticipantSelector({
                    reportID: selfDMReport.reportID,
                    actionName: CONST.IOU.ACTION.SUBMIT,
                    reportActionID: '1',
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    draftTransactionIDs: [],
                    activePolicy: undefined,
                    userBillingGracePeriodEnds: undefined,
                    amountOwed: 0,
                    transaction: trackedExpense,
                    currentUserAccountID: RORY_ACCOUNT_ID,
                    currentUserEmail: RORY_EMAIL,
                    currentUserLocalCurrency: '',
                    submitDestination: CONST.IOU.SUBMIT_DESTINATION.EMPLOYER,
                    defaultWorkspaceName: "Rory's Workspace",
                    filteredPoliciesCount: 0,
                    firstPolicyID: undefined,
                });
                await waitForBatchedUpdates();

                // Then back returns to the report the expense lives on
                expect(getConfirmationRouteBackTo()).toBe(ROUTES.REPORT_WITH_ID.getRoute(selfDMReport.reportID));
            });

            it('should leave the draft transaction unreported when the destination picker is shown', async () => {
                // Given a tracked self DM expense and more than one workspace the user can submit to
                const {selfDMReport, trackedExpense} = await setUpSelfDMTrackedExpense();

                // When the expense is submitted to the employer
                createDraftTransactionAndNavigateToParticipantSelector({
                    reportID: selfDMReport.reportID,
                    actionName: CONST.IOU.ACTION.SUBMIT,
                    reportActionID: '1',
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    draftTransactionIDs: [],
                    activePolicy: undefined,
                    userBillingGracePeriodEnds: undefined,
                    amountOwed: 0,
                    transaction: trackedExpense,
                    currentUserAccountID: RORY_ACCOUNT_ID,
                    currentUserEmail: RORY_EMAIL,
                    currentUserLocalCurrency: '',
                    submitDestination: CONST.IOU.SUBMIT_DESTINATION.EMPLOYER,
                    filteredPoliciesCount: 2,
                    firstPolicyID: POLICY_ID,
                });
                await waitForBatchedUpdates();

                // Then the picker owns the binding, so the draft keeps the unreported ID it inherited
                const draftTransaction = await getDraftTransaction(trackedExpense.transactionID);
                expect(draftTransaction?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SUBMIT, trackedExpense.transactionID, selfDMReport.reportID, undefined, CONST.IOU.ACTION.SUBMIT, true),
                );
            });
        });
    });
});
