/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {renderHook, waitFor} from '@testing-library/react-native';
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {putOnHold} from '@libs/actions/IOU/Hold';
import '@libs/actions/IOU/MoneyRequest';
import {updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/SplitTransactionUpdate';
import {requestMoney, trackExpense} from '@libs/actions/IOU/TrackExpense';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {createWorkspace, generatePolicyID, setWorkspaceApprovalMode} from '@libs/actions/Policy/Policy';
import {createNewReport} from '@libs/actions/Report';
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportNameValuePairs} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import {changeTransactionsReport as changeTransactionsReportAction} from '../../src/libs/actions/Transaction';
import currencyList from '../unit/currencyList.json';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import getOnyxValue from '../utils/getOnyxValue';
import {getGlobalFetchMock, getOnyxData} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type LegacyChangeTransactionsReportProps = Omit<Parameters<typeof changeTransactionsReportAction>[0], 'transactions' | 'allTransactionViolation'> & {
    allTransactions: OnyxCollection<Transaction>;
    transactionViolations: Parameters<typeof changeTransactionsReportAction>[0]['allTransactionViolation'];
};

function changeTransactionsReport({allTransactions, transactionIDs, transactionViolations, ...rest}: LegacyChangeTransactionsReportProps) {
    const transactions = transactionIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((transaction): transaction is Transaction => !!transaction);
    changeTransactionsReportAction({transactionIDs, transactions, allTransactionViolation: transactionViolations, ...rest});
}

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
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

const getTransactionAndExpenseReports = (reportID: string) => {
    const transactionReport = getReportOrDraftReport(reportID);
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    const expenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;
    return {transactionReport, expenseReport};
};

