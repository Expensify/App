/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import '@libs/actions/IOU/MoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import type * as PolicyUtils from '@libs/PolicyUtils';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
import {createRandomReport} from '../../utils/collections/reports';
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
            });
            await waitForBatchedUpdates();

            // Then the existing draft transactions should be cleared
            let updatedTransactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                waitForCollectionCallback: true,
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
            });
            await waitForBatchedUpdates();

            // Then a draft transaction should be created with the correct data
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                waitForCollectionCallback: true,
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
            });
            await waitForBatchedUpdates();

            // Then no draft transaction should be created
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                waitForCollectionCallback: true,
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
            });
            await waitForBatchedUpdates();

            // Then no draft transaction should be created
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactionDrafts = val;
                },
            });

            expect(Object.keys(transactionDrafts ?? {}).length).toBe(0);
        });
    });
});