OnyxUpdateManager();
describe('actions/Transaction', () => {
    const currentUserPersonalDetails: CurrentUserPersonalDetails = {
        ...createPersonalDetails(RORY_ACCOUNT_ID),
        login: RORY_EMAIL,
        email: RORY_EMAIL,
        displayName: RORY_EMAIL,
        avatar: 'https://example.com/avatar.jpg',
    };

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

    describe('changeTransactionsReport', () => {
        it('should set the correct optimistic onyx data for reporting a tracked expense', async () => {
            let personalDetailsList: OnyxEntry<PersonalDetailsList>;
            let expenseReport: OnyxEntry<Report>;
            let transaction: OnyxEntry<Transaction>;
            let allTransactions: OnyxCollection<Transaction> = {};

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            const creatorPersonalDetails = personalDetailsList?.[CARLOS_ACCOUNT_ID] ?? {accountID: CARLOS_ACCOUNT_ID};

            const policyID = generatePolicyID();
            const mockPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, "Carlos's Workspace"),
                id: policyID,
                outputCurrency: CONST.CURRENCY.USD,
                owner: CARLOS_EMAIL,
                ownerAccountID: CARLOS_ACCOUNT_ID,
                pendingAction: undefined,
            };

            await waitForBatchedUpdates();

            createNewReport(creatorPersonalDetails, true, false, mockPolicy, [CONST.BETAS.ALL]);
            // Create a tracked expense
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };

            const amount = 100;

            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            trackExpense({
                report: selfDMReport,
                isDraftPolicy: true,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    currency: CONST.CURRENCY.USD,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'merchant',
                    billable: false,
                    reimbursable: false,
                },
                isASAPSubmitBetaEnabled: false,
                currentUser: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                introSelected: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserLocalCurrency: undefined,
                reportActionsList: undefined,
            });
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    transaction = Object.values(transactions ?? {}).find((t) => !!t);
                    allTransactions = transactions;
                },
            });

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    expenseReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.EXPENSE);
                },
            });

            let iouReportActionOnSelfDMReport: OnyxEntry<ReportAction>;
            let trackExpenseActionableWhisper: OnyxEntry<ReportAction>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                waitForCollectionCallback: true,
                callback: (allReportActions) => {
                    iouReportActionOnSelfDMReport = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`] ?? {}).find(
                        (r) => r?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                    );
                    trackExpenseActionableWhisper = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport?.reportID}`] ?? {}).find(
                        (r) => r?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER,
                    );
                },
            });

            expect(isMoneyRequestAction(iouReportActionOnSelfDMReport) ? getOriginalMessage(iouReportActionOnSelfDMReport)?.IOUTransactionID : undefined).toBe(transaction?.transactionID);
            expect(trackExpenseActionableWhisper).toBeDefined();

            if (!transaction || !expenseReport) {
                return;
            }

            const {result} = renderHook(() => {
                const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.reportID}`);
                return {report};
            });

            await waitFor(() => {
                expect(result.current.report).toBeDefined();
            });

            const policyTagList = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${mockPolicy.id}`)) ?? {};

            changeTransactionsReport({
                transactionIDs: [transaction?.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CARLOS_ACCOUNT_ID,
                email: CARLOS_EMAIL,
                newReport: result.current.report,
                policy: mockPolicy,
                allTransactions,
                policyTagList,
                transactionViolations: {},
                allReports: undefined,
            });

            let updatedTransaction: OnyxEntry<Transaction>;
            let updatedIOUReportActionOnSelfDMReport: OnyxEntry<ReportAction>;
            let updatedTrackExpenseActionableWhisper: OnyxEntry<ReportAction>;
            let updatedExpenseReport: OnyxEntry<Report>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    updatedTransaction = Object.values(transactions ?? {}).find((t) => t?.transactionID === transaction?.transactionID);
                },
            });

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                waitForCollectionCallback: true,
                callback: (allReportActions) => {
                    updatedIOUReportActionOnSelfDMReport = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`] ?? {}).find(
                        (r) => r?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                    );
                    updatedTrackExpenseActionableWhisper = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport?.reportID}`] ?? {}).find(
                        (r) => r?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER,
                    );
                },
            });

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    updatedExpenseReport = Object.values(allReports ?? {}).find((r) => r?.reportID === expenseReport?.reportID);
                },
            });

            expect(updatedTransaction?.reportID).toBe(expenseReport?.reportID);
            expect(isMoneyRequestAction(updatedIOUReportActionOnSelfDMReport) ? getOriginalMessage(updatedIOUReportActionOnSelfDMReport)?.IOUTransactionID : undefined).toBe(undefined);
            expect(updatedTrackExpenseActionableWhisper).toBe(undefined);
            expect(updatedExpenseReport?.nonReimbursableTotal).toBe(-amount);
            expect(updatedExpenseReport?.total).toBe(-amount);
            expect(updatedExpenseReport?.unheldNonReimbursableTotal).toBe(-amount);
        });

        describe('updateSplitTransactionsFromSplitExpensesFlow', () => {
            it("should update split transaction's description correctly ", async () => {
                const amount = 10000;
                let expenseReport: OnyxEntry<Report>;
                let chatReport: OnyxEntry<Report>;
                let originalTransactionID;

                const policyID = generatePolicyID();
                createWorkspace({
                    policyOwnerEmail: CARLOS_EMAIL,
                    makeMeAdmin: true,
                    policyName: "Carlos's Workspace",
                    policyID,
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                    currentUserEmailParam: CARLOS_EMAIL,
                    currency: undefined,
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
                    activePolicy: undefined,
                });

                const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                // Change the approval mode for the policy since default is Submit and Close
                setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL, {});
                await waitForBatchedUpdates();
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                    },
                });
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: RORY_EMAIL,
                        payeeAccountID: RORY_ACCOUNT_ID,
                        participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport?.reportID},
                    },
                    transactionParams: {
                        amount,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant: 'NASDAQ',
                        comment: '*hey* `hey`',
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                    isSelfTourViewed: false,
                    quickAction: undefined,
                    betas: [CONST.BETAS.ALL],
                    personalDetails: {},
                });
                await waitForBatchedUpdates();
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                    },
                });
                await getOnyxData({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (allReportsAction) => {
                        const iouActions = Object.values(allReportsAction ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        const originalMessage = isMoneyRequestAction(iouActions?.at(0)) ? getOriginalMessage(iouActions?.at(0)) : undefined;
                        originalTransactionID = originalMessage?.IOUTransactionID;
                    },
                });

                const originalTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`);
                const draftTransaction: Transaction = {
                    reportID: originalTransaction?.reportID ?? '456',
                    transactionID: originalTransaction?.transactionID ?? '234',
                    amount,
                    created: originalTransaction?.created ?? DateUtils.getDBTime(),
                    currency: CONST.CURRENCY.USD,
                    merchant: originalTransaction?.merchant ?? '',
                    comment: {
                        originalTransactionID,
                        comment: originalTransaction?.comment?.comment ?? '',
                        splitExpenses: [
                            {
                                transactionID: '235',
                                amount: amount / 2,
                                description: '<strong>hey</strong><br /><code>hey</code>',
                                created: DateUtils.getDBTime(),
                            },
                            {
                                transactionID: '234',
                                amount: amount / 2,
                                description: '*hey1* `hey`',
                                created: DateUtils.getDBTime(),
                            },
                        ],
                        attendees: [],
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    },
                };

                let allTransactions: OnyxCollection<Transaction>;
                let allReports: OnyxCollection<Report>;
                let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allTransactions = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReports = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReportNameValuePairs = value;
                    },
                });

                const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
                const policyTags = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${reportID}`)) ?? {};
                const reports = getTransactionAndExpenseReports(reportID);

                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportActionsList: undefined,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID,
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    searchContext: {
                        currentSearchHash: -2,
                    },
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU: undefined,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    iouReportNextStep: undefined,
                    betas: [CONST.BETAS.ALL],
                    policyTags,
                    personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                    transactionReport: reports.transactionReport,
                    expenseReport: reports.expenseReport,
                    isOffline: false,
                });
                await waitForBatchedUpdates();

                const split1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}235`);
                expect(split1?.comment?.comment).toBe('<strong>hey</strong><br /><code>hey</code>');
                const split2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}234`);
                expect(split2?.comment?.comment).toBe('<strong>hey1</strong> <code>hey</code>');
            });

            it("should not create new expense report if the admin split the employee's expense", async () => {
                const amount = 10000;
                let expenseReport: OnyxEntry<Report>;
                let chatReport: OnyxEntry<Report>;
                let originalTransactionID;

                const policyID = generatePolicyID();
                createWorkspace({
                    policyOwnerEmail: RORY_EMAIL,
                    makeMeAdmin: true,
                    policyName: "Rory's Workspace",
                    policyID,
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    currentUserAccountIDParam: RORY_ACCOUNT_ID,
                    currentUserEmailParam: RORY_EMAIL,
                    currency: undefined,
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
                    activePolicy: undefined,
                });

                const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                // Change the approval mode for the policy since default is Submit and Close
                setWorkspaceApprovalMode(policy, RORY_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL, {});
                await waitForBatchedUpdates();
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                    },
                });
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: CARLOS_EMAIL,
                        payeeAccountID: CARLOS_ACCOUNT_ID,
                        participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport?.reportID},
                    },
                    transactionParams: {
                        amount,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant: 'NASDAQ',
                        comment: '*hey* `hey`',
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                    isSelfTourViewed: false,
                    quickAction: undefined,
                    betas: [CONST.BETAS.ALL],
                    personalDetails: {},
                });
                await waitForBatchedUpdates();
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                    },
                });
                await getOnyxData({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (allReportsAction) => {
                        const iouActions = Object.values(allReportsAction ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        const originalMessage = isMoneyRequestAction(iouActions?.at(0)) ? getOriginalMessage(iouActions?.at(0)) : undefined;
                        originalTransactionID = originalMessage?.IOUTransactionID;
                    },
                });

                const originalTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`);
                const draftTransaction: Transaction = {
                    reportID: originalTransaction?.reportID ?? '456',
                    transactionID: originalTransaction?.transactionID ?? '234',
                    amount,
                    created: originalTransaction?.created ?? DateUtils.getDBTime(),
                    currency: CONST.CURRENCY.USD,
                    merchant: originalTransaction?.merchant ?? '',
                    comment: {
                        originalTransactionID,
                        comment: originalTransaction?.comment?.comment ?? '',
                        splitExpenses: [
                            {
                                transactionID: '235',
                                amount: amount / 2,
                                description: '<strong>hey</strong><br /><code>hey</code>',
                                created: DateUtils.getDBTime(),
                            },
                            {
                                transactionID: '234',
                                amount: amount / 2,
                                description: '*hey1* `hey`',
                                created: DateUtils.getDBTime(),
                            },
                        ],
                        attendees: [],
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    },
                };

                let allTransactions: OnyxCollection<Transaction>;
                let allReports: OnyxCollection<Report>;
                let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allTransactions = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReports = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReportNameValuePairs = value;
                    },
                });

                const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
                const policyTags = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${reportID}`)) ?? {};
                const reports = getTransactionAndExpenseReports(reportID);

                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportActionsList: undefined,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID,
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    searchContext: {
                        currentSearchHash: -2,
                    },
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU: undefined,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    iouReportNextStep: undefined,
                    betas: [CONST.BETAS.ALL],
                    policyTags,
                    personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                    transactionReport: reports.transactionReport,
                    expenseReport: reports.expenseReport,
                    isOffline: false,
                });
                await waitForBatchedUpdates();

                const split1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}235`);
                expect(split1?.reportID).toBe(expenseReport?.reportID);
                const split2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}234`);
                expect(split2?.reportID).toBe(expenseReport?.reportID);
            });

            it('should use splitExpensesTotal in calculation when editing splits', async () => {
                // The fix ensures we rely on splitExpensesTotal rather than potentially incorrect backend reportTotal
                // This prevents scenarios where backend sends wrong total (e.g., -$2 instead of -$10)
                // from causing incorrect report totals (e.g., $24 instead of correct -$10)

                const amount = -10000;
                let expenseReport: OnyxEntry<Report>;
                let chatReport: OnyxEntry<Report>;
                let originalTransactionID;

                const policyID = generatePolicyID();
                createWorkspace({
                    policyOwnerEmail: CARLOS_EMAIL,
                    makeMeAdmin: true,
                    policyName: "Carlos's Workspace",
                    policyID,
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                    currentUserEmailParam: CARLOS_EMAIL,
                    currency: undefined,
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
                    activePolicy: undefined,
                });

                const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL, {});
                await waitForBatchedUpdates();

                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                    },
                });

                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: RORY_EMAIL,
                        payeeAccountID: RORY_ACCOUNT_ID,
                        participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport?.reportID},
                    },
                    transactionParams: {
                        amount,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant: 'Test Merchant',
                        comment: 'Test expense',
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                    isSelfTourViewed: false,
                    quickAction: undefined,
                    betas: [CONST.BETAS.ALL],
                    personalDetails: {},
                });
                await waitForBatchedUpdates();

                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                    },
                });

                await getOnyxData({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (allReportsAction) => {
                        const iouActions = Object.values(allReportsAction ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        const originalMessage = isMoneyRequestAction(iouActions?.at(0)) ? getOriginalMessage(iouActions?.at(0)) : undefined;
                        originalTransactionID = originalMessage?.IOUTransactionID;
                    },
                });

                const originalTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`);

                // Set up split expenses with explicit splitExpensesTotal
                // Using negative amounts to get positive transaction amounts (expense reports store as negative)
                const splitExpensesTotal = -8000; // -$80 total for splits
                const draftTransaction: Transaction = {
                    reportID: originalTransaction?.reportID ?? '456',
                    transactionID: originalTransaction?.transactionID ?? '234',
                    amount,
                    created: originalTransaction?.created ?? DateUtils.getDBTime(),
                    currency: CONST.CURRENCY.USD,
                    merchant: originalTransaction?.merchant ?? '',
                    comment: {
                        originalTransactionID,
                        comment: originalTransaction?.comment?.comment ?? '',
                        splitExpenses: [
                            {
                                transactionID: '235',
                                amount: -5000,
                                description: 'Split 1',
                                created: DateUtils.getDBTime(),
                            },
                            {
                                transactionID: '236',
                                amount: -3000,
                                description: 'Split 2',
                                created: DateUtils.getDBTime(),
                            },
                        ],
                        splitExpensesTotal,
                        attendees: [],
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    },
                };

                let allTransactions: OnyxCollection<Transaction>;
                let allReports: OnyxCollection<Report>;
                let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allTransactions = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReports = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReportNameValuePairs = value;
                    },
                });

                const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
                const policyTags = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${reportID}`)) ?? {};
                const reports = getTransactionAndExpenseReports(reportID);

                // it should use splitExpensesTotal in its calculation
                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportActionsList: undefined,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID,
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    searchContext: {
                        currentSearchHash: -2,
                    },
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU: undefined,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    iouReportNextStep: undefined,
                    betas: [CONST.BETAS.ALL],
                    policyTags,
                    personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                    transactionReport: reports.transactionReport,
                    expenseReport: reports.expenseReport,
                    isOffline: false,
                });
                await waitForBatchedUpdates();

                const split1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}235`);
                const split2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}236`);

                expect(split1).toBeDefined();
                expect(split2).toBeDefined();
            });

            it('should create hold report actions for split transactions when original transaction is on hold', async () => {
                // Given an expense that is on hold
                const amount = 10000;
                let expenseReport: OnyxEntry<Report>;
                let chatReport: OnyxEntry<Report>;
                let originalTransactionID: string | undefined;
                let transactionThreadReportID: string | undefined;

                const policyID = generatePolicyID();
                createWorkspace({
                    policyOwnerEmail: CARLOS_EMAIL,
                    makeMeAdmin: true,
                    policyName: "Carlos's Workspace for Hold Test",
                    policyID,
                    introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                    currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                    currentUserEmailParam: CARLOS_EMAIL,
                    currency: undefined,
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
                    activePolicy: undefined,
                });

                const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                // Change the approval mode for the policy since default is Submit and Close
                setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL, {});
                await waitForBatchedUpdates();

                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                    },
                });

                // Create the initial expense
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: RORY_EMAIL,
                        payeeAccountID: RORY_ACCOUNT_ID,
                        participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport?.reportID},
                    },
                    transactionParams: {
                        amount,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant: 'Test Merchant',
                        comment: 'Original expense',
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: RORY_ACCOUNT_ID,
                    currentUserEmailParam: RORY_EMAIL,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                    isSelfTourViewed: false,
                    quickAction: undefined,
                    betas: [CONST.BETAS.ALL],
                    personalDetails: {},
                });
                await waitForBatchedUpdates();

                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                    },
                });

                // Get the original transaction ID and transaction thread report ID
                await getOnyxData({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (allReportsAction) => {
                        const iouActions = Object.values(allReportsAction ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        const iouAction = iouActions?.at(0);
                        const originalMessage = isMoneyRequestAction(iouAction) ? getOriginalMessage(iouAction) : undefined;
                        originalTransactionID = originalMessage?.IOUTransactionID;
                        transactionThreadReportID = iouAction?.childReportID;
                    },
                });

                // Put the expense on hold
                if (originalTransactionID && transactionThreadReportID) {
                    putOnHold(originalTransactionID, 'Test hold reason', transactionThreadReportID, false, RORY_EMAIL, RORY_ACCOUNT_ID, []);
                }
                await waitForBatchedUpdates();

                // Verify the transaction is on hold
                const originalTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`);
                expect(originalTransaction?.comment?.hold).toBeDefined();

                // Get the first IOU action for the split flow
                let firstIOU: ReportAction | undefined;
                await getOnyxData({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (allReportsAction) => {
                        const iouActions = Object.values(allReportsAction ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        firstIOU = iouActions?.at(0);
                    },
                });

                // Create the draft transaction with split expenses
                const draftTransaction: Transaction = {
                    reportID: originalTransaction?.reportID ?? '456',
                    transactionID: originalTransaction?.transactionID ?? '234',
                    amount,
                    created: originalTransaction?.created ?? DateUtils.getDBTime(),
                    currency: CONST.CURRENCY.USD,
                    merchant: originalTransaction?.merchant ?? '',
                    comment: {
                        originalTransactionID,
                        comment: originalTransaction?.comment?.comment ?? '',
                        hold: originalTransaction?.comment?.hold,
                        splitExpenses: [
                            {
                                transactionID: 'split-held-tx-1',
                                amount: amount / 2,
                                description: 'Split 1',
                                created: DateUtils.getDBTime(),
                            },
                            {
                                transactionID: 'split-held-tx-2',
                                amount: amount / 2,
                                description: 'Split 2',
                                created: DateUtils.getDBTime(),
                            },
                        ],
                        attendees: [],
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    },
                };

                let allTransactions: OnyxCollection<Transaction>;
                let allReports: OnyxCollection<Report>;
                let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allTransactions = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReports = value;
                    },
                });
                await getOnyxData({
                    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        allReportNameValuePairs = value;
                    },
                });

                const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
                const policyTags = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${reportID}`)) ?? {};
                const reports = getTransactionAndExpenseReports(reportID);

                // When splitting the held expense
                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportActionsList: undefined,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID,
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    searchContext: {
                        currentSearchHash: -2,
                    },
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    iouReportNextStep: undefined,
                    betas: [CONST.BETAS.ALL],
                    policyTags,
                    personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                    transactionReport: reports.transactionReport,
                    expenseReport: reports.expenseReport,
                    isOffline: false,
                });

                await waitForBatchedUpdates();

                // Then verify the split transactions were created
                const split1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}split-held-tx-1`);
                const split2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}split-held-tx-2`);

                expect(split1).toBeDefined();
                expect(split2).toBeDefined();

                // Find the transaction thread reports for each split by looking at the IOU actions
                let split1ThreadReportID: string | undefined;
                let split2ThreadReportID: string | undefined;

                await getOnyxData({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (allReportsAction) => {
                        const iouActions = Object.values(allReportsAction ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        for (const action of iouActions) {
                            const message = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
                            if (message?.IOUTransactionID === 'split-held-tx-1') {
                                split1ThreadReportID = action.childReportID;
                            } else if (message?.IOUTransactionID === 'split-held-tx-2') {
                                split2ThreadReportID = action.childReportID;
                            }
                        }
                    },
                });

                // Verify that split transaction thread IDs exist
                expect(split1ThreadReportID).toBeDefined();
                expect(split2ThreadReportID).toBeDefined();

                // Verify each split transaction thread has hold report actions
                // When splitting a held expense, new hold report actions should be created for each split
                if (split1ThreadReportID) {
                    const split1ReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${split1ThreadReportID}`);
                    const split1HoldActions = Object.values(split1ReportActions ?? {}).filter((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD);
                    const split1CommentActions = Object.values(split1ReportActions ?? {}).filter((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);

                    // Should have at least one HOLD action and one ADD_COMMENT action (the hold comment)
                    // The hold actions are created optimistically with pendingAction: ADD, but this
                    // may be cleared to null after the API call succeeds
                    expect(split1HoldActions.length).toBeGreaterThanOrEqual(1);
                    expect(split1CommentActions.length).toBeGreaterThanOrEqual(1);
                }

                if (split2ThreadReportID) {
                    const split2ReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${split2ThreadReportID}`);
                    const split2HoldActions = Object.values(split2ReportActions ?? {}).filter((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD);
                    const split2CommentActions = Object.values(split2ReportActions ?? {}).filter((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);

                    // Should have at least one HOLD action and one ADD_COMMENT action (the hold comment)
                    expect(split2HoldActions.length).toBeGreaterThanOrEqual(1);
                    expect(split2CommentActions.length).toBeGreaterThanOrEqual(1);
                }
            });
        });
    });
});
