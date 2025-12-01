/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {renderHook, waitFor} from '@testing-library/react-native';
import {format} from 'date-fns';
import {deepEqual} from 'fast-equals';
import type {OnyxCollection, OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SearchStatus} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import type {PerDiemExpenseTransactionParams, RequestMoneyParticipantParams} from '@libs/actions/IOU';
import {
    addSplitExpenseField,
    approveMoneyRequest,
    calculateDiffAmount,
    canApproveIOU,
    canCancelPayment,
    cancelPayment,
    canIOUBePaid,
    canUnapproveIOU,
    completeSplitBill,
    createDistanceRequest,
    deleteMoneyRequest,
    evenlyDistributeSplitExpenseAmounts,
    getIOUReportActionToApproveOrPay,
    getPerDiemExpenseInformation,
    getReportPreviewAction,
    getSendInvoiceInformation,
    initMoneyRequest,
    initSplitExpense,
    markRejectViolationAsResolved,
    mergeDuplicates,
    payMoneyRequest,
    putOnHold,
    rejectMoneyRequest,
    replaceReceipt,
    requestMoney,
    resolveDuplicates,
    retractReport,
    sendInvoice,
    setDraftSplitTransaction,
    setMoneyRequestCategory,
    shouldOptimisticallyUpdateSearch,
    splitBill,
    startSplitBill,
    submitReport,
    trackExpense,
    unholdRequest,
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestAttendees,
    updateMoneyRequestCategory,
    updateSplitExpenseAmountField,
    updateSplitTransactionsFromSplitExpensesFlow,
} from '@libs/actions/IOU';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {createWorkspace, deleteWorkspace, generatePolicyID, setWorkspaceApprovalMode} from '@libs/actions/Policy/Policy';
import {addComment, createNewReport, deleteReport, notifyNewAction, openReport} from '@libs/actions/Report';
import {clearAllRelatedReportActionErrors} from '@libs/actions/ReportActions';
import {subscribeToUserEvents} from '@libs/actions/User';
import type {ApiCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {
    getOriginalMessage,
    getReportActionHtml,
    getReportActionMessage,
    getReportActionText,
    getSortedReportActions,
    isActionableTrackExpense,
    isActionOfType,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport} from '@libs/ReportUtils';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction, buildTransactionThread, createDraftTransactionAndNavigateToParticipantSelector, isIOUReport} from '@libs/ReportUtils';
import {buildOptimisticTransaction, getValidWaypoints, isDistanceRequest as isDistanceRequestUtil} from '@libs/TransactionUtils';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OriginalMessageIOU, PersonalDetailsList, Policy, PolicyTagLists, Report, ReportNameValuePairs, SearchResults} from '@src/types/onyx';
import type {Accountant, Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Participant, ReportCollectionDataSet} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions, ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SafeString from '@src/utils/SafeString';
import {changeTransactionsReport} from '../../src/libs/actions/Transaction';
import type {InvoiceTestData} from '../data/Invoice';
import * as InvoiceData from '../data/Invoice';
import currencyList from '../unit/currencyList.json';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import createRandomPolicyTags from '../utils/collections/policyTags';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import PusherHelper from '../utils/PusherHelper';
import type {MockFetch} from '../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData, setPersonalDetails, signInWithTestUser, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

const unapprovedCashHash = 71801560;
const unapprovedCashSimilarSearchHash = 1832274510;
jest.mock('@src/libs/SearchQueryUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const CARLOS_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};
const JULES_EMAIL = 'jules@expensifail.com';
const JULES_ACCOUNT_ID = 2;
const JULES_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const RORY_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'admin'};
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;
const VIT_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};

OnyxUpdateManager();
describe('actions/IOU', () => {
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

    let mockFetch: MockFetch;
    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('shouldOptimisticallyUpdateSearch', () => {
        it('when the current hash is submit action query it should only return true if the iou report is in draft state', () => {
            const transaction = {
                ...createRandomTransaction(1),
            };
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                status: '' as SearchStatus,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                filters: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                    left: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION,
                        right: 'submit',
                    },
                    right: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: 'from',
                        right: '20671314',
                    },
                },
                inputQuery: 'sortBy:date sortOrder:desc type:expense-report action:submit from:20671314',
                flatFilters: [
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: 'submit',
                            },
                        ],
                    },
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: '20671314',
                            },
                        ],
                    },
                ],
                hash: 1920151829,
                recentSearchHash: 2100977843,
                similarSearchHash: 1855682507,
            } as SearchQueryJSON;
            const iouReport: Report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

            // When the report is in draft status it should return true
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, transaction)).toBeTruthy();

            // If the report is not in draft state it should return false
            iouReport.stateNum = CONST.REPORT.STATE_NUM.SUBMITTED;
            iouReport.statusNum = CONST.REPORT.STATUS_NUM.SUBMITTED;
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, transaction)).toBeFalsy();
        });

        it('when the current hash is approve action query it should only return true if the iou report is in outstanding state', () => {
            const transaction = {
                ...createRandomTransaction(1),
            };
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                status: '' as SearchStatus,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                filters: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                    left: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION,
                        right: 'approve',
                    },
                    right: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: 'from',
                        right: '20671314',
                    },
                },
                flatFilters: [
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: 'approve',
                            },
                        ],
                    },
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: '20671314',
                            },
                        ],
                    },
                ],

                hash: 1510971479,
                inputQuery: 'sortBy:date sortOrder:desc type:expense-report action:approve to:20671314',
                recentSearchHash: 967911777,
                similarSearchHash: 1539858783,
            } as SearchQueryJSON;
            const iouReport: Report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

            // When the report is in draft status it should return false
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, transaction)).toBeFalsy();

            // If the report is in outstanding state it should return true
            iouReport.stateNum = CONST.REPORT.STATE_NUM.SUBMITTED;
            iouReport.statusNum = CONST.REPORT.STATUS_NUM.SUBMITTED;
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, transaction)).toBeTruthy();
        });

        it('when the current hash is unapproved cash action query it should only return true if the iou report is in either draft or outstanding state', () => {
            const transaction = {
                ...createRandomTransaction(1),
                reimbursable: true,
            };
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                status: '' as SearchStatus,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                filters: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                    left: 'reimbursable',

                    right: 'yes',
                },
                flatFilters: [
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: 'yes',
                            },
                        ],
                    },
                ],
                hash: 71801560,
                inputQuery: 'sortBy:date sortOrder:desc type:expense groupBy:from status:drafts,outstanding reimbursable:yes',
                recentSearchHash: 1043581824,
                similarSearchHash: 1832274510,
            } as SearchQueryJSON;

            const iouReport: Report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

            // When the report is in draft status it should return true
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, transaction)).toBeTruthy();

            // If the report is in approved state it should return false
            iouReport.stateNum = CONST.REPORT.STATE_NUM.APPROVED;
            iouReport.statusNum = CONST.REPORT.STATUS_NUM.APPROVED;
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, transaction)).toBeFalsy();
        });
    });

    describe('trackExpense', () => {
        it('category a distance expense of selfDM report', async () => {
            /*
             * This step simulates the following steps:
             *   - Go to self DM
             *   - Track a distance expense
             *   - Go to Troubleshoot > Clear cache and restart > Reset and refresh
             *   - Go to self DM
             *   - Click Categorize it (click Upgrade if there is no workspace)
             *   - Select category and submit the expense to the workspace
             */

            // Given a participant of the report
            const participant = {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID};

            // Given valid waypoints of the transaction
            const fakeWayPoints = {
                waypoint0: {
                    keyForList: '88 Kearny Street_1735023533854',
                    lat: 37.7886378,
                    lng: -122.4033442,
                    address: '88 Kearny Street, San Francisco, CA, USA',
                    name: '88 Kearny Street',
                },
                waypoint1: {
                    keyForList: 'Golden Gate Bridge Vista Point_1735023537514',
                    lat: 37.8077876,
                    lng: -122.4752007,
                    address: 'Golden Gate Bridge Vista Point, San Francisco, CA, USA',
                    name: 'Golden Gate Bridge Vista Point',
                },
            };

            // Given a selfDM report
            const selfDMReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);

            // Given a policyExpenseChat report
            const policyExpenseChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

            // Given policy categories and a policy
            const fakeCategories = createRandomPolicyCategories(3);
            const fakePolicy = createRandomPolicy(1);

            // Given a transaction with a distance request type and valid waypoints
            const fakeTransaction = {
                ...createRandomTransaction(1),
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    ...createRandomTransaction(1).comment,
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                    waypoints: fakeWayPoints,
                },
            };

            // When the transaction is saved to draft before being submitted
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${fakeTransaction.transactionID}`, fakeTransaction);
            mockFetch?.pause?.();

            // When the user submits the transaction to the selfDM report
            trackExpense({
                report: selfDMReport,
                isDraftPolicy: true,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: participant.login,
                    payeeAccountID: participant.accountID,
                    participant,
                },
                transactionParams: {
                    amount: fakeTransaction.amount,
                    currency: fakeTransaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: fakeTransaction.merchant,
                    billable: false,
                    validWaypoints: fakeWayPoints,
                    actionableWhisperReportActionID: fakeTransaction?.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: fakeTransaction?.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: fakeTransaction?.linkedTrackedExpenseReportID,
                    customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();
            await mockFetch?.resume?.();

            // Given transaction after tracked expense
            const transaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const trackedExpenseTransaction = Object.values(transactions ?? {}).at(0);

                        // Then the transaction must remain a distance request
                        const isDistanceRequest = isDistanceRequestUtil(trackedExpenseTransaction);
                        expect(isDistanceRequest).toBe(true);
                        resolve(trackedExpenseTransaction);
                    },
                });
            });

            // Given all report actions of the selfDM report
            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        resolve(reportActions);
                    },
                });
            });

            // Then the selfDM report should have an actionable track expense whisper action and an IOU action
            const selfDMReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`];
            expect(Object.values(selfDMReportActions ?? {}).length).toBe(2);

            // When the cache is cleared before categorizing the tracked expense
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, {
                iouRequestType: null,
            });

            // When the transaction is saved to draft by selecting a category in the selfDM report
            const reportActionableTrackExpense = Object.values(selfDMReportActions ?? {}).find((reportAction) => isActionableTrackExpense(reportAction));
            createDraftTransactionAndNavigateToParticipantSelector(
                transaction?.transactionID,
                selfDMReport.reportID,
                CONST.IOU.ACTION.CATEGORIZE,
                reportActionableTrackExpense?.reportActionID,
                {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
            );
            await waitForBatchedUpdates();

            // Then the transaction draft should be saved successfully
            const allTransactionsDraft = await new Promise<OnyxCollection<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                    waitForCollectionCallback: true,
                    callback: (transactionDrafts) => {
                        Onyx.disconnect(connection);
                        resolve(transactionDrafts);
                    },
                });
            });
            const transactionDraft = allTransactionsDraft?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`];

            // When the user confirms the category for the tracked expense
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.CATEGORIZE,
                participantParams: {
                    payeeEmail: participant.login,
                    payeeAccountID: participant.accountID,
                    participant: {...participant, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy: fakePolicy,
                    policyCategories: fakeCategories,
                },
                transactionParams: {
                    amount: transactionDraft?.amount ?? fakeTransaction.amount,
                    currency: transactionDraft?.currency ?? fakeTransaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transactionDraft?.merchant ?? fakeTransaction.merchant,
                    category: Object.keys(fakeCategories).at(0) ?? '',
                    validWaypoints: Object.keys(transactionDraft?.comment?.waypoints ?? {}).length ? getValidWaypoints(transactionDraft?.comment?.waypoints, true) : undefined,
                    actionableWhisperReportActionID: transactionDraft?.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: transactionDraft?.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: transactionDraft?.linkedTrackedExpenseReportID,
                    customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();
            await mockFetch?.resume?.();

            // Then the expense should be categorized successfully
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const categorizedTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`];

                        // Then the transaction must remain a distance request, ensuring that the optimistic data is correctly built and the transaction type remains accurate.
                        const isDistanceRequest = isDistanceRequestUtil(categorizedTransaction);
                        expect(isDistanceRequest).toBe(true);

                        // Then the transaction category must match the original category
                        expect(categorizedTransaction?.category).toBe(Object.keys(fakeCategories).at(0) ?? '');
                        resolve();
                    },
                });
            });

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                    callback: (quickAction) => {
                        Onyx.disconnect(connection);
                        resolve();

                        // Then the quickAction.action should be set to REQUEST_DISTANCE
                        expect(quickAction?.action).toBe(CONST.QUICK_ACTIONS.REQUEST_DISTANCE);
                        // Then the quickAction.chatReportID should be set to the given policyExpenseChat reportID
                        expect(quickAction?.chatReportID).toBe(policyExpenseChat.reportID);
                    },
                });
            });
        });

        it('share with accountant', async () => {
            const accountant: Required<Accountant> = {login: VIT_EMAIL, accountID: VIT_ACCOUNT_ID};
            const policy: Policy = {...createRandomPolicy(1), id: 'ABC'};
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };
            const policyExpenseChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: '123',
                policyID: policy.id,
                type: CONST.REPORT.TYPE.CHAT,
                isOwnPolicyExpenseChat: true,
            };
            const transaction: Transaction = {...createRandomTransaction(1), transactionID: '555'};

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, transaction);

            // Create a tracked expense
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
                    amount: transaction.amount,
                    currency: transaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transaction.merchant,
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();

            const selfDMReportActionsOnyx = await new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            expect(Object.values(selfDMReportActionsOnyx ?? {}).length).toBe(2);

            const linkedTrackedExpenseReportAction = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isMoneyRequestAction(reportAction));
            const reportActionableTrackExpense = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isActionableTrackExpense(reportAction));

            mockFetch?.pause?.();

            // Share the tracked expense with an accountant
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: policyExpenseChat.reportID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                },
                transactionParams: {
                    amount: transaction.amount,
                    currency: transaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transaction.merchant,
                    billable: false,
                    actionableWhisperReportActionID: reportActionableTrackExpense?.reportActionID,
                    linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: selfDMReport.reportID,
                },
                accountantParams: {
                    accountant,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();

            const policyExpenseChatOnyx = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            const policyOnyx = await new Promise<OnyxEntry<Policy>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            await mockFetch?.resume?.();

            // Accountant should be invited to the expense report
            expect(policyExpenseChatOnyx?.participants?.[accountant.accountID]).toBeTruthy();

            // Accountant should be added to the workspace as an admin
            expect(policyOnyx?.employeeList?.[accountant.login].role).toBe(CONST.POLICY.ROLE.ADMIN);
        });

        it('share with accountant who is already a member', async () => {
            const accountant: Required<Accountant> = {login: VIT_EMAIL, accountID: VIT_ACCOUNT_ID};
            const policy: Policy = {...createRandomPolicy(1), id: 'ABC', employeeList: {[accountant.login]: {email: accountant.login, role: CONST.POLICY.ROLE.USER}}};
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };
            const policyExpenseChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: '123',
                policyID: policy.id,
                type: CONST.REPORT.TYPE.CHAT,
                isOwnPolicyExpenseChat: true,
                participants: {[accountant.accountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            };
            const transaction: Transaction = {...createRandomTransaction(1), transactionID: '555'};

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, transaction);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountant.accountID]: accountant});

            // Create a tracked expense
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
                    amount: transaction.amount,
                    currency: transaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transaction.merchant,
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();

            const selfDMReportActionsOnyx = await new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            expect(Object.values(selfDMReportActionsOnyx ?? {}).length).toBe(2);

            const linkedTrackedExpenseReportAction = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isMoneyRequestAction(reportAction));
            const reportActionableTrackExpense = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isActionableTrackExpense(reportAction));

            mockFetch?.pause?.();

            // Share the tracked expense with an accountant
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: policyExpenseChat.reportID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                },
                transactionParams: {
                    amount: transaction.amount,
                    currency: transaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transaction.merchant,
                    billable: false,
                    actionableWhisperReportActionID: reportActionableTrackExpense?.reportActionID,
                    linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: selfDMReport.reportID,
                },
                accountantParams: {
                    accountant,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();

            const policyExpenseChatOnyx = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            const policyOnyx = await new Promise<OnyxEntry<Policy>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            await mockFetch?.resume?.();

            // Accountant should be still a participant in the expense report
            expect(policyExpenseChatOnyx?.participants?.[accountant.accountID]).toBeTruthy();

            // Accountant role should change to admin
            expect(policyOnyx?.employeeList?.[accountant.login].role).toBe(CONST.POLICY.ROLE.ADMIN);
        });
    });

    describe('requestMoney', () => {
        it('creates new chat if needed', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const merchant = 'KFC';
            let iouReportID: string | undefined;
            let createdAction: OnyxEntry<ReportAction>;
            let iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let transactionID: string | undefined;
            let transactionThread: OnyxEntry<Report>;
            let transactionThreadCreatedAction: OnyxEntry<ReportAction>;
            mockFetch?.pause?.();
            requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant,
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
            });
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // A chat report, a transaction thread, and an iou report should be created
                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                    const iouReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    expect(Object.keys(chatReports).length).toBe(2);
                                    expect(Object.keys(iouReports).length).toBe(1);
                                    const chatReport = chatReports.at(0);
                                    const transactionThreadReport = chatReports.at(1);
                                    const iouReport = iouReports.at(0);
                                    iouReportID = iouReport?.reportID;
                                    transactionThread = transactionThreadReport;

                                    expect(iouReport?.participants).toEqual({
                                        [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                        [CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                    });

                                    // They should be linked together
                                    expect(chatReport?.participants).toEqual({[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT});
                                    expect(chatReport?.iouReportID).toBe(iouReport?.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReportID}`,
                                callback: (iouReportMetadata) => {
                                    Onyx.disconnect(connection);

                                    expect(iouReportMetadata?.isOptimisticReport).toBe(true);
                                    expect(iouReportMetadata?.hasOnceLoadedReportActions).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);

                                    // The IOU report should have a CREATED action and IOU action
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                    const createdActions = Object.values(reportActionsForIOUReport ?? {}).filter(
                                        (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    const iouActions = Object.values(reportActionsForIOUReport ?? {}).filter(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => isMoneyRequestAction(reportAction),
                                    );
                                    expect(Object.values(createdActions).length).toBe(1);
                                    expect(Object.values(iouActions).length).toBe(1);
                                    createdAction = createdActions?.at(0);
                                    iouAction = iouActions?.at(0);
                                    const originalMessage = isMoneyRequestAction(iouAction) ? getOriginalMessage(iouAction) : undefined;

                                    // The CREATED action should not be created after the IOU action
                                    expect(Date.parse(createdAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                    // The IOUReportID should be correct
                                    expect(originalMessage?.IOUReportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(originalMessage?.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(originalMessage?.amount).toBe(amount);

                                    // The IOU type should be correct
                                    expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // Both actions should be pending
                                    expect(createdAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForTransactionThread) => {
                                    Onyx.disconnect(connection);

                                    // The transaction thread should have a CREATED action
                                    expect(Object.values(reportActionsForTransactionThread ?? {}).length).toBe(1);
                                    const createdActions = Object.values(reportActionsForTransactionThread ?? {}).filter(
                                        (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    expect(Object.values(createdActions).length).toBe(1);
                                    transactionThreadCreatedAction = createdActions.at(0);

                                    expect(transactionThreadCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    // There should be one transaction
                                    expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                    const transaction = Object.values(allTransactions ?? []).find((t) => !isEmptyObject(t));
                                    transactionID = transaction?.transactionID;

                                    // The transaction should be attached to the IOU report
                                    expect(transaction?.reportID).toBe(iouReportID);

                                    // Its amount should match the amount of the expense
                                    expect(transaction?.amount).toBe(amount);

                                    // The comment should be correct
                                    expect(transaction?.comment?.comment).toBe(comment);

                                    // It should be pending
                                    expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(iouAction && getOriginalMessage(iouAction)?.IOUTransactionID).toBe(transactionID);

                                    expect(transaction?.merchant).toBe(merchant);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.SNAPSHOT,
                                waitForCollectionCallback: true,
                                callback: (snapshotData) => {
                                    Onyx.disconnect(connection);

                                    // Snapshot data shouldn't be updated optimistically for requestMoney when the current search query type is invoice.
                                    expect(snapshotData).toBeUndefined();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                    for (const reportAction of Object.values(reportActionsForIOUReport ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                waitForCollectionCallback: false,
                                callback: (transaction) => {
                                    Onyx.disconnect(connection);
                                    expect(transaction?.pendingAction).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('updates existing chat report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport: Report = {
                reportID: '1234',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const createdAction: ReportAction = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            let iouReportID: string | undefined;
            let iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let iouCreatedAction: OnyxEntry<ReportAction>;
            let transactionID: string | undefined;
            mockFetch?.pause?.();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport)
                .then(() =>
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                        [createdAction.reportActionID]: createdAction,
                    }),
                )
                .then(() => {
                    requestMoney({
                        report: chatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: '',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // The same chat report should be reused, a transaction thread and an IOU report should be created
                                    expect(Object.values(allReports ?? {}).length).toBe(3);
                                    expect(Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT)?.reportID).toBe(chatReport.reportID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT) ?? chatReport;
                                    const iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    iouReportID = iouReport?.reportID;

                                    expect(iouReport?.participants).toEqual({
                                        [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                        [CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                    });

                                    // They should be linked together
                                    expect(chatReport.iouReportID).toBe(iouReportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (allIOUReportActions) => {
                                    Onyx.disconnect(connection);

                                    iouCreatedAction = Object.values(allIOUReportActions ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                    iouAction = Object.values(allIOUReportActions ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                        isMoneyRequestAction(reportAction),
                                    );
                                    const originalMessage = iouAction ? getOriginalMessage(iouAction) : null;

                                    // The CREATED action should not be created after the IOU action
                                    expect(Date.parse(iouCreatedAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                    // The IOUReportID should be correct
                                    expect(originalMessage?.IOUReportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(originalMessage?.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(originalMessage?.amount).toBe(amount);

                                    // The IOU action type should be correct
                                    expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // The IOU action should be pending
                                    expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    // There should be one transaction
                                    expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                    const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                    transactionID = transaction?.transactionID;
                                    const originalMessage = iouAction ? getOriginalMessage(iouAction) : null;

                                    // The transaction should be attached to the IOU report
                                    expect(transaction?.reportID).toBe(iouReportID);

                                    // Its amount should match the amount of the expense
                                    expect(transaction?.amount).toBe(amount);

                                    // The comment should be correct
                                    expect(transaction?.comment?.comment).toBe(comment);

                                    expect(transaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);

                                    // It should be pending
                                    expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(originalMessage?.IOUTransactionID).toBe(transactionID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                    for (const reportAction of Object.values(reportActionsForIOUReport ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                callback: (transaction) => {
                                    Onyx.disconnect(connection);
                                    expect(transaction?.pendingAction).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('updates existing IOU report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const chatReportID = '1234';
            const iouReportID = '5678';
            let chatReport: OnyxEntry<Report> = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const createdAction: ReportAction = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            const existingTransaction: Transaction = {
                transactionID: rand64(),
                amount: 1000,
                comment: {
                    comment: 'Existing transaction',
                    attendees: [{email: 'text@expensify.com', displayName: 'Test User', avatarUrl: ''}],
                },
                created: DateUtils.getDBTime(),
                currency: CONST.CURRENCY.USD,
                merchant: '',
                reportID: '',
            };
            let iouReport: OnyxEntry<Report> = {
                reportID: iouReportID,
                chatReportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: CARLOS_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: existingTransaction.amount,
            };
            const iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: RORY_ACCOUNT_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: iouReportID,
                    IOUTransactionID: existingTransaction.transactionID,
                    amount: existingTransaction.amount,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participantAccountIDs: [RORY_ACCOUNT_ID, CARLOS_ACCOUNT_ID],
                },
            };
            let newIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let newTransaction: OnyxEntry<Transaction>;
            mockFetch?.pause?.();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport)
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport ?? null))
                .then(() =>
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
                        [createdAction.reportActionID]: createdAction,
                        [iouAction.reportActionID]: iouAction,
                    }),
                )
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransaction.transactionID}`, existingTransaction))
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant: '',
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            transactionViolations: {},
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // No new reports should be created
                                    expect(Object.values(allReports ?? {}).length).toBe(3);
                                    expect(Object.values(allReports ?? {}).find((report) => report?.reportID === chatReportID)).toBeTruthy();
                                    expect(Object.values(allReports ?? {}).find((report) => report?.reportID === iouReportID)).toBeTruthy();

                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);

                                    // The total on the iou report should be updated
                                    expect(iouReport?.total).toBe(11000);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);
                                    newIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            reportAction?.reportActionID !== createdAction.reportActionID && reportAction?.reportActionID !== iouAction?.reportActionID,
                                    );

                                    const newOriginalMessage = newIOUAction ? getOriginalMessage(newIOUAction) : null;

                                    // The IOUReportID should be correct
                                    expect(getOriginalMessage(iouAction)?.IOUReportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(newOriginalMessage?.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(newOriginalMessage?.amount).toBe(amount);

                                    // The type of the IOU action should be correct
                                    expect(newOriginalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // The IOU action should be pending
                                    expect(newIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    // There should be two transactions
                                    expect(Object.values(allTransactions ?? {}).length).toBe(2);

                                    newTransaction = Object.values(allTransactions ?? {}).find((transaction) => transaction?.transactionID !== existingTransaction.transactionID);

                                    expect(newTransaction?.reportID).toBe(iouReportID);
                                    expect(newTransaction?.amount).toBe(amount);
                                    expect(newTransaction?.comment?.comment).toBe(comment);
                                    expect(newTransaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
                                    expect(newTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(isMoneyRequestAction(newIOUAction) ? getOriginalMessage(newIOUAction)?.IOUTransactionID : undefined).toBe(newTransaction?.transactionID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForNetworkPromises)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);
                                    for (const reportAction of Object.values(reportActionsForIOUReport ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);
                                    for (const transaction of Object.values(allTransactions ?? {})) {
                                        expect(transaction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('correctly implements RedBrickRoad error handling', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReportID: string | undefined;
            let iouReportID: string | undefined;
            let createdAction: OnyxEntry<ReportAction>;
            let iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let transactionID: string | undefined;
            let transactionThreadReport: OnyxEntry<Report>;
            let transactionThreadAction: OnyxEntry<ReportAction>;
            mockFetch?.pause?.();
            requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
            });
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connection);

                                        // A chat report, transaction thread and an iou report should be created
                                        const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                        const iouReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                        expect(Object.values(chatReports).length).toBe(2);
                                        expect(Object.values(iouReports).length).toBe(1);
                                        const chatReport = chatReports.at(0);
                                        chatReportID = chatReport?.reportID;
                                        transactionThreadReport = chatReports.at(1);

                                        const iouReport = iouReports.at(0);
                                        iouReportID = iouReport?.reportID;

                                        expect(chatReport?.participants).toStrictEqual({[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT});

                                        // They should be linked together
                                        expect(chatReport?.participants).toStrictEqual({[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT});
                                        expect(chatReport?.iouReportID).toBe(iouReport?.reportID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connection);

                                        // The chat report should have a CREATED action and IOU action
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        const createdActions =
                                            Object.values(reportActionsForIOUReport ?? {}).filter((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? null;
                                        const iouActions =
                                            Object.values(reportActionsForIOUReport ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                                isMoneyRequestAction(reportAction),
                                            ) ?? null;
                                        expect(Object.values(createdActions).length).toBe(1);
                                        expect(Object.values(iouActions).length).toBe(1);
                                        createdAction = createdActions.at(0);
                                        iouAction = iouActions.at(0);
                                        const originalMessage = getOriginalMessage(iouAction);

                                        // The CREATED action should not be created after the IOU action
                                        expect(Date.parse(createdAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                        // The IOUReportID should be correct
                                        expect(originalMessage?.IOUReportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(originalMessage?.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(originalMessage?.amount).toBe(amount);

                                        // The type should be correct
                                        expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                        // Both actions should be pending
                                        expect(createdAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connection);

                                        // There should be one transaction
                                        expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                        const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                        transactionID = transaction?.transactionID;

                                        expect(transaction?.reportID).toBe(iouReportID);
                                        expect(transaction?.amount).toBe(amount);
                                        expect(transaction?.comment?.comment).toBe(comment);
                                        expect(transaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect(iouAction && getOriginalMessage(iouAction)?.IOUTransactionID).toBe(transactionID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then((): Promise<unknown> => {
                        mockFetch?.fail?.();
                        return mockFetch?.resume?.() as Promise<unknown>;
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connection);
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        iouAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            isMoneyRequestAction(reportAction),
                                        );
                                        expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (reportActionsForTransactionThread) => {
                                        Onyx.disconnect(connection);
                                        expect(Object.values(reportActionsForTransactionThread ?? {}).length).toBe(3);
                                        transactionThreadAction = Object.values(
                                            reportActionsForTransactionThread?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`] ?? {},
                                        ).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                        expect(transactionThreadAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connection);
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(transaction?.errors).toBeTruthy();
                                        expect(Object.values(transaction?.errors ?? {}).at(0)).toEqual(translateLocal('iou.error.genericCreateFailureMessage'));
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // If the user clears the errors on the IOU action
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                if (iouReportID) {
                                    clearAllRelatedReportActionErrors(iouReportID, iouAction ?? null);
                                }
                                resolve();
                            }),
                    )

                    // Then the reportAction from chat report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connection);
                                        iouAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            isMoneyRequestAction(reportAction),
                                        );
                                        expect(iouAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Then the reportAction from iou report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connection);
                                        iouAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            isMoneyRequestAction(reportAction),
                                        );
                                        expect(iouAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Then the reportAction from transaction report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connection);
                                        expect(reportActionsForReport).toMatchObject({});
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Along with the associated transaction
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connection);
                                        expect(transaction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // If a user clears the errors on the CREATED action (which, technically are just errors on the report)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                if (chatReportID) {
                                    deleteReport(chatReportID);
                                }
                                if (transactionThreadReport?.reportID) {
                                    deleteReport(transactionThreadReport?.reportID);
                                }
                                resolve();
                            }),
                    )

                    // Then the report should be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connection);
                                        for (const report of Object.values(allReports ?? {})) {
                                            expect(report).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All reportActions should also be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: false,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connection);
                                        for (const reportAction of Object.values(allReportActions ?? {})) {
                                            expect(reportAction).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All transactions should also be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connection);
                                        for (const transaction of Object.values(allTransactions ?? {})) {
                                            expect(transaction).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Cleanup
                    .then(mockFetch?.succeed)
            );
        });

        it('correctly implements RedBrickRoad error handling for ShareTrackedExpense when inviting new user to workspace', async () => {
            const amount = 5000;
            const comment = 'Shared tracked expense test';

            // Setup test data - create a self DM report and policy expense chat
            const selfDMReport: Report = {
                reportID: '1',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
            };

            const policy: Policy = {
                id: 'policy123',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: RORY_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                employeeList: {
                    [CARLOS_EMAIL]: {
                        role: CONST.POLICY.ROLE.ADMIN,
                    },
                },
            };

            const policyExpenseChat: Report = {
                reportID: '2',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: policy.id,
                participants: {
                    [RORY_ACCOUNT_ID]: RORY_PARTICIPANT,
                    [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT,
                },
            };

            // New accountant that is NOT in the workspace employee list (this will trigger the invitation)
            const accountant = {
                accountID: 999,
                login: 'newaccountant@test.com',
                email: 'newaccountant@test.com',
            };

            mockFetch?.pause?.();

            // Setup initial data
            await Promise.all([
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport),
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat),
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy),
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountant.accountID]: accountant}),
            ]);
            await waitForBatchedUpdates();

            // First create a tracked expense in self DM
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
                    merchant: 'Test Merchant',
                    comment,
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
            });

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Capture the created tracked expense data
            let selfDMReportID: string | undefined;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (reports) => {
                    const selfDMReportOnyx = Object.values(reports ?? {}).find((report) => report?.reportID === selfDMReport.reportID);
                    selfDMReportID = selfDMReportOnyx?.reportID;
                },
            });

            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`);
            const actions = Object.values(reportActions ?? {});
            const linkedTrackedExpenseReportAction = actions.find((action) => action && isMoneyRequestAction(action));
            const actionableWhisperReportActionID = actions.find((action) => action && isActionableTrackExpense(action))?.reportActionID;

            let linkedTrackedExpenseReportID: string | undefined;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                    linkedTrackedExpenseReportID = transaction?.reportID;
                },
            });

            // Now pause fetch and share the tracked expense with accountant
            mockFetch?.pause?.();
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: policyExpenseChat.reportID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                },
                transactionParams: {
                    amount,
                    currency: CONST.CURRENCY.USD,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Test Merchant',
                    comment,
                    billable: false,
                    actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID,
                },
                accountantParams: {
                    accountant,
                },
                isASAPSubmitBetaEnabled: false,
            });
            await waitForBatchedUpdates();

            // Simulate network failure
            mockFetch?.fail?.();
            await (mockFetch?.resume?.() as Promise<unknown>);

            // Verify error handling after failure - focus on workspace invitation error
            const policyData = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);

            // The new accountant should have been added to the employee list with error
            const accountantEmployee = policyData?.employeeList?.[accountant.email];
            expect(accountantEmployee).toBeTruthy();
            expect(accountantEmployee?.errors).toBeTruthy();
            expect(Object.values(accountantEmployee?.errors ?? {}).at(0)).toEqual(translateLocal('workspace.people.error.genericAdd'));

            // Cleanup
            mockFetch?.succeed?.();
        });

        it('does not trigger notifyNewAction when doing the money request in a money request report', () => {
            requestMoney({
                report: {reportID: '123', type: CONST.REPORT.TYPE.EXPENSE},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 1,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
            });
            expect(notifyNewAction).toHaveBeenCalledTimes(0);
        });

        it('trigger notifyNewAction when doing the money request in a chat report', () => {
            requestMoney({
                report: {reportID: '123'},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 1,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
            });
            expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
        });

        it('increase the nonReimbursableTotal only when the expense is not reimbursable', async () => {
            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                nonReimbursableTotal: 0,
                total: 0,
                ownerAccountID: RORY_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
            };
            const workspaceChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: expenseReport.reportID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`, workspaceChat);

            requestMoney({
                report: expenseReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: workspaceChat.reportID, isPolicyExpenseChat: true},
                },
                transactionParams: {
                    amount: 100,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    reimbursable: true,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
            });

            await waitForBatchedUpdates();

            const nonReimbursableTotal = await new Promise<number>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report?.nonReimbursableTotal ?? 0);
                    },
                });
            });

            expect(nonReimbursableTotal).toBe(0);

            requestMoney({
                report: expenseReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: workspaceChat.reportID, isPolicyExpenseChat: true},
                },
                transactionParams: {
                    amount: 100,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    reimbursable: false,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
            });

            await waitForBatchedUpdates();

            const newNonReimbursableTotal = await new Promise<number>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report?.nonReimbursableTotal ?? 0);
                    },
                });
            });

            expect(newNonReimbursableTotal).toBe(-100);
        });
    });

    describe('createDistanceRequest', () => {
        it('does not trigger notifyNewAction when doing the money request in a money request report', () => {
            createDistanceRequest({
                report: {reportID: '123', type: CONST.REPORT.TYPE.EXPENSE},
                participants: [],
                transactionParams: {
                    amount: 1,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    validWaypoints: {},
                },
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });
            expect(notifyNewAction).toHaveBeenCalledTimes(0);
        });

        it('trigger notifyNewAction when doing the money request in a chat report', () => {
            createDistanceRequest({
                report: {reportID: '123'},
                participants: [],
                transactionParams: {
                    amount: 1,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    validWaypoints: {},
                },
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });
            expect(notifyNewAction).toHaveBeenCalledTimes(1);
        });
    });

    describe('split expense', () => {
        it('creates and updates new chats and IOUs as needed', () => {
            jest.setTimeout(10 * 1000);
            /*
             * Given that:
             *   - Rory and Carlos have chatted before
             *   - Rory and Jules have chatted before and have an active IOU report
             *   - Rory and Vit have never chatted together before
             *   - There is no existing group chat with the four of them
             */
            const amount = 400;
            const comment = 'Yes, I am splitting a bill for $4 USD';
            const merchant = 'Yema Kitchen';
            let carlosChatReport: OnyxEntry<Report> = {
                reportID: rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const carlosCreatedAction: OnyxEntry<ReportAction> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
                reportID: carlosChatReport.reportID,
            };
            const julesIOUReportID = rand64();
            let julesChatReport: OnyxEntry<Report> = {
                reportID: rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: julesIOUReportID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [JULES_ACCOUNT_ID]: JULES_PARTICIPANT},
            };
            const julesChatCreatedAction: OnyxEntry<ReportAction> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
                reportID: julesChatReport.reportID,
            };
            const julesCreatedAction: OnyxEntry<ReportAction> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
                reportID: julesIOUReportID,
            };
            jest.advanceTimersByTime(200);
            const julesExistingTransaction: OnyxEntry<Transaction> = {
                transactionID: rand64(),
                amount: 1000,
                comment: {
                    comment: 'This is an existing transaction',
                    attendees: [{email: 'text@expensify.com', displayName: 'Test User', avatarUrl: ''}],
                },
                created: DateUtils.getDBTime(),
                currency: '',
                merchant: '',
                reportID: '',
            };
            let julesIOUReport: OnyxEntry<Report> = {
                reportID: julesIOUReportID,
                chatReportID: julesChatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: JULES_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: julesExistingTransaction?.amount,
            };
            const julesExistingIOUAction: OnyxEntry<ReportAction> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: RORY_ACCOUNT_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: julesIOUReportID,
                    IOUTransactionID: julesExistingTransaction?.transactionID,
                    amount: julesExistingTransaction?.amount ?? 0,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participantAccountIDs: [RORY_ACCOUNT_ID, JULES_ACCOUNT_ID],
                },
                reportID: julesIOUReportID,
            };

            let carlosIOUReport: OnyxEntry<Report>;
            let carlosIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let carlosIOUCreatedAction: OnyxEntry<ReportAction>;
            let carlosTransaction: OnyxEntry<Transaction>;

            let julesIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let julesIOUCreatedAction: OnyxEntry<ReportAction>;
            let julesTransaction: OnyxEntry<Transaction>;

            let vitChatReport: OnyxEntry<Report>;
            let vitIOUReport: OnyxEntry<Report>;
            let vitCreatedAction: OnyxEntry<ReportAction>;
            let vitIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let vitTransaction: OnyxEntry<Transaction>;

            let groupChat: OnyxEntry<Report>;
            let groupCreatedAction: OnyxEntry<ReportAction>;
            let groupIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let groupTransaction: OnyxEntry<Transaction>;

            const reportCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, [carlosChatReport, julesChatReport, julesIOUReport], (item) => item.reportID);

            const carlosActionsCollectionDataSet = toCollectionDataSet(
                `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`,
                [
                    {
                        [carlosCreatedAction.reportActionID]: carlosCreatedAction,
                    },
                ],
                (item) => item[carlosCreatedAction.reportActionID].reportID,
            );

            const julesActionsCollectionDataSet = toCollectionDataSet(
                `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`,
                [
                    {
                        [julesCreatedAction.reportActionID]: julesCreatedAction,
                        [julesExistingIOUAction.reportActionID]: julesExistingIOUAction,
                    },
                ],
                (item) => item[julesCreatedAction.reportActionID].reportID,
            );

            const julesCreatedActionsCollectionDataSet = toCollectionDataSet(
                `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`,
                [
                    {
                        [julesChatCreatedAction.reportActionID]: julesChatCreatedAction,
                    },
                ],
                (item) => item[julesChatCreatedAction.reportActionID].reportID,
            );

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                ...reportCollectionDataSet,
            })
                .then(() =>
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
                        ...carlosActionsCollectionDataSet,
                        ...julesCreatedActionsCollectionDataSet,
                        ...julesActionsCollectionDataSet,
                    }),
                )
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction?.transactionID}`, julesExistingTransaction))
                .then(() => {
                    // When we split a bill offline
                    mockFetch?.pause?.();
                    splitBill(
                        // TODO: Migrate after the backend accepts accountIDs
                        {
                            participants: [
                                [CARLOS_EMAIL, String(CARLOS_ACCOUNT_ID)],
                                [JULES_EMAIL, String(JULES_ACCOUNT_ID)],
                                [VIT_EMAIL, String(VIT_ACCOUNT_ID)],
                            ].map(([email, accountID]) => ({login: email, accountID: Number(accountID)})),
                            currentUserLogin: RORY_EMAIL,
                            currentUserAccountID: RORY_ACCOUNT_ID,
                            amount,
                            comment,
                            currency: CONST.CURRENCY.USD,
                            merchant,
                            created: '',
                            tag: '',
                            existingSplitChatReportID: '',
                            isASAPSubmitBetaEnabled: false,
                            transactionViolations: {},
                        },
                    );
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // There should now be 10 reports
                                    expect(Object.values(allReports ?? {}).length).toBe(10);

                                    // 1. The chat report with Rory + Carlos
                                    carlosChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === carlosChatReport?.reportID);
                                    expect(isEmptyObject(carlosChatReport)).toBe(false);
                                    expect(carlosChatReport?.pendingFields).toBeFalsy();

                                    // 2. The IOU report with Rory + Carlos (new)
                                    carlosIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU && report.managerID === CARLOS_ACCOUNT_ID);
                                    expect(isEmptyObject(carlosIOUReport)).toBe(false);
                                    expect(carlosIOUReport?.total).toBe(amount / 4);

                                    // 3. The chat report with Rory + Jules
                                    julesChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === julesChatReport?.reportID);
                                    expect(isEmptyObject(julesChatReport)).toBe(false);
                                    expect(julesChatReport?.pendingFields).toBeFalsy();

                                    // 4. The IOU report with Rory + Jules
                                    julesIOUReport = Object.values(allReports ?? {}).find((report) => report?.reportID === julesIOUReport?.reportID);
                                    expect(isEmptyObject(julesIOUReport)).toBe(false);
                                    expect(julesChatReport?.pendingFields).toBeFalsy();
                                    expect(julesIOUReport?.total).toBe((julesExistingTransaction?.amount ?? 0) + amount / 4);

                                    // 5. The chat report with Rory + Vit (new)
                                    vitChatReport = Object.values(allReports ?? {}).find(
                                        (report) =>
                                            report?.type === CONST.REPORT.TYPE.CHAT &&
                                            deepEqual(report.participants, {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [VIT_ACCOUNT_ID]: VIT_PARTICIPANT}),
                                    );
                                    expect(isEmptyObject(vitChatReport)).toBe(false);
                                    expect(vitChatReport?.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                                    // 6. The IOU report with Rory + Vit (new)
                                    vitIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU && report.managerID === VIT_ACCOUNT_ID);
                                    expect(isEmptyObject(vitIOUReport)).toBe(false);
                                    expect(vitIOUReport?.total).toBe(amount / 4);

                                    // 7. The group chat with everyone
                                    groupChat = Object.values(allReports ?? {}).find(
                                        (report) =>
                                            report?.type === CONST.REPORT.TYPE.CHAT &&
                                            deepEqual(report.participants, {
                                                [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT,
                                                [JULES_ACCOUNT_ID]: JULES_PARTICIPANT,
                                                [VIT_ACCOUNT_ID]: VIT_PARTICIPANT,
                                                [RORY_ACCOUNT_ID]: RORY_PARTICIPANT,
                                            }),
                                    );
                                    expect(isEmptyObject(groupChat)).toBe(false);
                                    expect(groupChat?.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                                    // The 1:1 chat reports and the IOU reports should be linked together
                                    expect(carlosChatReport?.iouReportID).toBe(carlosIOUReport?.reportID);
                                    expect(carlosIOUReport?.chatReportID).toBe(carlosChatReport?.reportID);
                                    for (const participant of Object.values(carlosIOUReport?.participants ?? {})) {
                                        expect(participant.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
                                    }

                                    expect(julesChatReport?.iouReportID).toBe(julesIOUReport?.reportID);
                                    expect(julesIOUReport?.chatReportID).toBe(julesChatReport?.reportID);

                                    expect(vitChatReport?.iouReportID).toBe(vitIOUReport?.reportID);
                                    expect(vitIOUReport?.chatReportID).toBe(vitChatReport?.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    // There should be reportActions on all 7 chat reports + 3 IOU reports in each 1:1 chat
                                    expect(Object.values(allReportActions ?? {}).length).toBe(10);

                                    const carlosReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${carlosChatReport?.iouReportID}`];
                                    const julesReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesChatReport?.iouReportID}`];
                                    const vitReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${vitChatReport?.iouReportID}`];
                                    const groupReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChat?.reportID}`];

                                    // Carlos DM should have two reportActions – the existing CREATED action and a pending IOU action
                                    expect(Object.values(carlosReportActions ?? {}).length).toBe(2);
                                    carlosIOUCreatedAction = Object.values(carlosReportActions ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    carlosIOUAction = Object.values(carlosReportActions ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                        isMoneyRequestAction(reportAction),
                                    );
                                    const carlosOriginalMessage = carlosIOUAction ? getOriginalMessage(carlosIOUAction) : undefined;

                                    expect(carlosIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(carlosOriginalMessage?.IOUReportID).toBe(carlosIOUReport?.reportID);
                                    expect(carlosOriginalMessage?.amount).toBe(amount / 4);
                                    expect(carlosOriginalMessage?.comment).toBe(comment);
                                    expect(carlosOriginalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                    expect(Date.parse(carlosIOUCreatedAction?.created ?? '')).toBeLessThan(Date.parse(carlosIOUAction?.created ?? ''));

                                    // Jules DM should have three reportActions, the existing CREATED action, the existing IOU action, and a new pending IOU action
                                    expect(Object.values(julesReportActions ?? {}).length).toBe(3);
                                    expect(julesReportActions?.[julesCreatedAction.reportActionID]).toStrictEqual(julesCreatedAction);
                                    julesIOUCreatedAction = Object.values(julesReportActions ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    julesIOUAction = Object.values(julesReportActions ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            reportAction.reportActionID !== julesCreatedAction.reportActionID && reportAction.reportActionID !== julesExistingIOUAction.reportActionID,
                                    );
                                    const julesOriginalMessage = julesIOUAction ? getOriginalMessage(julesIOUAction) : undefined;

                                    expect(julesIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(julesOriginalMessage?.IOUReportID).toBe(julesIOUReport?.reportID);
                                    expect(julesOriginalMessage?.amount).toBe(amount / 4);
                                    expect(julesOriginalMessage?.comment).toBe(comment);
                                    expect(julesOriginalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                    expect(Date.parse(julesIOUCreatedAction?.created ?? '')).toBeLessThan(Date.parse(julesIOUAction?.created ?? ''));

                                    // Vit DM should have two reportActions – a pending CREATED action and a pending IOU action
                                    expect(Object.values(vitReportActions ?? {}).length).toBe(2);
                                    vitCreatedAction = Object.values(vitReportActions ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    vitIOUAction = Object.values(vitReportActions ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                        isMoneyRequestAction(reportAction),
                                    );
                                    const vitOriginalMessage = vitIOUAction ? getOriginalMessage(vitIOUAction) : undefined;

                                    expect(vitCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(vitIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(vitOriginalMessage?.IOUReportID).toBe(vitIOUReport?.reportID);
                                    expect(vitOriginalMessage?.amount).toBe(amount / 4);
                                    expect(vitOriginalMessage?.comment).toBe(comment);
                                    expect(vitOriginalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                    expect(Date.parse(vitCreatedAction?.created ?? '')).toBeLessThan(Date.parse(vitIOUAction?.created ?? ''));

                                    // Group chat should have two reportActions – a pending CREATED action and a pending IOU action w/ type SPLIT
                                    expect(Object.values(groupReportActions ?? {}).length).toBe(2);
                                    groupCreatedAction = Object.values(groupReportActions ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                    groupIOUAction = Object.values(groupReportActions ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                        isMoneyRequestAction(reportAction),
                                    );
                                    const groupOriginalMessage = groupIOUAction ? getOriginalMessage(groupIOUAction) : undefined;

                                    expect(groupCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(groupIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(groupOriginalMessage).not.toHaveProperty('IOUReportID');
                                    expect(groupOriginalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.SPLIT);
                                    expect(Date.parse(groupCreatedAction?.created ?? '')).toBeLessThanOrEqual(Date.parse(groupIOUAction?.created ?? ''));

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    /* There should be 5 transactions
                                     *   – one existing one with Jules
                                     *   - one for each of the three IOU reports
                                     *   - one on the group chat w/ deleted report
                                     */
                                    expect(Object.values(allTransactions ?? {}).length).toBe(5);
                                    expect(allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction?.transactionID}`]).toBeTruthy();

                                    carlosTransaction = Object.values(allTransactions ?? {}).find(
                                        (transaction) => carlosIOUAction && transaction?.transactionID === getOriginalMessage(carlosIOUAction)?.IOUTransactionID,
                                    );
                                    julesTransaction = Object.values(allTransactions ?? {}).find(
                                        (transaction) => julesIOUAction && transaction?.transactionID === getOriginalMessage(julesIOUAction)?.IOUTransactionID,
                                    );
                                    vitTransaction = Object.values(allTransactions ?? {}).find(
                                        (transaction) => vitIOUAction && transaction?.transactionID === getOriginalMessage(vitIOUAction)?.IOUTransactionID,
                                    );
                                    groupTransaction = Object.values(allTransactions ?? {}).find((transaction) => transaction?.reportID === CONST.REPORT.SPLIT_REPORT_ID);

                                    expect(carlosTransaction?.reportID).toBe(carlosIOUReport?.reportID);
                                    expect(julesTransaction?.reportID).toBe(julesIOUReport?.reportID);
                                    expect(vitTransaction?.reportID).toBe(vitIOUReport?.reportID);
                                    expect(groupTransaction).toBeTruthy();

                                    expect(carlosTransaction?.amount).toBe(amount / 4);
                                    expect(julesTransaction?.amount).toBe(amount / 4);
                                    expect(vitTransaction?.amount).toBe(amount / 4);
                                    expect(groupTransaction?.amount).toBe(amount);

                                    expect(carlosTransaction?.comment?.comment).toBe(comment);
                                    expect(julesTransaction?.comment?.comment).toBe(comment);
                                    expect(vitTransaction?.comment?.comment).toBe(comment);
                                    expect(groupTransaction?.comment?.comment).toBe(comment);

                                    expect(carlosTransaction?.merchant).toBe(merchant);
                                    expect(julesTransaction?.merchant).toBe(merchant);
                                    expect(vitTransaction?.merchant).toBe(merchant);
                                    expect(groupTransaction?.merchant).toBe(merchant);

                                    expect(carlosTransaction?.comment?.source).toBe(CONST.IOU.TYPE.SPLIT);
                                    expect(julesTransaction?.comment?.source).toBe(CONST.IOU.TYPE.SPLIT);
                                    expect(vitTransaction?.comment?.source).toBe(CONST.IOU.TYPE.SPLIT);

                                    expect(carlosTransaction?.comment?.originalTransactionID).toBe(groupTransaction?.transactionID);
                                    expect(julesTransaction?.comment?.originalTransactionID).toBe(groupTransaction?.transactionID);
                                    expect(vitTransaction?.comment?.originalTransactionID).toBe(groupTransaction?.transactionID);

                                    expect(carlosTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(julesTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(vitTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(groupTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                                waitForCollectionCallback: false,
                                callback: (allPersonalDetails) => {
                                    Onyx.disconnect(connection);
                                    expect(allPersonalDetails).toMatchObject({
                                        [VIT_ACCOUNT_ID]: {
                                            accountID: VIT_ACCOUNT_ID,
                                            displayName: VIT_EMAIL,
                                            login: VIT_EMAIL,
                                        },
                                    });
                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForNetworkPromises)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    for (const report of Object.values(allReports ?? {})) {
                                        if (!report?.pendingFields) {
                                            continue;
                                        }
                                        for (const pendingField of Object.values(report?.pendingFields)) {
                                            expect(pendingField).toBeFalsy();
                                        }
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);
                                    for (const reportAction of Object.values(allReportActions ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);
                                    for (const transaction of Object.values(allTransactions ?? {})) {
                                        expect(transaction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('should update split chat report lastVisibleActionCreated to the report preview action', async () => {
            // Given a expense chat with no expenses
            const workspaceReportID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {reportID: workspaceReportID, isOwnPolicyExpenseChat: true});

            // When the user split bill on the workspace
            splitBill({
                participants: [{reportID: workspaceReportID}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                comment: '',
                amount: 100,
                currency: CONST.CURRENCY.USD,
                merchant: 'test',
                created: '',
                existingSplitChatReportID: workspaceReportID,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // Then the expense chat lastVisibleActionCreated should be updated to the report preview action created
            const reportPreviewAction = await new Promise<OnyxEntry<ReportAction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceReportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        resolve(Object.values(reportActions ?? {}).find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW));
                    },
                });
            });

            await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.lastVisibleActionCreated).toBe(reportPreviewAction?.created);
                        resolve(report);
                    },
                });
            });
        });

        it('should update split chat report lastVisibleActionCreated to the latest IOU action when split bill in a DM', async () => {
            // Given a DM chat with no expenses
            const reportID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            });

            // When the user split bill twice on the DM
            splitBill({
                participants: [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                comment: '',
                amount: 100,
                currency: CONST.CURRENCY.USD,
                merchant: 'test',
                created: '',
                existingSplitChatReportID: reportID,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            splitBill({
                participants: [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                comment: '',
                amount: 200,
                currency: CONST.CURRENCY.USD,
                merchant: 'test',
                created: '',
                existingSplitChatReportID: reportID,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // Then the DM lastVisibleActionCreated should be updated to the second IOU action created
            const iouAction = await new Promise<OnyxEntry<ReportAction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        resolve(Object.values(reportActions ?? {}).find((action) => isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(action)?.amount === 200));
                    },
                });
            });

            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    callback: (reportVal) => {
                        Onyx.disconnect(connection);
                        resolve(reportVal);
                    },
                });
            });
            expect(report?.lastVisibleActionCreated).toBe(iouAction?.created);
        });

        it('optimistic transaction should be merged with the draft transaction if it is a distance request', async () => {
            // Given a workspace expense chat and a draft split transaction
            const workspaceReportID = '1';
            const transactionAmount = 100;
            const draftTransaction = {
                amount: transactionAmount,
                currency: CONST.CURRENCY.USD,
                merchant: 'test',
                created: '',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                splitShares: {
                    [workspaceReportID]: {amount: 100},
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {reportID: workspaceReportID, isOwnPolicyExpenseChat: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, draftTransaction);

            // When doing a distance split expense
            splitBill({
                participants: [{reportID: workspaceReportID}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                existingSplitChatReportID: workspaceReportID,
                ...draftTransaction,
                comment: '',
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            const optimisticTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        resolve(Object.values(transactions ?? {}).find((transaction) => transaction?.amount === -(transactionAmount / 2)));
                    },
                });
            });

            // Then the data from the transaction draft should be merged into the optimistic transaction
            expect(optimisticTransaction?.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE);
        });

        it("should update the notification preference of the report to ALWAYS if it's previously hidden", async () => {
            // Given a group chat with hidden notification preference
            const reportID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                    [CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                },
            });

            // When the user split bill on the group chat
            splitBill({
                participants: [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                comment: '',
                amount: 100,
                currency: CONST.CURRENCY.USD,
                merchant: 'test',
                created: '',
                existingSplitChatReportID: reportID,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // Then the DM notification preference should be updated to ALWAYS
            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    callback: (reportVal) => {
                        Onyx.disconnect(connection);
                        resolve(reportVal);
                    },
                });
            });
            expect(report?.participants?.[RORY_ACCOUNT_ID].notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
        });

        it('the description should not be parsed again after completing the scan split bill without changing the description', async () => {
            const reportID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            });

            // Start a scan split bill
            const {splitTransactionID} = startSplitBill({
                participants: [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                comment: '# test',
                currency: CONST.CURRENCY.USD,
                existingSplitChatReportID: reportID,
                receipt: {},
                category: undefined,
                tag: undefined,
                taxCode: '',
                taxAmount: 0,
            });

            await waitForBatchedUpdates();

            let splitTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransactionID}`);

            // Then the description should be parsed correctly
            expect(splitTransaction?.comment?.comment).toBe('<h1>test</h1>');

            const updatedSplitTransaction = splitTransaction
                ? {
                      ...splitTransaction,
                      amount: 100,
                  }
                : undefined;

            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            const iouAction = Object.values(reportActions ?? {}).find((action) => isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU));

            expect(iouAction).toBeTruthy();

            // Complete this split bill without changing the description
            completeSplitBill(reportID, iouAction, updatedSplitTransaction, RORY_ACCOUNT_ID, false, {}, RORY_EMAIL);

            await waitForBatchedUpdates();

            splitTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransactionID}`);

            // Then the description should be the same since it was not changed
            expect(splitTransaction?.comment?.comment).toBe('<h1>test</h1>');
        });
    });

    describe('updateSplitTransactionsFromSplitExpensesFlow', () => {
        it('should delete the original transaction thread report', async () => {
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const transaction: Transaction = {
                amount: 100,
                currency: 'USD',
                transactionID: '1',
                reportID: expenseReport.reportID,
                created: DateUtils.getDBTime(),
                merchant: 'test',
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
            };
            const iouAction: ReportAction = {
                ...buildOptimisticIOUReportAction({
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    comment: '',
                    participants: [],
                    transactionID: transaction.transactionID,
                    iouReportID: expenseReport.reportID,
                }),
                childReportID: transactionThread.reportID,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`, transactionThread);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [iouAction.reportActionID]: iouAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            const draftTransaction: OnyxEntry<Transaction> = {
                ...transaction,
                comment: {
                    originalTransactionID: transaction.transactionID,
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

            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
                allReportNameValuePairsList: allReportNameValuePairs,
                transactionData: {
                    reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                    originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                    splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                    splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                },
                hash: 1,
                policyCategories: undefined,
                policy: undefined,
                policyRecentlyUsedCategories: [],
                iouReport: expenseReport,
                firstIOU: iouAction,
                isASAPSubmitBetaEnabled: false,
                currentUserPersonalDetails,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            const originalTransactionThread = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouAction.childReportID}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });
            expect(originalTransactionThread).toBe(undefined);
        });

        it('should remove the original transaction from the search snapshot data', async () => {
            // Given a single expense
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const transaction: Transaction = {
                amount: 100,
                currency: 'USD',
                transactionID: '1',
                reportID: expenseReport.reportID,
                created: DateUtils.getDBTime(),
                merchant: 'test',
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
            };
            const iouAction: ReportAction = {
                ...buildOptimisticIOUReportAction({
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    comment: '',
                    participants: [],
                    transactionID: transaction.transactionID,
                    iouReportID: expenseReport.reportID,
                }),
                childReportID: transactionThread.reportID,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`, transactionThread);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [iouAction.reportActionID]: iouAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            const draftTransaction: OnyxEntry<Transaction> = {
                ...transaction,
                comment: {
                    originalTransactionID: transaction.transactionID,
                },
            };

            // When splitting the expense
            const hash = 1;

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
            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
                allReportNameValuePairsList: allReportNameValuePairs,
                transactionData: {
                    reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                    originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                    splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                    splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                },
                hash,
                policyCategories: undefined,
                policy: undefined,
                policyRecentlyUsedCategories: [],
                iouReport: expenseReport,
                firstIOU: undefined,
                isASAPSubmitBetaEnabled: false,
                currentUserPersonalDetails,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // Then the original expense/transaction should be removed from the search snapshot data
            const searchSnapshot = await new Promise<OnyxEntry<SearchResults>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });
            expect(searchSnapshot?.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]).toBe(undefined);
        });

        it('should add split transactions optimistically on search snapshot when current search filter is on unapprovedCash', async () => {
            const chatReport: Report = createRandomReport(7, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            // Given a single expense
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                chatReportID: chatReport.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const transaction: Transaction = {
                amount: 100,
                currency: 'USD',
                transactionID: '1',
                reportID: expenseReport.reportID,
                created: DateUtils.getDBTime(),
                merchant: 'test',
            };
            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
            };
            const iouAction: ReportAction = {
                ...buildOptimisticIOUReportAction({
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    comment: '',
                    participants: [],
                    transactionID: transaction.transactionID,
                    iouReportID: expenseReport.reportID,
                }),
                childReportID: transactionThread.reportID,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`, transactionThread);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [iouAction.reportActionID]: iouAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            const splitTransactionID1 = '34';
            const splitTransactionID2 = '35';
            const draftTransaction: OnyxEntry<Transaction> = {
                ...transaction,
                comment: {
                    originalTransactionID: transaction.transactionID,
                    splitExpenses: [
                        {amount: transaction.amount / 2, transactionID: splitTransactionID1, created: ''},
                        {amount: transaction.amount / 2, transactionID: splitTransactionID2, created: ''},
                    ],
                },
            };

            // When splitting the expense
            const hash = 1;

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

            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
                allReportNameValuePairsList: allReportNameValuePairs,
                transactionData: {
                    reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                    originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                    splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                    splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                },
                hash,
                policyCategories: undefined,
                policy: undefined,
                policyRecentlyUsedCategories: [],
                iouReport: expenseReport,
                firstIOU: undefined,
                isASAPSubmitBetaEnabled: false,
                currentUserPersonalDetails,
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // Then the split expenses/transactions should be added on the search snapshot data
            const searchSnapshot = await new Promise<OnyxEntry<SearchResults>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${unapprovedCashHash}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });
            expect(searchSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransactionID1}`]).toBeDefined();
            expect(searchSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransactionID2}`]).toBeDefined();
        });
    });

    describe('payMoneyRequestElsewhere', () => {
        it('clears outstanding IOUReport', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport: OnyxEntry<Report>;
            let iouReport: OnyxEntry<Report>;
            let createIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let payIOUAction: OnyxEntry<ReportAction>;
            let transaction: OnyxEntry<Transaction>;
            requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                transactionViolations: {},
            });
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(allReports ?? {}).length).toBe(3);

                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                    chatReport = chatReports.at(0);
                                    expect(chatReport).toBeTruthy();
                                    expect(chatReport).toHaveProperty('reportID');
                                    expect(chatReport).toHaveProperty('iouReportID');

                                    iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    expect(iouReport).toBeTruthy();
                                    expect(iouReport).toHaveProperty('reportID');
                                    expect(iouReport).toHaveProperty('chatReportID');

                                    expect(chatReport?.iouReportID).toBe(iouReport?.reportID);
                                    expect(iouReport?.chatReportID).toBe(chatReport?.reportID);

                                    expect(chatReport?.pendingFields).toBeFalsy();
                                    expect(iouReport?.pendingFields).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];

                                    createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => isMoneyRequestAction(reportAction),
                                    );
                                    expect(createIOUAction).toBeTruthy();
                                    expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUReportID).toBe(iouReport?.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                    transaction = Object.values(allTransactions ?? {}).find((t) => t);
                                    expect(transaction).toBeTruthy();
                                    expect(transaction?.amount).toBe(amount);
                                    expect(transaction?.reportID).toBe(iouReport?.reportID);
                                    expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUTransactionID).toBe(transaction?.transactionID);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    mockFetch?.pause?.();
                    if (chatReport && iouReport) {
                        payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, chatReport, iouReport, undefined);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(allReports ?? {}).length).toBe(3);

                                    chatReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.IOU);

                                    expect(chatReport?.iouReportID).toBeFalsy();

                                    // expect(iouReport.status).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                                    // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`];
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);

                                    payIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction) => isMoneyRequestAction(reportAction) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                    );
                                    expect(payIOUAction).toBeTruthy();
                                    expect(payIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(allReports ?? {}).length).toBe(3);

                                    chatReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.IOU);

                                    expect(chatReport?.iouReportID).toBeFalsy();

                                    // expect(iouReport.status).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                                    // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`];
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);

                                    payIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction) => isMoneyRequestAction(reportAction) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                    );
                                    resolve();

                                    expect(payIOUAction).toBeTruthy();
                                    expect(payIOUAction?.pendingAction).toBeFalsy();
                                },
                            });
                        }),
                );
        });
    });

    describe('pay expense report via ACH', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('updates the expense request and expense report when paid while offline', () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            mockFetch?.pause?.();
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport && expenseReport) {
                        payMoneyRequest(CONST.IOU.PAYMENT_TYPE.VBBA, chatReport, expenseReport, undefined, undefined);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(allActions ?? {})).toEqual(
                                        expect.arrayContaining([
                                            expect.objectContaining({
                                                message: expect.arrayContaining([
                                                    expect.objectContaining({
                                                        html: `paid $${amount / 100}.00 with Expensify`,
                                                        text: `paid $${amount / 100}.00 with Expensify`,
                                                    }),
                                                ]),
                                                originalMessage: expect.objectContaining({
                                                    amount,
                                                    paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                                                    type: 'pay',
                                                }),
                                            }),
                                        ]),
                                    );
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    const updatedIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    const updatedChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === expenseReport?.chatReportID);
                                    expect(updatedIOUReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: `paid $${amount / 100}.00 with Expensify`,
                                            lastMessageText: `paid $${amount / 100}.00 with Expensify`,
                                            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                                            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                                        }),
                                    );
                                    expect(updatedChatReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: `paid $${amount / 100}.00 with Expensify`,
                                            lastMessageText: `paid $${amount / 100}.00 with Expensify`,
                                        }),
                                    );
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('shows an error when paying results in an error', () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    mockFetch?.fail?.();
                    if (chatReport && expenseReport) {
                        payMoneyRequest('ACH', chatReport, expenseReport, undefined, undefined);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connection);
                                    const erroredAction = Object.values(allActions ?? {}).find((action) => !isEmptyObject(action?.errors));
                                    expect(Object.values(erroredAction?.errors ?? {}).at(0)).toEqual(translateLocal('iou.error.other'));
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('payMoneyRequest', () => {
        it('should apply optimistic data correctly', async () => {
            // Given an outstanding IOU report
            const chatReport = {
                ...createRandomReport(0, undefined),
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: DateUtils.getDBTime(),
            };
            const iouReport = {
                ...createRandomReport(1, undefined),
                chatType: undefined,
                type: CONST.REPORT.TYPE.IOU,
                total: 10,
            };
            mockFetch?.pause?.();

            jest.advanceTimersByTime(10);

            // When paying the IOU report
            payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, chatReport, iouReport, undefined);

            await waitForBatchedUpdates();

            // Then the optimistic data should be applied correctly
            const payReportAction = await new Promise<ReportAction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        resolve(Object.values(reportActions ?? {}).pop());
                    },
                });
            });

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.lastVisibleActionCreated).toBe(chatReport.lastVisibleActionCreated);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.iouReportID).toBeUndefined();
                        expect(new Date(report?.lastReadTime ?? '').getTime()).toBeGreaterThan(new Date(chatReport?.lastReadTime ?? '').getTime());
                        expect(report?.lastMessageText).toBe(getReportActionText(payReportAction));
                        expect(report?.lastMessageHtml).toBe(getReportActionHtml(payReportAction));
                        resolve();
                    },
                });
            });

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.statusNum).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                        expect(report?.lastVisibleActionCreated).toBe(payReportAction?.created);
                        expect(report?.lastMessageText).toBe(getReportActionText(payReportAction));
                        expect(report?.lastMessageHtml).toBe(getReportActionHtml(payReportAction));
                        expect(report?.pendingFields).toEqual({
                            preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        });
                        resolve();
                    },
                });
            });

            mockFetch?.resume?.();
        });

        it('calls notifyNewAction for the top most report', () => {
            // Given two expenses in an iou report where one of them held
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };
            const iouActions: ReportAction[] = [];
            for (const transaction of [transaction1, transaction2]) {
                iouActions.push(
                    buildOptimisticIOUReportAction({
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        comment: '',
                        participants: [],
                        transactionID: transaction.transactionID,
                    }),
                );
            }
            const actions: OnyxInputValue<ReportActions> = {};
            for (const iouAction of iouActions) {
                actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`] = iouAction;
            }
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    putOnHold(transaction1.transactionID, 'comment', iouReport.reportID);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // When partially paying  an iou report from the chat report via the report preview
                    payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, {reportID: topMostReportID}, iouReport, undefined, undefined, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Then notifyNewAction should be called on the top most report.
                    expect(notifyNewAction).toHaveBeenCalledWith(topMostReportID, expect.anything());
                });
        });
    });

    describe('a expense chat with a cancelled payment', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it("has an iouReportID of the cancelled payment's expense report", () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    // Which owns a workspace
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                    });
                    return waitForBatchedUpdates();
                })
                .then(() =>
                    getOnyxData({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                        },
                    }),
                )
                .then(() => {
                    if (chatReport) {
                        // When an IOU expense is submitted to that policy expense chat
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(() =>
                    // And given an expense report has now been created which holds the IOU
                    getOnyxData({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                        },
                    }),
                )
                .then(() => {
                    // When the expense report is paid elsewhere (but really, any payment option would work)
                    if (chatReport && expenseReport) {
                        payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, chatReport, expenseReport, undefined);
                    }
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    if (chatReport && expenseReport) {
                        // And when the payment is cancelled
                        cancelPayment(expenseReport, chatReport, {} as Policy, true, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true);
                    }
                    return waitForBatchedUpdates();
                })
                .then(() =>
                    getOnyxData({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            const chatReportData = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`];
                            // Then the policy expense chat report has the iouReportID of the IOU expense report
                            expect(chatReportData?.iouReportID).toBe(expenseReport?.reportID);
                        },
                    }),
                );
        });
    });

    describe('deleteMoneyRequest', () => {
        const amount = 10000;
        const comment = 'Send me money please';
        let chatReport: OnyxEntry<Report>;
        let iouReport: OnyxEntry<Report>;
        let createIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
        let transaction: OnyxEntry<Transaction>;
        let thread: OptimisticChatReport;
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        let IOU_REPORT_ID: string | undefined;
        let reportActionID;
        const REPORT_ACTION: OnyxEntry<ReportAction> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: TEST_USER_ACCOUNT_ID,
            automatic: false,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: ''}],
            person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
            shouldShow: true,
            created: DateUtils.getDBTime(),
            reportActionID: '1',
            originalMessage: {
                html: '',
                whisperedTo: [],
            },
        };

        let reportActions: OnyxCollection<ReportAction>;

        beforeEach(async () => {
            // Given mocks are cleared and helpers are set up
            jest.clearAllMocks();
            PusherHelper.setup();

            // Given a test user is signed in with Onyx setup and some initial data
            await signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            subscribeToUserEvents();
            await waitForBatchedUpdates();
            await setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

            // When a submit IOU expense is made
            requestMoney({
                report: chatReport,
                participantParams: {
                    payeeEmail: TEST_USER_LOGIN,
                    payeeAccountID: TEST_USER_ACCOUNT_ID,
                    participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                transactionViolations: {},
            });
            await waitForBatchedUpdates();

            // When fetching all reports from Onyx
            const allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // Then we should have exactly 3 reports
            expect(Object.values(allReports ?? {}).length).toBe(3);

            // Then one of them should be a chat report with relevant properties
            chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT);
            expect(chatReport).toBeTruthy();
            expect(chatReport).toHaveProperty('reportID');
            expect(chatReport).toHaveProperty('iouReportID');

            // Then one of them should be an IOU report with relevant properties
            iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // Then their IDs should reference each other
            expect(chatReport?.iouReportID).toBe(iouReport?.reportID);
            expect(iouReport?.chatReportID).toBe(chatReport?.reportID);

            // Storing IOU Report ID for further reference
            IOU_REPORT_ID = chatReport?.iouReportID;

            await waitForBatchedUpdates();

            // When fetching all report actions from Onyx
            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            // Then we should find an IOU action with specific properties
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );
            expect(createIOUAction).toBeTruthy();
            expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUReportID).toBe(iouReport?.reportID);

            // When fetching all transactions from Onyx
            const allTransactions = await new Promise<OnyxCollection<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        resolve(transactions);
                    },
                });
            });

            // Then we should find a specific transaction with relevant properties
            transaction = Object.values(allTransactions ?? {}).find((t) => t);
            expect(transaction).toBeTruthy();
            expect(transaction?.amount).toBe(amount);
            expect(transaction?.reportID).toBe(iouReport?.reportID);
            expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUTransactionID).toBe(transaction?.transactionID);
        });

        afterEach(PusherHelper.teardown);

        it('delete an expense (IOU Action and transaction) successfully', async () => {
            // Given the fetch operations are paused and an expense is initiated
            mockFetch?.pause?.();

            if (transaction && createIOUAction) {
                // When the expense is deleted
                deleteMoneyRequest(transaction?.transactionID, createIOUAction, {}, {}, iouReport, chatReport, true, undefined);
            }
            await waitForBatchedUpdates();

            // Then we check if the IOU report action is removed from the report actions collection
            let reportActionsForReport = await new Promise<OnyxCollection<ReportAction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (actionsForReport) => {
                        Onyx.disconnect(connection);
                        resolve(actionsForReport);
                    },
                });
            });

            createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );
            // Then the IOU Action should be truthy for offline support.
            expect(createIOUAction).toBeTruthy();

            // Then we check if the transaction is removed from the transactions collection
            const t = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
                    waitForCollectionCallback: false,
                    callback: (transactionResult) => {
                        Onyx.disconnect(connection);
                        resolve(transactionResult);
                    },
                });
            });

            expect(t).toBeTruthy();
            expect(t?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

            // Given fetch operations are resumed
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then we recheck the IOU report action from the report actions collection
            reportActionsForReport = await new Promise<OnyxCollection<ReportAction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (actionsForReport) => {
                        Onyx.disconnect(connection);
                        resolve(actionsForReport);
                    },
                });
            });

            createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );
            expect(createIOUAction).toBeFalsy();

            // Then we recheck the transaction from the transactions collection
            const tr = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
                    waitForCollectionCallback: false,
                    callback: (transactionResult) => {
                        Onyx.disconnect(connection);
                        resolve(transactionResult);
                    },
                });
            });

            expect(tr).toBeFalsy();
        });

        it('delete the IOU report when there are no expenses left in the IOU report', async () => {
            // Given an IOU report and a paused fetch state
            mockFetch?.pause?.();

            if (transaction && createIOUAction) {
                // When the IOU expense is deleted
                deleteMoneyRequest(transaction?.transactionID, createIOUAction, {}, {}, iouReport, chatReport, true);
            }
            await waitForBatchedUpdates();

            let report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (res) => {
                        Onyx.disconnect(connection);
                        resolve(res);
                    },
                });
            });

            // Then the report should be truthy for offline support
            expect(report).toBeTruthy();

            // Given the resumed fetch state
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (res) => {
                        Onyx.disconnect(connection);
                        resolve(res);
                    },
                });
            });

            // Then the report should be falsy so that there is no trace of the expense.
            expect(report).toBeFalsy();
        });

        it('does not delete the IOU report when there are expenses left in the IOU report', async () => {
            // Given multiple expenses on an IOU report
            requestMoney({
                report: chatReport,
                participantParams: {
                    payeeEmail: TEST_USER_LOGIN,
                    payeeAccountID: TEST_USER_ACCOUNT_ID,
                    participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // When we attempt to delete an expense from the IOU report
            mockFetch?.pause?.();
            if (transaction && createIOUAction) {
                deleteMoneyRequest(transaction?.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            await waitForBatchedUpdates();

            // Then expect that the IOU report still exists
            let allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            await waitForBatchedUpdates();

            iouReport = Object.values(allReports ?? {}).find((report) => isIOUReport(report));
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // Given the resumed fetch state
            await mockFetch?.resume?.();

            allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });
            // Then expect that the IOU report still exists
            iouReport = Object.values(allReports ?? {}).find((report) => isIOUReport(report));
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
        });

        it('delete the transaction thread if there are no visible comments in the thread', async () => {
            // Given all promises are resolved
            await waitForBatchedUpdates();
            jest.advanceTimersByTime(10);

            // Given a transaction thread
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toStrictEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });

            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            // Given User logins from the participant accounts
            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);

            // When Opening a thread report with the given details
            openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            // Then The iou action has the transaction report id as a child report ID
            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            // Given Fetch is paused and timers have advanced
            mockFetch?.pause?.();
            jest.advanceTimersByTime(10);

            if (transaction && createIOUAction) {
                // When Deleting an expense
                deleteMoneyRequest(transaction?.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            await waitForBatchedUpdates();

            // Then The report for the given thread ID does not exist
            let report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportData) => {
                        Onyx.disconnect(connection);
                        resolve(reportData);
                    },
                });
            });

            expect(report?.reportID).toBeFalsy();
            mockFetch?.resume?.();

            // Then After resuming fetch, the report for the given thread ID still does not exist
            report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportData) => {
                        Onyx.disconnect(connection);
                        resolve(reportData);
                    },
                });
            });

            expect(report?.reportID).toBeFalsy();
        });

        it('delete the transaction thread if there are only changelogs (i.e. MODIFIED_EXPENSE actions) in the thread', async () => {
            // Given all promises are resolved
            await waitForBatchedUpdates();
            jest.advanceTimersByTime(10);

            // Given a transaction thread
            thread = buildTransactionThread(createIOUAction, iouReport);

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });

            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            // Given User logins from the participant accounts
            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);

            // When Opening a thread report with the given details
            openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            // Then The iou action has the transaction report id as a child report ID
            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );

            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);
            if (transaction && createIOUAction) {
                updateMoneyRequestAmountAndCurrency({
                    transactionID: transaction.transactionID,
                    transactions: {},
                    transactionThreadReportID: thread.reportID,
                    transactionViolations: {},
                    amount: 20000,
                    currency: CONST.CURRENCY.USD,
                    taxAmount: 0,
                    taxCode: '',
                    policy: {
                        id: '123',
                        role: CONST.POLICY.ROLE.USER,
                        type: CONST.POLICY.TYPE.TEAM,
                        name: '',
                        owner: '',
                        outputCurrency: '',
                        isPolicyExpenseChatEnabled: false,
                    },
                    policyTagList: {},
                    policyCategories: {},
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                });
            }
            await waitForBatchedUpdates();

            // Verify there are two actions (created + changelog)
            expect(Object.values(reportActions ?? {}).length).toBe(2);

            // Fetch the updated IOU Action from Onyx
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connection);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        resolve();
                    },
                });
            });

            if (transaction && createIOUAction) {
                // When Deleting an expense
                deleteMoneyRequest(transaction?.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            await waitForBatchedUpdates();

            // Then, the report for the given thread ID does not exist
            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportData) => {
                        Onyx.disconnect(connection);
                        resolve(reportData);
                    },
                });
            });

            expect(report?.reportID).toBeFalsy();
        });

        it('does not delete the transaction thread if there are visible comments in the thread', async () => {
            // Given initial environment is set up
            await waitForBatchedUpdates();

            // Given a transaction thread
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            jest.advanceTimersByTime(10);
            openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });

            jest.advanceTimersByTime(10);

            // When a comment is added
            addComment(thread.reportID, thread.reportID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
            await waitForBatchedUpdates();

            // Then comment details should match the expected report action
            const resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
            reportActionID = resultAction?.reportActionID;
            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);

            await waitForBatchedUpdates();

            // Then the report should have 2 actions
            expect(Object.values(reportActions ?? {}).length).toBe(2);
            const resultActionAfter = reportActionID ? reportActions?.[reportActionID] : undefined;
            expect(resultActionAfter?.pendingAction).toBeUndefined();

            mockFetch?.pause?.();

            if (transaction && createIOUAction) {
                // When deleting expense
                deleteMoneyRequest(transaction?.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            await waitForBatchedUpdates();

            // Then the transaction thread report should still exist
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });

            // When fetch resumes
            // Then the transaction thread report should still exist
            mockFetch?.resume?.();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });
        });

        it('update the moneyRequestPreview to show [Deleted expense] when appropriate', async () => {
            await waitForBatchedUpdates();

            // Given a thread report

            jest.advanceTimersByTime(10);
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toStrictEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);
            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);

            await waitForBatchedUpdates();

            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            // Given an added comment to the thread report

            jest.advanceTimersByTime(10);

            addComment(thread.reportID, thread.reportID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
            await waitForBatchedUpdates();

            // Fetch the updated IOU Action from Onyx due to addition of comment to transaction thread.
            // This needs to be fetched as `deleteMoneyRequest` depends on `childVisibleActionCount` in `createIOUAction`.
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connection);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        resolve();
                    },
                });
            });

            let resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
            reportActionID = resultAction?.reportActionID;

            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);
            expect(resultAction?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Verify there are three actions (created + addcomment) and our optimistic comment has been removed
            expect(Object.values(reportActions ?? {}).length).toBe(2);

            let resultActionAfterUpdate = reportActionID ? reportActions?.[reportActionID] : undefined;

            // Verify that our action is no longer in the loading state
            expect(resultActionAfterUpdate?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Given an added comment to the IOU report

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            if (IOU_REPORT_ID) {
                addComment(IOU_REPORT_ID, IOU_REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
            }
            await waitForBatchedUpdates();

            resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
            reportActionID = resultAction?.reportActionID;

            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);
            expect(resultAction?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Verify there are three actions (created + iou + addcomment) and our optimistic comment has been removed
            expect(Object.values(reportActions ?? {}).length).toBe(3);

            resultActionAfterUpdate = reportActionID ? reportActions?.[reportActionID] : undefined;

            // Verify that our action is no longer in the loading state
            expect(resultActionAfterUpdate?.pendingAction).toBeUndefined();

            mockFetch?.pause?.();
            if (transaction && createIOUAction) {
                // When we delete the expense
                deleteMoneyRequest(transaction.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            await waitForBatchedUpdates();

            // Then we expect the moneyRequestPreview to show [Deleted expense]

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connection);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        expect(getReportActionMessage(createIOUAction)?.isDeletedParentAction).toBeTruthy();
                        resolve();
                    },
                });
            });

            // When we resume fetch
            mockFetch?.resume?.();

            // Then we expect the moneyRequestPreview to show [Deleted expense]

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connection);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                            isMoneyRequestAction(reportAction),
                        );
                        expect(getReportActionMessage(createIOUAction)?.isDeletedParentAction).toBeTruthy();
                        resolve();
                    },
                });
            });
        });

        it('update IOU report and reportPreview with new totals and messages if the IOU report is not deleted', async () => {
            await waitForBatchedUpdates();
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                callback: (val) => (iouReport = val),
            });
            await waitForBatchedUpdates();

            // Given a second expense in addition to the first one

            jest.advanceTimersByTime(10);
            const amount2 = 20000;
            const comment2 = 'Send me money please 2';
            if (chatReport) {
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: TEST_USER_LOGIN,
                        payeeAccountID: TEST_USER_ACCOUNT_ID,
                        participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID},
                    },
                    transactionParams: {
                        amount: amount2,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant: '',
                        comment: comment2,
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    transactionViolations: {},
                });
            }

            await waitForBatchedUpdates();

            // Then we expect the IOU report and reportPreview to update with new totals

            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(30000);

            const iouPreview = chatReport?.reportID && iouReport?.reportID ? getReportPreviewAction(chatReport.reportID, iouReport.reportID) : undefined;
            expect(iouPreview).toBeTruthy();
            expect(getReportActionText(iouPreview)).toBe('rory@expensifail.com owes $300.00');

            // When we delete the first expense
            mockFetch?.pause?.();
            jest.advanceTimersByTime(10);
            if (transaction && createIOUAction) {
                deleteMoneyRequest(transaction.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            await waitForBatchedUpdates();

            // Then we expect the IOU report and reportPreview to update with new totals

            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(20000);

            // When we resume
            mockFetch?.resume?.();

            // Then we expect the IOU report and reportPreview to update with new totals
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(20000);
        });

        it('navigate the user correctly to the iou Report when appropriate', async () => {
            // Given multiple expenses on an IOU report
            requestMoney({
                report: chatReport,
                participantParams: {
                    payeeEmail: TEST_USER_LOGIN,
                    payeeAccountID: TEST_USER_ACCOUNT_ID,
                    participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                transactionViolations: {},
            });
            await waitForBatchedUpdates();

            // Given a thread report
            jest.advanceTimersByTime(10);
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toStrictEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            jest.advanceTimersByTime(10);
            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                isMoneyRequestAction(reportAction),
            );
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            // When we delete the expense, we should not delete the IOU report
            mockFetch?.pause?.();

            let navigateToAfterDelete;
            if (transaction && createIOUAction) {
                navigateToAfterDelete = deleteMoneyRequest(transaction.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined, true);
            }

            let allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            iouReport = Object.values(allReports ?? {}).find((report) => isIOUReport(report));
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            await mockFetch?.resume?.();

            allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            iouReport = Object.values(allReports ?? {}).find((report) => isIOUReport(report));
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // Then we expect to navigate to the iou report
            expect(IOU_REPORT_ID).not.toBeUndefined();
            if (IOU_REPORT_ID) {
                expect(navigateToAfterDelete).toEqual(ROUTES.REPORT_WITH_ID.getRoute(IOU_REPORT_ID));
            }
        });

        it('navigate the user correctly to the chat Report when appropriate', () => {
            let navigateToAfterDelete;
            if (transaction && createIOUAction) {
                // When we delete the expense and we should delete the IOU report
                navigateToAfterDelete = deleteMoneyRequest(transaction.transactionID, createIOUAction, {}, {}, iouReport, chatReport, undefined);
            }
            // Then we expect to navigate to the chat report
            expect(chatReport?.reportID).not.toBeUndefined();

            if (chatReport?.reportID) {
                expect(navigateToAfterDelete).toEqual(ROUTES.REPORT_WITH_ID.getRoute(chatReport?.reportID));
            }
        });
    });

    describe('bulk deleteMoneyRequest', () => {
        it('update IOU report total properly for bulk deletion of expenses', async () => {
            const expenseReport: Report = {
                ...createRandomReport(11, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 30,
                currency: CONST.CURRENCY.USD,
                unheldTotal: 20,
                unheldNonReimbursableTotal: 20,
            };
            const transaction1: Transaction = {
                ...createRandomTransaction(1),
                amount: 10,
                comment: {hold: '123'},
                currency: CONST.CURRENCY.USD,
                reportID: expenseReport.reportID,
                reimbursable: true,
            };
            const moneyRequestAction1: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: '1',
                originalMessage: {
                    IOUReportID: expenseReport.reportID,
                    amount: transaction1.amount,
                    currency: transaction1.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                message: undefined,
                previousMessage: undefined,
            };
            const transaction2: Transaction = {...createRandomTransaction(2), amount: 10, currency: CONST.CURRENCY.USD, reportID: expenseReport.reportID, reimbursable: false};
            const moneyRequestAction2: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: '2',
                originalMessage: {
                    IOUReportID: expenseReport.reportID,
                    amount: transaction2.amount,
                    currency: transaction2.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                message: undefined,
                previousMessage: undefined,
            };
            const transaction3: Transaction = {...createRandomTransaction(3), amount: 10, currency: CONST.CURRENCY.USD, reportID: expenseReport.reportID, reimbursable: false};

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`, transaction2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction3.transactionID}`, transaction3);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            const selectedTransactionIDs = [transaction1.transactionID, transaction2.transactionID];
            deleteMoneyRequest(transaction1.transactionID, moneyRequestAction1, {}, {}, expenseReport, expenseReport, undefined, undefined, [], selectedTransactionIDs);
            deleteMoneyRequest(
                transaction2.transactionID,
                moneyRequestAction2,
                {},
                {},
                expenseReport,
                expenseReport,
                undefined,
                undefined,
                [transaction1.transactionID],
                selectedTransactionIDs,
            );

            await waitForBatchedUpdates();

            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });

            expect(report?.total).toBe(10);
            expect(report?.unheldTotal).toBe(10);
            expect(report?.unheldNonReimbursableTotal).toBe(10);
        });
    });

    describe('submitReport', () => {
        it('correctly submits a report', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            return waitForBatchedUpdates()
                .then(() => {
                    const policyID = generatePolicyID();
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        policyID,
                    });

                    // Change the approval mode for the policy since default is Submit and Close
                    setWorkspaceApprovalMode(policyID, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC);
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                                    Onyx.merge(`report_${expenseReport?.reportID}`, {
                                        statusNum: 0,
                                        stateNum: 0,
                                    });
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (expenseReport) {
                        submitReport(expenseReport, {} as Policy, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true, true);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                                    // Report was submitted correctly
                                    expect(expenseReport?.stateNum).toBe(1);
                                    expect(expenseReport?.statusNum).toBe(1);
                                    resolve();
                                },
                            });
                        }),
                );
        });
        it('correctly submits a report with Submit and Close approval mode', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            let policy: OnyxEntry<Policy>;

            return waitForBatchedUpdates()
                .then(() => {
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        policyID: undefined,
                        engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                                reimbursable: true,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.POLICY,
                                waitForCollectionCallback: true,
                                callback: (allPolicies) => {
                                    Onyx.disconnect(connection);
                                    policy = Object.values(allPolicies ?? {}).find((p): p is OnyxEntry<Policy> => p?.name === "Carlos's Workspace");
                                    expect(policy).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    Onyx.merge(`report_${expenseReport?.reportID}`, {
                                        statusNum: 0,
                                        stateNum: 0,
                                    });
                                    resolve();

                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, true)).toBe(true);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, false)).toBe(true);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, false)).toBe(false);
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    resolve();
                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);

                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, false)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, false)).toBe(false);
                                },
                            });
                        }),
                )
                .then(() => {
                    if (expenseReport) {
                        submitReport(expenseReport, policy, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true, true);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    resolve();
                                    // Report is closed since the default policy settings is Submit and Close
                                    expect(expenseReport?.stateNum).toBe(2);
                                    expect(expenseReport?.statusNum).toBe(2);

                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, true)).toBe(true);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, false)).toBe(true);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, false)).toBe(false);
                                },
                            });
                        }),
                )
                .then(() => {
                    if (policy) {
                        const reportToArchive = [];
                        if (expenseReport) {
                            reportToArchive.push(expenseReport);
                        }
                        if (chatReport) {
                            reportToArchive.push(chatReport);
                        }
                        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                        deleteWorkspace({
                            policyID: policy.id,
                            activePolicyID: undefined,
                            policyName: policy.name,
                            lastAccessedWorkspacePolicyID: undefined,
                            policyCardFeeds: undefined,
                            reportsToArchive: reportToArchive,
                            transactionViolations: undefined,
                            reimbursementAccountError: undefined,
                            bankAccountList: {},
                            lastUsedPaymentMethods: undefined,
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, false)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, false)).toBe(false);
                                    resolve();
                                },
                            });
                        }),
                );
        });
        it('correctly implements error handling', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            let policy: OnyxEntry<Policy>;

            return waitForBatchedUpdates()
                .then(() => {
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        policyID: undefined,
                        engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                                reimbursable: true,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.POLICY,
                                waitForCollectionCallback: true,
                                callback: (allPolicies) => {
                                    Onyx.disconnect(connection);
                                    policy = Object.values(allPolicies ?? {}).find((p): p is OnyxEntry<Policy> => p?.name === "Carlos's Workspace");
                                    expect(policy).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    Onyx.merge(`report_${expenseReport?.reportID}`, {
                                        statusNum: 0,
                                        stateNum: 0,
                                    });

                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, true)).toBe(true);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, false)).toBe(true);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, false)).toBe(false);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    mockFetch?.fail?.();
                    if (expenseReport) {
                        submitReport(expenseReport, {} as Policy, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true, true);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    // Report was submitted with some fail
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], true, undefined, undefined, false)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, true)).toBe(false);
                                    expect(canIOUBePaid(expenseReport, chatReport, policy, [], false, undefined, undefined, false)).toBe(false);
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('resolveDuplicate', () => {
        test('Resolving duplicates of two transaction by keeping one of them should properly set the other one on hold even if the transaction thread reports do not exist in onyx', () => {
            // Given two duplicate transactions
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };
            const iouActions: ReportAction[] = [];
            for (const transaction of [transaction1, transaction2]) {
                iouActions.push(
                    buildOptimisticIOUReportAction({
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        comment: '',
                        participants: [],
                        transactionID: transaction.transactionID,
                    }),
                );
            }
            const actions: OnyxInputValue<ReportActions> = {};
            for (const iouAction of iouActions) {
                actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`] = iouAction;
            }
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When resolving duplicates with transaction thread reports no existing in onyx
                    resolveDuplicates({
                        ...transaction1,
                        receiptID: 1,
                        category: '',
                        comment: '',
                        billable: false,
                        reimbursable: true,
                        tag: '',
                        transactionIDList: [transaction2.transactionID],
                    });
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`,
                            callback: (transaction) => {
                                Onyx.disconnect(connection);
                                // Then the duplicate transaction should correctly be set on hold.
                                expect(transaction?.comment?.hold).toBeDefined();
                                resolve();
                            },
                        });
                    });
                });
        });
    });

    describe('putOnHold', () => {
        test("should update the transaction thread report's lastVisibleActionCreated to the optimistically added hold comment report action created timestamp", () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const actions: OnyxInputValue<ReportActions> = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When an expense is put on hold
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`,
                            callback: (report) => {
                                Onyx.disconnect(connection);
                                const lastVisibleActionCreated = report?.lastVisibleActionCreated;
                                const connection2 = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
                                    callback: (reportActions) => {
                                        Onyx.disconnect(connection2);
                                        resolve();
                                        const lastAction = getSortedReportActions(Object.values(reportActions ?? {}), true).at(0);
                                        const message = getReportActionMessage(lastAction);
                                        // Then the transaction thread report lastVisibleActionCreated should equal the hold comment action created timestamp.
                                        expect(message?.text).toBe(comment);
                                        expect(lastVisibleActionCreated).toBe(lastAction?.created);
                                    },
                                });
                            },
                        });
                    });
                });
        });

        test('should create transaction thread optimistically when initialReportID is undefined', () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const actions: OnyxInputValue<ReportActions> = {[iouAction.reportActionID]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions,
            };
            const comment = 'hold reason for new thread';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When an expense is put on hold without existing transaction thread (undefined initialReportID)
                    putOnHold(transaction.transactionID, comment, undefined);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                            callback: (reportActions) => {
                                Onyx.disconnect(connection);
                                const updatedIOUAction = reportActions?.[iouAction.reportActionID];
                                // Verify that IOU action now has childReportID set optimistically
                                expect(updatedIOUAction?.childReportID).toBeDefined();
                                resolve();
                            },
                        });
                    });
                });
        });
    });

    describe('unHoldRequest', () => {
        test("should update the transaction thread report's lastVisibleActionCreated to the optimistically added unhold report action created timestamp", () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const actions: OnyxInputValue<ReportActions> = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // When an expense is unhold
                    unholdRequest(transaction.transactionID, transactionThread.reportID);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`,
                            callback: (report) => {
                                Onyx.disconnect(connection);
                                const lastVisibleActionCreated = report?.lastVisibleActionCreated;
                                const connection2 = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
                                    callback: (reportActions) => {
                                        Onyx.disconnect(connection2);
                                        resolve();
                                        const lastAction = getSortedReportActions(Object.values(reportActions ?? {}), true).at(0);
                                        // Then the transaction thread report lastVisibleActionCreated should equal the unhold action created timestamp.
                                        expect(lastAction?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.UNHOLD);
                                        expect(lastVisibleActionCreated).toBe(lastAction?.created);
                                    },
                                });
                            },
                        });
                    });
                });
        });

        test('should rollback unhold request on API failure', () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const actions: OnyxInputValue<ReportActions> = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    mockFetch.fail();
                    mockFetch?.resume?.();
                    unholdRequest(transaction.transactionID, transactionThread.reportID);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                            callback: (updatedTransaction) => {
                                Onyx.disconnect(connection);
                                expect(updatedTransaction?.pendingAction).toBeFalsy();
                                expect(updatedTransaction?.comment?.hold).toBeTruthy();
                                expect(Object.values(updatedTransaction?.errors ?? {})).toEqual(
                                    Object.values(getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericUnholdExpenseFailureMessage') ?? {}),
                                );

                                resolve();
                            },
                        });
                    });
                });
        });
    });

    describe('sendInvoice', () => {
        it('creates a new invoice chat when one has been converted from individual to business', async () => {
            // Mock API.write for this test
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            // Given a convertedInvoiceReport is stored in Onyx
            const {policy, transaction, convertedInvoiceChat}: InvoiceTestData = InvoiceData;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${convertedInvoiceChat?.reportID}`, convertedInvoiceChat ?? {});

            // And data for when a new invoice is sent to a user
            const currentUserAccountID = 32;
            const companyName = 'b1-53019';
            const companyWebsite = 'https://www.53019.com';

            // When the user sends a new invoice to an individual
            sendInvoice(currentUserAccountID, transaction, undefined, undefined, policy, undefined, undefined, companyName, companyWebsite);

            // Then a new invoice chat is created instead of incorrectly using the invoice chat which has been converted from individual to business
            expect(writeSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    invoiceRoomReportID: expect.not.stringMatching(convertedInvoiceChat.reportID) as string,
                }),
                expect.anything(),
            );
            writeSpy.mockRestore();
        });

        it('should not clear transaction pending action when send invoice fails', async () => {
            // Given a send invoice request
            mockFetch?.pause?.();
            sendInvoice(1, createRandomTransaction(1));

            // When the request fails
            mockFetch?.fail?.();
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the pending action of the optimistic transaction shouldn't be cleared
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (allTransactions) => {
                        Onyx.disconnect(connection);
                        const transaction = Object.values(allTransactions).at(0);
                        expect(transaction?.errors).not.toBeUndefined();
                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                        resolve();
                    },
                });
            });
        });
    });

    describe('canIOUBePaid', () => {
        it('For invoices from archived workspaces', async () => {
            const {policy, convertedInvoiceChat: chatReport}: InvoiceTestData = InvoiceData;

            const chatReportRNVP: ReportNameValuePairs = {private_isArchived: DateUtils.getDBTime()};

            const invoiceReceiver = chatReport?.invoiceReceiver as {type: string; policyID: string; accountID: number};

            const iouReport = {...createRandomReport(1, undefined), type: CONST.REPORT.TYPE.INVOICE, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED};

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiver.policyID}`, {id: invoiceReceiver.policyID, role: CONST.POLICY.ROLE.ADMIN});

            expect(canIOUBePaid(iouReport, chatReport, policy, [], true)).toBe(true);
            expect(canIOUBePaid(iouReport, chatReport, policy, [], false)).toBe(true);

            // When the invoice is archived
            expect(canIOUBePaid(iouReport, chatReport, policy, [], true, chatReportRNVP)).toBe(false);
            expect(canIOUBePaid(iouReport, chatReport, policy, [], false, chatReportRNVP)).toBe(false);
        });
    });

    describe('setMoneyRequestCategory', () => {
        it('should set the associated tax for the category based on the tax expense rules', async () => {
            // Given a policy with tax expense rules associated with category
            const transactionID = '1';
            const category = 'Advertising';
            const policyID = '2';
            const taxCode = 'id_TAX_EXEMPT';
            const ruleTaxCode = 'id_TAX_RATE_1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                taxCode,
                taxAmount: 0,
                amount: 100,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setting the money request category
            setMoneyRequestCategory(transactionID, category, policyID);

            await waitForBatchedUpdates();

            // Then the transaction tax rate and amount should be updated based on the expense rules
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe(ruleTaxCode);
                        expect(transaction?.taxAmount).toBe(5);
                        resolve();
                    },
                });
            });
        });

        describe('should not change the tax', () => {
            it('if the transaction type is distance', async () => {
                // Given a policy with tax expense rules associated with category and a distance transaction
                const transactionID = '1';
                const category = 'Advertising';
                const policyID = '2';
                const taxCode = 'id_TAX_EXEMPT';
                const ruleTaxCode = 'id_TAX_RATE_1';
                const taxAmount = 0;
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                    taxCode,
                    taxAmount,
                    amount: 100,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When setting the money request category
                setMoneyRequestCategory(transactionID, category, policyID);

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBe(taxCode);
                            expect(transaction?.taxAmount).toBe(taxAmount);
                            resolve();
                        },
                    });
                });
            });

            it('if there are no tax expense rules', async () => {
                // Given a policy without tax expense rules
                const transactionID = '1';
                const category = 'Advertising';
                const policyID = '2';
                const taxCode = 'id_TAX_EXEMPT';
                const taxAmount = 0;
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                    taxCode,
                    taxAmount,
                    amount: 100,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When setting the money request category
                setMoneyRequestCategory(transactionID, category, policyID);

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBe(taxCode);
                            expect(transaction?.taxAmount).toBe(taxAmount);
                            resolve();
                        },
                    });
                });
            });
        });

        it('should clear the tax when the policyID is empty', async () => {
            // Given a transaction with a tax
            const transactionID = '1';
            const taxCode = 'id_TAX_EXEMPT';
            const taxAmount = 0;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                taxCode,
                taxAmount,
                amount: 100,
            });

            // When setting the money request category without a policyID
            setMoneyRequestCategory(transactionID, '');
            await waitForBatchedUpdates();

            // Then the transaction tax should be cleared
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe('');
                        expect(transaction?.taxAmount).toBeUndefined();
                        resolve();
                    },
                });
            });
        });
    });

    describe('updateMoneyRequestCategory', () => {
        it('should update the tax when there are tax expense rules', async () => {
            // Given a policy with tax expense rules associated with category
            const transactionID = '1';
            const policyID = '2';
            const transactionThreadReportID = '3';
            const category = 'Advertising';
            const taxCode = 'id_TAX_EXEMPT';
            const ruleTaxCode = 'id_TAX_RATE_1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                taxCode,
                taxAmount: 0,
                amount: 100,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {reportID: transactionThreadReportID});

            // When updating a money request category
            updateMoneyRequestCategory({
                transactionID,
                transactionThreadReportID,
                category,
                policy: fakePolicy,
                policyTagList: undefined,
                policyCategories: undefined,
                policyRecentlyUsedCategories: [],
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
            });

            await waitForBatchedUpdates();

            // Then the transaction tax rate and amount should be updated based on the expense rules
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe(ruleTaxCode);
                        expect(transaction?.taxAmount).toBe(5);
                        resolve();
                    },
                });
            });

            // But the original message should only contains the old and new category data
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        const reportAction = Object.values(reportActions ?? {}).at(0);
                        if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE)) {
                            const originalMessage = getOriginalMessage(reportAction);
                            expect(originalMessage?.oldCategory).toBe('');
                            expect(originalMessage?.category).toBe(category);
                            expect(originalMessage?.oldTaxRate).toBeUndefined();
                            expect(originalMessage?.oldTaxAmount).toBeUndefined();
                            resolve();
                        }
                    },
                });
            });
        });

        describe('should not update the tax', () => {
            it('if the transaction type is distance', async () => {
                // Given a policy with tax expense rules associated with category and a distance transaction
                const transactionID = '1';
                const policyID = '2';
                const category = 'Advertising';
                const taxCode = 'id_TAX_EXEMPT';
                const taxAmount = 0;
                const ruleTaxCode = 'id_TAX_RATE_1';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                    taxCode,
                    taxAmount,
                    amount: 100,
                    comment: {
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        },
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When updating a money request category
                updateMoneyRequestCategory({
                    transactionID,
                    transactionThreadReportID: '3',
                    category,
                    policy: fakePolicy,
                    policyTagList: undefined,
                    policyCategories: undefined,
                    policyRecentlyUsedCategories: [],
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                });

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBe(taxCode);
                            expect(transaction?.taxAmount).toBe(taxAmount);
                            resolve();
                        },
                    });
                });
            });

            it('if there are no tax expense rules', async () => {
                // Given a policy without tax expense rules
                const transactionID = '1';
                const policyID = '2';
                const category = 'Advertising';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {amount: 100});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When updating the money request category
                updateMoneyRequestCategory({
                    transactionID,
                    transactionThreadReportID: '3',
                    category,
                    policy: fakePolicy,
                    policyTagList: undefined,
                    policyCategories: undefined,
                    policyRecentlyUsedCategories: [],
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    isASAPSubmitBetaEnabled: false,
                });

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBeUndefined();
                            expect(transaction?.taxAmount).toBeUndefined();
                            resolve();
                        },
                    });
                });
            });
        });
    });

    describe('setDraftSplitTransaction', () => {
        it('should set the associated tax for the category based on the tax expense rules', async () => {
            // Given a policy with tax expense rules associated with category
            const transactionID = '1';
            const category = 'Advertising';
            const policyID = '2';
            const taxCode = 'id_TAX_EXEMPT';
            const ruleTaxCode = 'id_TAX_RATE_1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
            };
            const draftTransaction: Transaction = {
                ...createRandomTransaction(1),
                taxCode,
                taxAmount: 0,
                amount: 100,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, draftTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setting a category of a draft split transaction
            setDraftSplitTransaction(transactionID, draftTransaction, {category}, fakePolicy);

            await waitForBatchedUpdates();

            // Then the transaction tax rate and amount should be updated based on the expense rules
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        expect(transaction?.taxCode).toBe(ruleTaxCode);
                        expect(transaction?.taxAmount).toBe(5);
                        resolve();
                    },
                });
            });
        });

        describe('should not change the tax', () => {
            it('if there are no tax expense rules', async () => {
                // Given a policy without tax expense rules
                const transactionID = '1';
                const category = 'Advertising';
                const policyID = '2';
                const taxCode = 'id_TAX_EXEMPT';
                const taxAmount = 0;
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {},
                };
                const draftTransaction: Transaction = {
                    ...createRandomTransaction(1),
                    taxCode,
                    taxAmount,
                    amount: 100,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, draftTransaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When setting a category of a draft split transaction
                setDraftSplitTransaction(transactionID, draftTransaction, {category}, fakePolicy);

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBe(taxCode);
                            expect(transaction?.taxAmount).toBe(taxAmount);
                            resolve();
                        },
                    });
                });
            });

            it('if we are not updating category', async () => {
                // Given a policy with tax expense rules associated with category
                const transactionID = '1';
                const category = 'Advertising';
                const policyID = '2';
                const ruleTaxCode = 'id_TAX_RATE_1';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(Number(policyID)),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {expenseRules: createCategoryTaxExpenseRules(category, ruleTaxCode)},
                };
                const draftTransaction: Transaction = {
                    ...createRandomTransaction(1),
                    amount: 100,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, draftTransaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

                // When setting a draft split transaction without category update
                setDraftSplitTransaction(transactionID, draftTransaction, {}, fakePolicy);

                await waitForBatchedUpdates();

                // Then the transaction tax rate and amount shouldn't be updated
                await new Promise<void>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
                        callback: (transaction) => {
                            Onyx.disconnect(connection);
                            expect(transaction?.taxCode).toBeUndefined();
                            expect(transaction?.taxAmount).toBeUndefined();
                            resolve();
                        },
                    });
                });
            });
        });
    });

    describe('should have valid parameters', () => {
        let writeSpy: jest.SpyInstance;
        const isValid = (value: unknown) => !value || typeof value !== 'object' || value instanceof Blob;

        beforeEach(() => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        test.each([
            [WRITE_COMMANDS.REQUEST_MONEY, CONST.IOU.ACTION.CREATE],
            [WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, CONST.IOU.ACTION.SUBMIT],
        ])('%s', async (expectedCommand: ApiCommand, action: IOUAction) => {
            // When an expense is created
            requestMoney({
                action,
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'KFC',
                    comment: '',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportID: '1',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                transactionViolations: {},
            });

            await waitForBatchedUpdates();

            // Then the correct API request should be made
            expect(writeSpy).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [command, params] = writeSpy.mock.calls.at(0);
            expect(command).toBe(expectedCommand);

            // And the parameters should be supported by XMLHttpRequest
            for (const value of Object.values(params as Record<string, unknown>)) {
                expect(Array.isArray(value) ? value.every(isValid) : isValid(value)).toBe(true);
            }
        });

        test.each([
            [WRITE_COMMANDS.TRACK_EXPENSE, CONST.IOU.ACTION.CREATE],
            [WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, CONST.IOU.ACTION.CATEGORIZE],
            [WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, CONST.IOU.ACTION.SHARE],
        ])('%s', async (expectedCommand: ApiCommand, action: IOUAction) => {
            // When a track expense is created
            trackExpense({
                report: {reportID: '123', policyID: 'A'},
                isDraftPolicy: false,
                action,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                    created: '2024-10-30',
                    merchant: 'KFC',
                    receipt: {},
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    linkedTrackedExpenseReportID: '1',
                },
                accountantParams: action === CONST.IOU.ACTION.SHARE ? {accountant: {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL}} : undefined,
                isASAPSubmitBetaEnabled: false,
            });

            await waitForBatchedUpdates();

            // Then the correct API request should be made
            expect(writeSpy).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [command, params] = writeSpy.mock.calls.at(0);
            expect(command).toBe(expectedCommand);

            if (expectedCommand === WRITE_COMMANDS.SHARE_TRACKED_EXPENSE) {
                expect(params).toHaveProperty('policyName');
            }

            // And the parameters should be supported by XMLHttpRequest
            for (const value of Object.values(params as Record<string, unknown>)) {
                expect(Array.isArray(value) ? value.every(isValid) : isValid(value)).toBe(true);
            }
        });
    });

    describe('canApproveIOU', () => {
        it('should return false if we have only pending card transactions', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy)).toBeFalsy();
            // Then should return false when passing transactions directly as the third parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, result.current.at(1) as Transaction[])).toBeFalsy();
        });
        it('should return false if we have only scanning transactions', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                amount: 0,
                modifiedAmount: 0,
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: undefined,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 0,
                modifiedAmount: 0,
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: '',
                modifiedMerchant: undefined,
            };

            await Onyx.set(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`]: fakeReport,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy)).toBeFalsy();
            // Then should return false when passing transactions directly as the third parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, result.current.at(1) as Transaction[])).toBeFalsy();
        });
        it('should return false if all transactions are pending card or scanning transaction', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 0,
                modifiedAmount: 0,
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: '',
                modifiedMerchant: undefined,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy)).toBeFalsy();
            // Then should return false when passing transactions directly as the third parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, result.current.at(1) as Transaction[])).toBeFalsy();
        });
        it('should return true if at least one transaction is not pending card or scanning transaction', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 0,
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: undefined,
            };
            const fakeTransaction3: Transaction = {
                ...createRandomTransaction(2),
                reportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction3.transactionID}`, fakeTransaction3);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy)).toBeTruthy();
            // Then should return true when passing transactions directly as the third parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, result.current.at(1) as Transaction[])).toBeTruthy();
        });

        it('should return false if the report is closed', async () => {
            // Given a closed report, a policy, and a transaction
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
            };
            Onyx.multiSet({
                [ONYXKEYS.COLLECTION.REPORT]: fakeReport,
                [ONYXKEYS.COLLECTION.TRANSACTION]: fakeTransaction,
            });
            await waitForBatchedUpdates();
            // Then, canApproveIOU should return false since the report is closed
            expect(canApproveIOU(fakeReport, fakePolicy)).toBeFalsy();
            // Then should return false when passing transactions directly as the third parameter instead of relying on Onyx data
            expect(canApproveIOU(fakeReport, fakePolicy, [fakeTransaction])).toBeFalsy();
        });
    });

    describe('canUnapproveIOU', () => {
        it('should return false if the report is waiting for a bank account', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'A',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
                managerID: RORY_ACCOUNT_ID,
            };
            expect(canUnapproveIOU(fakeReport, undefined)).toBeFalsy();
        });
    });

    describe('canCancelPayment', () => {
        it('should return true if the report is waiting for a bank account', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'A',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
                managerID: RORY_ACCOUNT_ID,
            };
            expect(canCancelPayment(fakeReport, {accountID: RORY_ACCOUNT_ID})).toBeTruthy();
        });
    });

    describe('canIOUBePaid', () => {
        it('should return false if the report has negative total and onlyShowPayElsewhere is false', () => {
            const policyChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number('AA')),
                id: 'AA',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'AA',
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: CARLOS_ACCOUNT_ID,
                managerID: RORY_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
                total: 100, // positive amount in the DB means negative amount in the UI
            };

            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, [], false, undefined, undefined, false)).toBeFalsy();
            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, [], true, undefined, undefined, false)).toBeTruthy();
        });
    });

    describe('calculateDiffAmount', () => {
        it('should return 0 if iouReport is undefined', () => {
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: '1',
                amount: 100,
                currency: 'USD',
            };

            expect(calculateDiffAmount(undefined, fakeTransaction, fakeTransaction)).toBe(0);
        });

        it('should return 0 when the currency and amount of the transactions are the same', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: 'USD',
            };

            expect(calculateDiffAmount(fakeReport, fakeTransaction, fakeTransaction)).toBe(0);
        });

        it('should return the difference between the updated amount and the current amount when the currency of the updated and current transactions have the same currency', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                currency: 'USD',
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                amount: 100,
                currency: 'USD',
            };
            const updatedTransaction = {
                ...fakeTransaction,
                amount: 200,
                currency: 'USD',
            };

            expect(calculateDiffAmount(fakeReport, updatedTransaction, fakeTransaction)).toBe(-100);
        });

        it('should return null when the currency of the updated and current transactions have different values', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                amount: 100,
                currency: 'USD',
            };
            const updatedTransaction = {
                ...fakeTransaction,
                amount: 200,
                currency: 'EUR',
            };

            expect(calculateDiffAmount(fakeReport, updatedTransaction, fakeTransaction)).toBeNull();
        });
    });

    describe('initMoneyRequest', () => {
        const fakeReport: Report = {
            ...createRandomReport(0, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: '1',
            managerID: CARLOS_ACCOUNT_ID,
        };
        const fakePolicy: Policy = {
            ...createRandomPolicy(1),
            type: CONST.POLICY.TYPE.TEAM,
            outputCurrency: 'USD',
        };

        const fakeParentReport: Report = {
            ...createRandomReport(1, undefined),
            reportID: fakeReport.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: '1',
            managerID: CARLOS_ACCOUNT_ID,
        };
        const fakePersonalPolicy: Policy = {
            ...createRandomPolicy(2),
            type: CONST.POLICY.TYPE.PERSONAL,
            outputCurrency: 'NZD',
        };
        const transactionResult: Transaction = {
            amount: 0,
            comment: {
                attendees: [
                    {
                        email: currentUserPersonalDetails.email ?? '',
                        login: currentUserPersonalDetails.login,
                        accountID: 3,
                        text: currentUserPersonalDetails.login,
                        selected: true,
                        reportID: '0',
                        avatarUrl: SafeString(currentUserPersonalDetails.avatar) ?? '',
                        displayName: currentUserPersonalDetails.displayName ?? '',
                    },
                ],
            },
            created: '2025-04-01',
            currency: 'USD',
            iouRequestType: 'manual',
            reportID: fakeReport.reportID,
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            isFromGlobalCreate: true,
            merchant: '(none)',
        };

        const currentDate = '2025-04-01';
        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, null);
            await Onyx.merge(`${ONYXKEYS.CURRENT_DATE}`, currentDate);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePersonalPolicy.id}`, fakePersonalPolicy);
            return waitForBatchedUpdates();
        });

        it('should merge transaction draft onyx value', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });

        it('should modify transaction draft when currentIouRequestType is different', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    return initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        isFromGlobalCreate: true,
                        currentIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual({
                        ...transactionResult,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    });
                });
        });
        it('should return personal currency when policy is missing', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    return initMoneyRequest({
                        reportID: fakeReport.reportID,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual({
                        ...transactionResult,
                        currency: fakePersonalPolicy.outputCurrency,
                    });
                });
        });
    });

    describe('updateMoneyRequestAmountAndCurrency', () => {
        it('update the amount of the money request successfully', async () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            mockFetch?.pause?.();

            updateMoneyRequestAmountAndCurrency({
                transactionID: fakeTransaction.transactionID,
                transactionThreadReportID: fakeReport.reportID,
                amount: 20000,
                currency: CONST.CURRENCY.USD,
                taxAmount: 0,
                taxCode: '',
                policy: {
                    id: '123',
                    role: CONST.POLICY.ROLE.USER,
                    type: CONST.POLICY.TYPE.TEAM,
                    name: '',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                },
                policyTagList: {},
                policyCategories: {},
                transactions: {},
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
            });

            await waitForBatchedUpdates();
            mockFetch?.succeed?.();
            await mockFetch?.resume?.();

            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`];
                        resolve(newTransaction);
                    },
                });
            });
            expect(updatedTransaction?.modifiedAmount).toBe(20000);
        });

        it('update the amount of the money request failed', async () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            mockFetch?.pause?.();

            updateMoneyRequestAmountAndCurrency({
                transactionID: fakeTransaction.transactionID,
                transactionThreadReportID: fakeReport.reportID,
                amount: 20000,
                currency: CONST.CURRENCY.USD,
                taxAmount: 0,
                taxCode: '',
                policy: {
                    id: '123',
                    role: CONST.POLICY.ROLE.USER,
                    type: CONST.POLICY.TYPE.TEAM,
                    name: '',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                },
                policyTagList: {},
                policyCategories: {},
                transactions: {},
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
            });

            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();

            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`];
                        resolve(newTransaction);
                    },
                });
            });
            expect(updatedTransaction?.modifiedAmount).toBe(0);
        });
    });

    describe('updateMoneyRequestAmountAndCurrency', () => {
        it('removes AUTO_REPORTED_REJECTED_EXPENSE violation when the submitter edits the expense', async () => {
            const transactionID = 'txn1';
            const transactionThreadReportID = 'thread1';
            const expenseReportID = 'report1';
            const policyID = '42';
            const TEST_USER_ACCOUNT_ID = 1;
            const TEST_USER_LOGIN = 'test@test.com';

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: TEST_USER_ACCOUNT_ID,
                policyID,
            };

            const transactionThread: Report = {
                ...createRandomReport(2, undefined),
                reportID: transactionThreadReportID,
                parentReportID: expenseReportID,
                parentReportActionID: 'parentAction',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: expenseReportID,
                amount: 10000,
                currency: CONST.CURRENCY.USD,
            };

            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
            };

            await Onyx.set(ONYXKEYS.SESSION, {accountID: TEST_USER_ACCOUNT_ID, email: TEST_USER_LOGIN});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThread);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
                {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
            ]);
            await waitForBatchedUpdates();

            updateMoneyRequestAmountAndCurrency({
                transactionID,
                transactionThreadReportID,
                amount: 20000,
                currency: CONST.CURRENCY.USD,
                taxAmount: 0,
                taxCode: '',
                policy,
                policyTagList: {},
                policyCategories: {},
                transactions: {},
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
            });

            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(updatedViolations).toEqual([]);
        });
    });

    describe('cancelPayment', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('pendingAction is not null after canceling the payment failed', async () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            // Which owns a workspace
            await waitForBatchedUpdates();
            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: "Carlos's Workspace",
            });
            await waitForBatchedUpdates();

            // Get the policy expense chat report
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                },
            });

            if (chatReport) {
                // When an IOU expense is submitted to that policy expense chat
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: RORY_EMAIL,
                        payeeAccountID: RORY_ACCOUNT_ID,
                        participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                    },
                    transactionParams: {
                        amount,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant,
                        comment,
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    transactionViolations: {},
                });
            }
            await waitForBatchedUpdates();

            // And given an expense report has now been created which holds the IOU
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                },
            });

            if (chatReport && expenseReport) {
                mockFetch?.pause?.();
                // And when the payment is cancelled
                cancelPayment(expenseReport, chatReport, {} as Policy, true, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true);
            }
            await waitForBatchedUpdates();

            mockFetch?.fail?.();

            await mockFetch?.resume?.();

            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                callback: (allReportActions) => {
                    const action = Object.values(allReportActions ?? {}).find((a) => a?.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED);
                    expect(action?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                },
            });
        });
    });

    describe('payMoneyRequest', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('pendingAction is not null after paying the money request', async () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            // Which owns a workspace
            await waitForBatchedUpdates();
            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: "Carlos's Workspace",
            });
            await waitForBatchedUpdates();

            // Get the policy expense chat report
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                },
            });

            if (chatReport) {
                // When an IOU expense is submitted to that policy expense chat
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: RORY_EMAIL,
                        payeeAccountID: RORY_ACCOUNT_ID,
                        participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                    },
                    transactionParams: {
                        amount,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant,
                        comment,
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    transactionViolations: {},
                });
            }
            await waitForBatchedUpdates();

            // And given an expense report has now been created which holds the IOU
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                },
            });

            // When the expense report is paid elsewhere (but really, any payment option would work)
            if (chatReport && expenseReport) {
                mockFetch?.pause?.();
                payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, chatReport, expenseReport, undefined);
            }
            await waitForBatchedUpdates();

            mockFetch?.fail?.();

            await mockFetch?.resume?.();

            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                callback: (allReportActions) => {
                    const action = Object.values(allReportActions ?? {}).find((a) => {
                        const originalMessage = isMoneyRequestAction(a) ? getOriginalMessage(a) : undefined;
                        return originalMessage?.type === 'pay';
                    });
                    expect(action?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                },
            });
        });
    });

    describe('initSplitExpense', () => {
        it('should initialize split expense with correct transaction details', async () => {
            const transaction: Transaction = {
                transactionID: '123',
                amount: 100,
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    splitExpenses: [],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
            };

            let allTransactions: OnyxCollection<Transaction>;
            let allReports: OnyxCollection<Report>;
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

            initSplitExpense(allTransactions, allReports, transaction);
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`);

            expect(draftTransaction).toBeTruthy();

            const splitExpenses = draftTransaction?.comment?.splitExpenses;
            expect(splitExpenses).toHaveLength(2);
            expect(draftTransaction?.amount).toBe(100);
            expect(draftTransaction?.currency).toBe('USD');
            expect(draftTransaction?.merchant).toBe('Test Merchant');

            expect(splitExpenses?.[0].amount).toBe(50);
            expect(splitExpenses?.[0].description).toBe('Test comment');
            expect(splitExpenses?.[0].category).toBe('Food');
            expect(splitExpenses?.[0].tags).toEqual(['lunch']);

            expect(splitExpenses?.[1].amount).toBe(50);
            expect(splitExpenses?.[1].description).toBe('Test comment');
            expect(splitExpenses?.[1].category).toBe('Food');
            expect(splitExpenses?.[1].tags).toEqual(['lunch']);
        });
        it('should not initialize split expense for null transaction', async () => {
            const transaction: Transaction | undefined = undefined;

            let allTransactions: OnyxCollection<Transaction>;
            let allReports: OnyxCollection<Report>;
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

            initSplitExpense(allTransactions, allReports, transaction);
            await waitForBatchedUpdates();

            expect(transaction).toBeFalsy();
        });

        it('should initialize split expense with correct VND currency amounts', async () => {
            const transaction: Transaction = {
                transactionID: '123',
                amount: 1700,
                currency: 'VND',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    splitExpenses: [],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
            };

            let allTransactions: OnyxCollection<Transaction>;
            let allReports: OnyxCollection<Report>;
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

            initSplitExpense(allTransactions, allReports, transaction);
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`);

            expect(draftTransaction).toBeTruthy();

            const splitExpenses = draftTransaction?.comment?.splitExpenses;
            expect(splitExpenses).toHaveLength(2);
            expect(draftTransaction?.amount).toBe(1700);
            expect(draftTransaction?.currency).toBe('VND');
            expect((splitExpenses?.[0]?.amount ?? 0) + (splitExpenses?.[1]?.amount ?? 0)).toBe(1700);
            expect(splitExpenses?.[0]?.amount).toBe(900);
            expect(splitExpenses?.[1]?.amount).toBe(800);
        });
    });

    describe('addSplitExpenseField', () => {
        it('should add new split expense field to draft transaction', async () => {
            const transaction: Transaction = {
                transactionID: '123',
                amount: 100,
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    splitExpenses: [],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
            };

            const draftTransaction: Transaction = {
                transactionID: '123',
                amount: 100,
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    splitExpenses: [
                        {
                            transactionID: '789',
                            amount: 50,
                            description: 'Test comment',
                            category: 'Food',
                            tags: ['lunch'],
                            created: DateUtils.getDBTime(),
                        },
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
            };

            addSplitExpenseField(transaction, draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`);
            expect(updatedDraftTransaction).toBeTruthy();

            const splitExpenses = updatedDraftTransaction?.comment?.splitExpenses;
            expect(splitExpenses).toHaveLength(2);
            expect(splitExpenses?.[1].amount).toBe(0);
            expect(splitExpenses?.[1].description).toBe('Test comment');
            expect(splitExpenses?.[1].category).toBe('Food');
            expect(splitExpenses?.[1].tags).toEqual(['lunch']);
        });

        it('should preserve reimbursable field when adding new split to card transaction', async () => {
            // Setup: Card transaction (reimbursable: false)
            const cardTransaction: Transaction = {
                transactionID: '123',
                amount: 100,
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Card transaction',
                    splitExpenses: [],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
                reimbursable: false, // Card transaction - not reimbursable
            };

            const draftTransaction: Transaction = {
                transactionID: '123',
                amount: 100,
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Card transaction',
                    splitExpenses: [
                        {
                            transactionID: '789',
                            amount: 50,
                            description: 'Card transaction',
                            category: 'Food',
                            tags: ['lunch'],
                            created: DateUtils.getDBTime(),
                            reimbursable: false, // Existing split - not reimbursable
                        },
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
                reimbursable: false,
            };

            // Action: Add a new split expense field
            addSplitExpenseField(cardTransaction, draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${cardTransaction.transactionID}`);
            expect(updatedDraftTransaction).toBeTruthy();

            const splitExpenses = updatedDraftTransaction?.comment?.splitExpenses;
            expect(splitExpenses).toHaveLength(2);

            // Verify: The new split should have reimbursable: false (not counted as out-of-pocket)
            expect(splitExpenses?.[1].reimbursable).toBe(false);
            expect(splitExpenses?.[1].amount).toBe(0);
            expect(splitExpenses?.[1].description).toBe('Card transaction');
            expect(splitExpenses?.[1].category).toBe('Food');
            expect(splitExpenses?.[1].tags).toEqual(['lunch']);

            // Verify: The existing split should still have reimbursable: false
            expect(splitExpenses?.[0].reimbursable).toBe(false);
        });
    });

    describe('evenlyDistributeSplitExpenseAmounts', () => {
        it('distributes evenly across 3 splits with remainder on last split', async () => {
            const originalTransactionID = 'orig-last';
            const draftTransaction: Transaction = {
                transactionID: 'draft-2',
                amount: 100, // in cents = $1.00
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: 'x', amount: 0, description: 'X', created: DateUtils.getDBTime()},
                        {transactionID: 'y', amount: 0, description: 'Y', created: DateUtils.getDBTime()},
                        {transactionID: 'z', amount: 0, description: 'Z', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-2',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            expect(updatedDraft).toBeTruthy();
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([33, 33, 34]);
        });

        it('assigns full amount when there is only one split', async () => {
            const originalTransactionID = 'orig-single';
            const draftTransaction: Transaction = {
                transactionID: 'draft-3',
                amount: 1000, // in cents = $10.00
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [{transactionID: 'only', amount: 0, description: 'Only', created: DateUtils.getDBTime()}],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-3',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([1000]);
        });

        it('evenly distributes equal split with no remainder (4-way $1.00 -> 25¢ each)', async () => {
            const originalTransactionID = 'orig-equal-4';
            const draftTransaction: Transaction = {
                transactionID: 'draft-4',
                amount: 100, // in cents = $1.00
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: '1', amount: 0, description: '1', created: DateUtils.getDBTime()},
                        {transactionID: '2', amount: 0, description: '2', created: DateUtils.getDBTime()},
                        {transactionID: '3', amount: 0, description: '3', created: DateUtils.getDBTime()},
                        {transactionID: '4', amount: 0, description: '4', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-4',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([25, 25, 25, 25]);
        });

        it('2-way split equal (even cents) -> 50¢ / 50¢', async () => {
            const originalTransactionID = 'orig-2-equal';
            const draftTransaction: Transaction = {
                transactionID: 'draft-5',
                amount: 100, // in cents = $1.00
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: 'a', amount: 0, description: 'A', created: DateUtils.getDBTime()},
                        {transactionID: 'b', amount: 0, description: 'B', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-5',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([50, 50]);
        });

        it('2-way split with remainder (odd cents) -> 50¢ / 51¢', async () => {
            const originalTransactionID = 'orig-2-rem';
            const draftTransaction: Transaction = {
                transactionID: 'draft-6',
                amount: 101, // in cents = $1.01
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: 'a', amount: 0, description: 'A', created: DateUtils.getDBTime()},
                        {transactionID: 'b', amount: 0, description: 'B', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-6',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([50, 51]);
        });

        it('3-way split of $1001 with remainder -> [$333.66, $333.66, $333.68]', async () => {
            const originalTransactionID = 'orig-1001-3-last';
            const draftTransaction: Transaction = {
                transactionID: 'draft-7',
                amount: 100100, // in cents = $1001.00
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: 'p', amount: 0, description: 'P', created: DateUtils.getDBTime()},
                        {transactionID: 'q', amount: 0, description: 'Q', created: DateUtils.getDBTime()},
                        {transactionID: 'r', amount: 0, description: 'R', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-7',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([33366, 33366, 33368]);
            expect(amounts.reduce((a, b) => a + b, 0)).toBe(100100);
        });

        it('preserves negative sign and evenly distributes with remainder on last for 3-way split', async () => {
            const originalTransactionID = 'orig-neg-3';
            const draftTransaction: Transaction = {
                transactionID: 'draft-neg-3',
                amount: -100, // in cents = -$1.00
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Negative amount test',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: 'n1', amount: 0, description: 'N1', created: DateUtils.getDBTime()},
                        {transactionID: 'n2', amount: 0, description: 'N2', created: DateUtils.getDBTime()},
                        {transactionID: 'n3', amount: 0, description: 'N3', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-neg-3',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([-33, -33, -34]);
            expect(amounts.reduce((a, b) => a + b, 0)).toBe(-100);
        });

        it('preserves negative sign for 2-way odd-cent split -> [-$0.51, -$0.50]', async () => {
            const originalTransactionID = 'orig-neg-2';
            const draftTransaction: Transaction = {
                transactionID: 'draft-neg-2',
                amount: -101, // in cents = -$1.01
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Negative amount test 2-way',
                    originalTransactionID,
                    splitExpenses: [
                        {transactionID: 'nA', amount: 0, description: 'NA', created: DateUtils.getDBTime()},
                        {transactionID: 'nB', amount: 0, description: 'NB', created: DateUtils.getDBTime()},
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                created: DateUtils.getDBTime(),
                reportID: 'rep-neg-2',
            };

            evenlyDistributeSplitExpenseAmounts(draftTransaction);
            await waitForBatchedUpdates();

            const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            const amounts = (updatedDraft?.comment?.splitExpenses ?? []).map((x) => x.amount);
            expect(amounts).toEqual([-50, -51]);
            expect(amounts.reduce((a, b) => a + b, 0)).toBe(-101);
        });
    });

    describe('updateSplitExpenseAmountField', () => {
        it('should update amount expense field to draft transaction', async () => {
            const originalTransactionID = '123';
            const currentTransactionID = '789';
            const draftTransaction: Transaction = {
                transactionID: '234',
                amount: 100,
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: {
                    comment: 'Test comment',
                    originalTransactionID,
                    splitExpenses: [
                        {
                            transactionID: currentTransactionID,
                            amount: 50,
                            description: 'Test comment',
                            category: 'Food',
                            tags: ['lunch'],
                            created: DateUtils.getDBTime(),
                        },
                    ],
                    attendees: [],
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                },
                category: 'Food',
                tag: 'lunch',
                created: DateUtils.getDBTime(),
                reportID: '456',
            };

            updateSplitExpenseAmountField(draftTransaction, currentTransactionID, 20);
            await waitForBatchedUpdates();

            const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
            expect(updatedDraftTransaction).toBeTruthy();

            const splitExpenses = updatedDraftTransaction?.comment?.splitExpenses;
            expect(splitExpenses?.[0].amount).toBe(20);
        });
    });

    describe('replaceReceipt', () => {
        it('should replace the receipt of the transaction', async () => {
            const transactionID = '123';
            const file = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
            file.source = 'test';
            const source = 'test';

            const transaction = {
                transactionID,
                receipt: {
                    source: 'test1',
                },
            };

            // Given a transaction with a receipt
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            // Given a snapshot of the transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${unapprovedCashHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
                },
            });
            await waitForBatchedUpdates();

            // When the receipt is replaced
            replaceReceipt({transactionID, file, source});
            await waitForBatchedUpdates();

            // Then the transaction should have the new receipt source
            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                        resolve(newTransaction);
                    },
                });
            });
            expect(updatedTransaction?.receipt?.source).toBe(source);

            // Then the snapshot should have the new receipt source
            const updatedSnapshot = await new Promise<OnyxEntry<SearchResults>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.SNAPSHOT,
                    waitForCollectionCallback: true,
                    callback: (snapshots) => {
                        Onyx.disconnect(connection);
                        const newSnapshot = snapshots[`${ONYXKEYS.COLLECTION.SNAPSHOT}${unapprovedCashHash}`];
                        resolve(newSnapshot);
                    },
                });
            });

            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
        });

        it('should add receipt if it does not exist', async () => {
            const transactionID = '123';
            const file = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
            file.source = 'test';
            const source = 'test';

            const transaction = {
                transactionID,
            };

            // Given a transaction without a receipt
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            // Given a snapshot of the transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${unapprovedCashHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
                },
            });
            await waitForBatchedUpdates();

            // When the receipt is replaced
            replaceReceipt({transactionID, file, source});
            await waitForBatchedUpdates();

            // Then the transaction should have the new receipt source
            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                        resolve(newTransaction);
                    },
                });
            });
            expect(updatedTransaction?.receipt?.source).toBe(source);

            // Then the snapshot should have the new receipt source
            const updatedSnapshot = await new Promise<OnyxEntry<SearchResults>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.SNAPSHOT,
                    waitForCollectionCallback: true,
                    callback: (snapshots) => {
                        Onyx.disconnect(connection);
                        const newSnapshot = snapshots[`${ONYXKEYS.COLLECTION.SNAPSHOT}${unapprovedCashHash}`];
                        resolve(newSnapshot);
                    },
                });
            });

            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
        });
    });

    describe('changeTransactionsReport', () => {
        it('should set the correct optimistic onyx data for reporting a tracked expense', async () => {
            let personalDetailsList: OnyxEntry<PersonalDetailsList>;
            let expenseReport: OnyxEntry<Report>;
            let transaction: OnyxEntry<Transaction>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            const creatorPersonalDetails = personalDetailsList?.[CARLOS_ACCOUNT_ID] ?? {accountID: CARLOS_ACCOUNT_ID};

            const policyID = generatePolicyID();
            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: "Carlos's Workspace",
                policyID,
                currency: CONST.CURRENCY.USD,
            });

            await waitForBatchedUpdates();

            createNewReport(creatorPersonalDetails, true, false, policyID);
            // Create a tracked expense
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };

            const amount = 100;

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
            });
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    transaction = Object.values(allTransactions ?? {}).find((t) => !!t);
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
                const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.reportID}`, {canBeMissing: true});
                return {report};
            });

            await waitFor(() => {
                expect(result.current.report).toBeDefined();
            });

            changeTransactionsReport([transaction?.transactionID], false, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, result.current.report);

            let updatedTransaction: OnyxEntry<Transaction>;
            let updatedIOUReportActionOnSelfDMReport: OnyxEntry<ReportAction>;
            let updatedTrackExpenseActionableWhisper: OnyxEntry<ReportAction>;
            let updatedExpenseReport: OnyxEntry<Report>;

            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    updatedTransaction = Object.values(allTransactions ?? {}).find((t) => t?.transactionID === transaction?.transactionID);
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
                });

                // Change the approval mode for the policy since default is Submit and Close
                setWorkspaceApprovalMode(policyID, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC);
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

                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    hash: -2,
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU: undefined,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
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
                });

                // Change the approval mode for the policy since default is Submit and Close
                setWorkspaceApprovalMode(policyID, RORY_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC);
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

                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    hash: -2,
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU: undefined,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
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
                });

                setWorkspaceApprovalMode(policyID, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC);
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

                // it should use splitExpensesTotal in its calculation
                updateSplitTransactionsFromSplitExpensesFlow({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                        originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                        splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                        splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                    },
                    hash: -2,
                    policyCategories: undefined,
                    policy: undefined,
                    policyRecentlyUsedCategories: [],
                    iouReport: expenseReport,
                    firstIOU: undefined,
                    isASAPSubmitBetaEnabled: false,
                    currentUserPersonalDetails,
                    transactionViolations: {},
                });
                await waitForBatchedUpdates();

                const split1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}235`);
                const split2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}236`);

                expect(split1).toBeDefined();
                expect(split2).toBeDefined();
            });
        });
    });

    describe('getIOUReportActionToApproveOrPay', () => {
        it('should exclude deleted actions', async () => {
            const reportID = '1';
            const policyID = '2';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                type: CONST.POLICY.TYPE.TEAM,
            };

            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 27,
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: undefined,
            };
            const fakeTransaction3: Transaction = {
                ...createRandomTransaction(2),
                reportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction3.transactionID}`, fakeTransaction3);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            const deletedReportAction = {
                reportActionID: '0',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 18:70:44.171',
                childReportID: reportID,
            };

            const MOCK_REPORT_ACTIONS: ReportActions = {
                [deletedReportAction.reportActionID]: deletedReportAction,
                [reportID]: {
                    reportActionID: reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    created: '2024-08-08 19:70:44.171',
                    childReportID: reportID,
                    message: [
                        {
                            type: 'TEXT',
                            text: 'Hello world!',
                        },
                    ],
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`, MOCK_REPORT_ACTIONS);

            expect(getIOUReportActionToApproveOrPay(fakeReport, undefined)).toMatchObject(MOCK_REPORT_ACTIONS[reportID]);
        });
    });

    describe('mergeDuplicates', () => {
        let writeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                // Apply optimistic data for testing
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            return Onyx.clear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        const createMockTransaction = (id: string, reportID: string, amount = 100): Transaction => ({
            ...createRandomTransaction(Number(id)),
            transactionID: id,
            reportID,
            amount,
            created: '2024-01-01 12:00:00',
            currency: 'EUR',
            merchant: 'Test Merchant',
            modifiedMerchant: 'Updated Merchant',
            comment: {comment: 'Updated comment'},
            category: 'Travel',
            tag: 'UpdatedProject',
            billable: true,
            reimbursable: false,
        });

        const createMockReport = (reportID: string, total = 300): Report => ({
            ...createRandomReport(Number(reportID), undefined),
            reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            total,
        });

        const createMockViolations = () => [
            {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION},
            {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
        ];

        const createMockIouAction = (transactionID: string, reportActionID: string, childReportID: string): ReportAction => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: '2024-01-01 12:00:00',
            originalMessage: {
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            } as OriginalMessageIOU,
            message: [{type: 'TEXT', text: 'Test IOU message'}],
            childReportID,
        });

        it('should merge duplicate transactions successfully', async () => {
            // Given: Set up test data with main transaction and duplicates
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicate2ID = 'dup789';
            const duplicateTransactionIDs = [duplicate1ID, duplicate2ID];
            const childReportID = 'child123';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID, 150);
            const duplicateTransaction1 = createMockTransaction(duplicate1ID, reportID, 100);
            const duplicateTransaction2 = createMockTransaction(duplicate2ID, reportID, 50);
            const expenseReport = createMockReport(reportID, 300);

            const mainViolations = createMockViolations();
            const duplicate1Violations = createMockViolations();
            const duplicate2Violations = createMockViolations();

            const iouAction1 = createMockIouAction(duplicate1ID, 'action456', childReportID);
            const iouAction2 = createMockIouAction(duplicate2ID, 'action789', childReportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`, duplicateTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicate1Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`, duplicate2Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                action456: iouAction1,
                action789: iouAction2,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`, {});
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                comment: {comment: 'Updated comment'},
                category: 'Travel',
                created: '2024-01-01 12:00:00',
                currency: CONST.CURRENCY.EUR,
                modifiedMerchant: 'Updated Merchant',
                reimbursable: false,
                tag: 'UpdatedProject',
            });

            // Then: Verify duplicate transactions were removed
            const removedDuplicate1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`);
            const removedDuplicate2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`);
            expect(removedDuplicate1).toBeFalsy();
            expect(removedDuplicate2).toBeFalsy();

            // Then: Verify violations were filtered to remove DUPLICATED_TRANSACTION
            const updatedMainViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`);
            const updatedDup1Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`);
            const updatedDup2Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`);

            expect(updatedMainViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            expect(updatedDup1Violations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            expect(updatedDup2Violations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

            // Then: Verify expense report total was updated
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            expect(updatedReport?.total).toBe(150); // 300 - 100 - 50 = 150

            // Then: Verify IOU actions were marked as deleted
            const updatedReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            expect(getOriginalMessage(updatedReportActions?.action456)).toHaveProperty('deleted');
            expect(getOriginalMessage(updatedReportActions?.action789)).toHaveProperty('deleted');

            // Then: Verify API was called with correct parameters
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.MERGE_DUPLICATES,
                expect.objectContaining(mergeParams),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([]),
                    failureData: expect.arrayContaining([]),
                }),
            );
        });

        it('should handle empty duplicate transaction list', async () => {
            // Given: Set up test data with only main transaction
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const expenseReport = createMockReport(reportID, 150);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: [],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates with empty duplicate list
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was still updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                comment: {comment: 'Updated comment'},
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify expense report total remained unchanged (no duplicates to subtract)
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            expect(updatedReport?.total).toBe(150);
        });

        it('should handle missing expense report gracefully', async () => {
            // Given: Set up test data without expense report
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicateTransactionIDs = [duplicate1ID];

            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const duplicateTransaction = createMockTransaction(duplicate1ID, reportID, 50);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});
            await waitForBatchedUpdates();

            const mergeParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call mergeDuplicates without expense report
            mergeDuplicates(mergeParams);
            await waitForBatchedUpdates();

            // Then: Verify function completed without errors
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify API was still called
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.MERGE_DUPLICATES, expect.objectContaining({}), expect.objectContaining({}));
        });
    });

    describe('resolveDuplicates', () => {
        let writeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            global.fetch = getGlobalFetchMock();
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            writeSpy = jest.spyOn(API, 'write').mockImplementation((command, params, options) => {
                // Apply optimistic data for testing
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        } else if (update.onyxMethod === Onyx.METHOD.SET) {
                            Onyx.set(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });
            return Onyx.clear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        const createMockTransaction = (id: string, reportID: string, amount = 100): Transaction => ({
            ...createRandomTransaction(Number(id)),
            transactionID: id,
            reportID,
            amount,
            created: '2024-01-01 12:00:00',
            currency: 'EUR',
            merchant: 'Test Merchant',
            modifiedMerchant: 'Updated Merchant',
            comment: {comment: 'Updated comment'},
            category: 'Travel',
            tag: 'UpdatedProject',
            billable: true,
            reimbursable: false,
        });

        const createMockViolations = () => [
            {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION},
            {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
        ];

        const createMockIouAction = (transactionID: string, reportActionID: string, childReportID: string) => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
            message: [{type: 'TEXT', text: 'Test IOU message'}],
            childReportID,
        });

        it('should resolve duplicate transactions successfully', async () => {
            // Given: Set up test data with main transaction and duplicates
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicate2ID = 'dup789';
            const duplicateTransactionIDs = [duplicate1ID, duplicate2ID];
            const childReportID1 = 'child456';
            const childReportID2 = 'child789';
            const mainChildReportID = 'mainChild123';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID, 150);
            const duplicateTransaction1 = createMockTransaction(duplicate1ID, reportID, 100);
            const duplicateTransaction2 = createMockTransaction(duplicate2ID, reportID, 50);

            const mainViolations = createMockViolations();
            const duplicate1Violations = createMockViolations();
            const duplicate2Violations = createMockViolations();

            const iouAction1 = createMockIouAction(duplicate1ID, 'action456', childReportID1);
            const iouAction2 = createMockIouAction(duplicate2ID, 'action789', childReportID2);
            const mainIouAction = createMockIouAction(mainTransactionID, 'mainAction123', mainChildReportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`, duplicateTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicate1Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`, duplicate2Violations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                action456: iouAction1,
                action789: iouAction2,
                mainAction123: mainIouAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID1}`, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID2}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call resolveDuplicates
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                comment: {comment: 'Updated comment'},
                category: 'Travel',
                created: '2024-01-01 12:00:00',
                currency: CONST.CURRENCY.EUR,
                modifiedMerchant: 'Updated Merchant',
                reimbursable: false,
                tag: 'UpdatedProject',
            });

            // Then: Verify duplicate transactions still exist (unlike mergeDuplicates)
            const duplicateTransaction1Updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`);
            const duplicateTransaction2Updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate2ID}`);
            expect(duplicateTransaction1Updated).not.toBeNull();
            expect(duplicateTransaction2Updated).not.toBeNull();

            // Then: Verify violations were updated - main transaction should not have DUPLICATED_TRANSACTION or HOLD
            const updatedMainViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`);
            expect(updatedMainViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

            // Then: Verify duplicate transactions have HOLD violation added but DUPLICATED_TRANSACTION removed
            const updatedDup1Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`);
            const updatedDup2Violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate2ID}`);

            expect(updatedDup1Violations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );
            expect(updatedDup2Violations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );

            // Then: Verify hold report actions were created in child report threads
            const childReportActions1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID1}`);
            const childReportActions2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID2}`);

            // Should have hold actions added
            expect(Object.keys(childReportActions1 ?? {})).toHaveLength(1);
            expect(Object.keys(childReportActions2 ?? {})).toHaveLength(1);

            // Then: Verify dismissed violation action was created in main transaction thread
            const mainChildReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mainChildReportID}`);
            expect(Object.keys(mainChildReportActions ?? {})).toHaveLength(1);

            // Then: Verify API was called with correct parameters
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.RESOLVE_DUPLICATES,
                expect.objectContaining({
                    transactionID: mainTransactionID,
                    transactionIDList: duplicateTransactionIDs,
                    reportActionIDList: expect.arrayContaining([]),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    dismissedViolationReportActionID: expect.anything(),
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([]),
                    failureData: expect.arrayContaining([]),
                }),
            );
        });

        it('should return early when transactionID is undefined', async () => {
            // Given: Params with undefined transactionID
            const resolveParams = {
                transactionID: undefined,
                transactionIDList: ['dup456'],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID: 'report123',
            };

            // When: Call resolveDuplicates with undefined transactionID
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify API was not called
            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('should handle empty duplicate transaction list', async () => {
            // Given: Set up test data with only main transaction
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const mainChildReportID = 'mainChild123';

            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const mainViolations = createMockViolations();
            const mainIouAction = createMockIouAction(mainTransactionID, 'mainAction123', mainChildReportID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                mainAction123: mainIouAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mainChildReportID}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: [],
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call resolveDuplicates with empty duplicate list
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify main transaction was still updated
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                billable: true,
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify main transaction violations were still filtered
            const updatedMainViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`);
            expect(updatedMainViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

            // Then: Verify API was called
            // eslint-disable-next-line
            expect(API.write).toHaveBeenCalledWith(WRITE_COMMANDS.RESOLVE_DUPLICATES, expect.objectContaining({}), expect.objectContaining({}));
        });

        it('should handle missing IOU actions gracefully', async () => {
            // Given: Set up test data without IOU actions
            const reportID = 'report123';
            const mainTransactionID = 'main123';
            const duplicate1ID = 'dup456';
            const duplicateTransactionIDs = [duplicate1ID];

            const mainTransaction = createMockTransaction(mainTransactionID, reportID);
            const duplicateTransaction = createMockTransaction(duplicate1ID, reportID);
            const mainViolations = createMockViolations();
            const duplicateViolations = createMockViolations();

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicate1ID}`, duplicateTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mainTransactionID}`, mainViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`, duplicateViolations);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {});
            await waitForBatchedUpdates();

            const resolveParams = {
                transactionID: mainTransactionID,
                transactionIDList: duplicateTransactionIDs,
                created: '2024-01-01 12:00:00',
                merchant: 'Updated Merchant',
                amount: 200,
                currency: CONST.CURRENCY.EUR,
                category: 'Travel',
                comment: 'Updated comment',
                billable: true,
                reimbursable: false,
                tag: 'UpdatedProject',
                receiptID: 123,
                reportID,
            };

            // When: Call resolveDuplicates without IOU actions
            resolveDuplicates(resolveParams);
            await waitForBatchedUpdates();

            // Then: Verify function completed without errors
            const updatedMainTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${mainTransactionID}`);
            expect(updatedMainTransaction).toMatchObject({
                category: 'Travel',
                modifiedMerchant: 'Updated Merchant',
            });

            // Then: Verify violations were still processed
            const updatedDuplicateViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicate1ID}`);
            expect(updatedDuplicateViolations).toEqual(
                expect.arrayContaining([
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ]),
            );

            // Then: Verify API was called
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.RESOLVE_DUPLICATES, expect.objectContaining({}), expect.objectContaining({}));
        });
    });

    describe('getPerDiemExpenseInformation', () => {
        it('should return correct per diem expense information with new chat report', () => {
            // Given: Mock data for per diem expense
            const mockCustomUnit = {
                customUnitID: 'per_diem_123',
                customUnitRateID: 'rate_456',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {
                    dates: {
                        start: '2024-01-15',
                        end: '2024-01-15',
                    },
                },
                subRates: [
                    {
                        id: 'breakfast_1',
                        name: 'Breakfast',
                        rate: 25,
                        quantity: 1,
                    },
                    {
                        id: 'lunch_1',
                        name: 'Lunch',
                        rate: 35,
                        quantity: 1,
                    },
                ],
                quantity: 1,
            };

            const mockParticipant = {
                accountID: 123,
                login: 'test@example.com',
                displayName: 'Test User',
                isPolicyExpenseChat: false,
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                role: CONST.REPORT.ROLE.MEMBER,
            };

            const mockTransactionParams = {
                currency: 'USD',
                created: '2024-01-15',
                category: 'Travel',
                tag: 'Project A',
                customUnit: mockCustomUnit,
                billable: true,
                attendees: [],
                reimbursable: true,
                comment: 'Business trip per diem',
            };

            const mockParticipantParams = {
                payeeAccountID: 456,
                payeeEmail: 'payee@example.com',
                participant: mockParticipant,
            };

            const mockPolicyParams = {
                policy: createRandomPolicy(1),
                policyCategories: createRandomPolicyCategories(3),
                policyTagList: createRandomPolicyTags('tagList', 2),
            };

            // When: Call getPerDiemExpenseInformation
            const result = getPerDiemExpenseInformation({
                parentChatReport: {} as OnyxEntry<Report>,
                transactionParams: mockTransactionParams,
                participantParams: mockParticipantParams,
                policyParams: mockPolicyParams,
                recentlyUsedParams: {},
                moneyRequestReportID: '1',
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                hasViolations: false,
            });

            // Then: Verify the result structure and key values
            expect(result).toMatchObject({
                payerAccountID: 123,
                payerEmail: 'test@example.com',
                billable: true,
                reimbursable: true,
            });

            // Verify chat report was created
            expect(result.chatReport).toBeDefined();
            expect(result.chatReport.reportID).toBeDefined();

            // Verify IOU report was created
            expect(result.iouReport).toBeDefined();
            expect(result.iouReport.reportID).toBeDefined();
            expect(result.iouReport.type).toBe(CONST.REPORT.TYPE.IOU);

            // Verify transaction was created with correct per diem data
            expect(result.transaction).toBeDefined();
            expect(result.transaction.transactionID).toBeDefined();
            expect(result.transaction.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(result.transaction.hasEReceipt).toBe(true);
            expect(result.transaction.currency).toBe('USD');
            expect(result.transaction.category).toBe('Travel');
            expect(result.transaction.tag).toBe('Project A');
            expect(result.transaction.comment?.comment).toBe('Business trip per diem');

            // Verify IOU action was created
            expect(result.iouAction).toBeDefined();
            expect(result.iouAction.reportActionID).toBeDefined();
            expect(result.iouAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.IOU);

            // Verify report preview action
            expect(result.reportPreviewAction).toBeDefined();
            expect(result.reportPreviewAction.reportActionID).toBeDefined();

            // Verify Onyx data structure
            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();
            expect(result.onyxData.successData).toBeDefined();
            expect(result.onyxData.failureData).toBeDefined();

            // Verify created action IDs for new reports
            expect(result.createdChatReportActionID).toBeDefined();
            expect(result.createdIOUReportActionID).toBeDefined();
        });

        it('should return correct per diem expense information with existing chat report', () => {
            // Given: Existing chat report
            const existingChatReport = {
                reportID: 'chat_123',
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '123': {
                        accountID: 123,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '456': {
                        accountID: 456,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                iouReportID: 'iou_456',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const mockCustomUnit = {
                customUnitID: 'per_diem_789',
                customUnitRateID: 'rate_101',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {
                    dates: {
                        start: '2024-01-20',
                        end: '2024-01-20',
                    },
                },
                subRates: [
                    {
                        id: 'dinner_1',
                        name: 'Dinner',
                        rate: 45,
                        quantity: 1,
                    },
                ],
                quantity: 2,
            };

            const mockParticipant = {
                accountID: 123,
                login: 'existing@example.com',
                displayName: 'Existing User',
                isPolicyExpenseChat: false,
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                role: CONST.REPORT.ROLE.MEMBER,
            };

            const mockTransactionParams = {
                comment: 'Conference per diem',
                currency: 'USD',
                created: '2024-01-20',
                category: 'Meals',
                tag: 'Conference',
                customUnit: mockCustomUnit,
                billable: false,
                attendees: [],
                reimbursable: true,
            };

            const mockParticipantParams = {
                payeeAccountID: 456,
                payeeEmail: 'payee@example.com',
                participant: mockParticipant,
            };

            // When: Call getPerDiemExpenseInformation with existing chat report
            const result = getPerDiemExpenseInformation({
                parentChatReport: existingChatReport as OnyxEntry<Report>,
                transactionParams: mockTransactionParams as PerDiemExpenseTransactionParams,
                participantParams: mockParticipantParams as RequestMoneyParticipantParams,
                recentlyUsedParams: {},
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                hasViolations: false,
            });

            // Then: Verify the result uses existing chat report
            expect(result.chatReport.reportID).toBe('chat_123');
            expect(result.chatReport.chatType).toBe(CONST.REPORT.CHAT_TYPE.GROUP);

            // Verify transaction has correct per diem data
            expect(result.transaction.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(result.transaction.hasEReceipt).toBe(true);
            expect(result.transaction.currency).toBe('USD');
            expect(result.transaction.category).toBe('Meals');
            expect(result.transaction.tag).toBe('Conference');
            expect(result.transaction.comment?.comment).toBe('Conference per diem');

            // Verify no new chat report action ID since using existing
            expect(result.createdChatReportActionID).toBeUndefined();
        });

        it('should handle policy expense chat correctly', () => {
            // Given: Policy expense chat participant
            const mockParticipant = {
                accountID: 123,
                login: 'policy@example.com',
                displayName: 'Policy User',
                isPolicyExpenseChat: true,
                reportID: 'policy_chat_123',
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                role: CONST.REPORT.ROLE.MEMBER,
            };

            const mockCustomUnit = {
                customUnitID: 'per_diem_policy',
                customUnitRateID: 'rate_policy',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {
                    dates: {
                        start: '2024-01-25',
                        end: '2024-01-25',
                    },
                },
                subRates: [
                    {
                        id: 'lodging_1',
                        name: 'Lodging',
                        rate: 150,
                        quantity: 1,
                    },
                ],
                quantity: 1,
            };

            const mockTransactionParams = {
                comment: 'Policy per diem',
                currency: 'USD',
                created: '2024-01-25',
                category: 'Lodging',
                tag: 'Policy',
                customUnit: mockCustomUnit,
                billable: true,
                attendees: [],
                reimbursable: true,
            };

            const mockParticipantParams = {
                payeeAccountID: 456,
                payeeEmail: 'payee@example.com',
                participant: mockParticipant,
            };

            const mockPolicyParams = {
                policy: createRandomPolicy(2),
            };

            // When: Call getPerDiemExpenseInformation for policy expense chat
            const result = getPerDiemExpenseInformation({
                parentChatReport: {} as OnyxEntry<Report>,
                transactionParams: mockTransactionParams as PerDiemExpenseTransactionParams,
                participantParams: mockParticipantParams as RequestMoneyParticipantParams,
                policyParams: mockPolicyParams,
                recentlyUsedParams: {},
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                hasViolations: false,
            });

            // Then: Verify policy expense chat handling
            expect(result.payerAccountID).toBe(123);
            expect(result.payerEmail).toBe('policy@example.com');
            expect(result.transaction.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(result.transaction.hasEReceipt).toBe(true);
            expect(result.billable).toBe(true);
            expect(result.reimbursable).toBe(true);
        });
    });

    describe('getSendInvoiceInformation', () => {
        it('should return correct invoice information with new chat report', () => {
            // Given: Mock transaction data
            const mockTransaction = {
                transactionID: 'transaction_123',
                reportID: 'report_123',
                amount: 500,
                currency: 'USD',
                created: '2024-01-15',
                merchant: 'Test Company',
                category: 'Services',
                tag: 'Project B',
                taxCode: 'TAX001',
                taxAmount: 50,
                billable: true,
                comment: {
                    comment: 'Invoice for consulting services',
                },
                participants: [
                    {
                        accountID: 123,
                        isSender: true,
                        policyID: 'workspace_123',
                    },
                    {
                        accountID: 456,
                        isSender: false,
                    },
                ],
            };

            const currentUserAccountID = 123;
            const mockPolicy = createRandomPolicy(1);

            const mockPolicyCategories = {
                Services: {
                    name: 'Services',
                    enabled: true,
                },
            };

            const mockPolicyTagList = {
                tagList: {
                    name: 'tagList',
                    orderWeight: 0,
                    required: false,
                    tags: {
                        projectB: {
                            name: 'Project B',
                            enabled: true,
                        },
                    },
                },
            };

            // When: Call getSendInvoiceInformation
            const result = getSendInvoiceInformation(
                mockTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                undefined, // invoiceChatReport
                undefined, // receipt
                mockPolicy,
                mockPolicyTagList as OnyxEntry<PolicyTagLists>,
                mockPolicyCategories,
                'Test Company Inc.',
                'https://testcompany.com',
                ['Services', 'Consulting'],
            );

            // Then: Verify the result structure and key values
            expect(result).toMatchObject({
                senderWorkspaceID: 'workspace_123',
                invoiceReportID: expect.any(String),
                transactionID: expect.any(String),
                transactionThreadReportID: expect.any(String),
                createdIOUReportActionID: expect.any(String),
                reportActionID: expect.any(String),
                createdChatReportActionID: expect.any(String),
                reportPreviewReportActionID: expect.any(String),
            });

            // Verify receiver information
            expect(result.receiver).toBeDefined();
            expect(result.receiver.accountID).toBe(456);

            // Verify invoice room (chat report)
            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.reportID).toBeDefined();
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);

            // Verify Onyx data structure
            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();
            expect(result.onyxData.successData).toBeDefined();
            expect(result.onyxData.failureData).toBeDefined();
        });

        it('should return correct invoice information with existing chat report', () => {
            // Given: Existing invoice chat report
            const existingInvoiceChatReport = {
                reportID: 'invoice_chat_123',
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '123': {
                        accountID: 123,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '456': {
                        accountID: 456,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                invoiceReceiver: {
                    type: 'individual',
                    accountID: 456,
                    displayName: 'Client Company',
                    login: 'client@example.com',
                },
            };

            const mockTransaction = {
                transactionID: 'transaction_456',
                reportID: 'report_456',
                amount: 750,
                currency: 'EUR',
                created: '2024-01-20',
                merchant: 'Client Company',
                category: 'Development',
                tag: 'Project C',
                taxCode: 'TAX002',
                taxAmount: 75,
                billable: true,
                comment: {
                    comment: 'Invoice for development work',
                },
                participants: [
                    {
                        accountID: 123,
                        isSender: true,
                        policyID: 'workspace_456',
                    },
                    {
                        accountID: 456,
                        isSender: false,
                    },
                ],
            };

            const currentUserAccountID = 123;

            // When: Call getSendInvoiceInformation with existing chat report
            const result = getSendInvoiceInformation(
                mockTransaction,
                currentUserAccountID,
                existingInvoiceChatReport as OnyxEntry<Report>,
                undefined, // receipt
                undefined, // policy
                undefined, // policyTagList
                undefined, // policyCategories
                'Client Company Ltd.',
                'https://clientcompany.com',
            );

            // Then: Verify the result uses existing chat report
            expect(result.invoiceRoom.reportID).toBe('invoice_chat_123');
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);

            // Verify transaction data
            expect(result.transactionID).toBeDefined();
            expect(result.senderWorkspaceID).toBe('workspace_456');
        });

        it('should handle receipt attachment correctly', () => {
            // Given: Transaction with receipt
            const mockTransaction = {
                transactionID: 'transaction_789',
                reportID: 'report_789',
                amount: 300,
                currency: 'USD',
                created: '2024-01-25',
                merchant: 'Receipt Company',
                category: 'Equipment',
                tag: 'Hardware',
                taxCode: 'TAX003',
                taxAmount: 30,
                billable: true,
                comment: {
                    comment: 'Invoice with receipt',
                },
                participants: [
                    {
                        accountID: 123,
                        isSender: true,
                        policyID: 'workspace_789',
                    },
                    {
                        accountID: 456,
                        isSender: false,
                    },
                ],
            };

            const mockReceipt = {
                source: 'receipt_source_123',
                name: 'receipt.pdf',
                state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
            };

            const currentUserAccountID = 123;

            // When: Call getSendInvoiceInformation with receipt
            const result = getSendInvoiceInformation(
                mockTransaction,
                currentUserAccountID,
                undefined, // invoiceChatReport
                mockReceipt,
                undefined, // policy
                undefined, // policyTagList
                undefined, // policyCategories
            );

            // Then: Verify receipt handling
            expect(result.transactionID).toBeDefined();
            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);

            // Verify Onyx data includes receipt information
            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();
        });

        it('should handle missing transaction data gracefully', () => {
            // Given: Minimal transaction data
            const mockTransaction = {
                transactionID: 'transaction_minimal',
                reportID: 'report_minimal',
                amount: 100,
                currency: 'USD',
                created: '2024-01-30',
                merchant: 'Minimal Company',
                participants: [
                    {
                        accountID: 123,
                        isSender: true,
                    },
                    {
                        accountID: 456,
                        isSender: false,
                    },
                ],
            };

            const currentUserAccountID = 123;

            // When: Call getSendInvoiceInformation with minimal data
            const result = getSendInvoiceInformation(mockTransaction, currentUserAccountID);

            // Then: Verify function handles missing data gracefully
            expect(result).toBeDefined();
            expect(result.transactionID).toBeDefined();
            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);
            expect(result.receiver).toBeDefined();
            expect(result.onyxData).toBeDefined();
        });
    });

    describe('updateMoneyRequestAttendees', () => {
        it('should update recent attendees', async () => {
            // Given a transaction
            const transaction = createRandomTransaction(1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            // When updating the transaction attendees
            updateMoneyRequestAttendees(
                transaction.transactionID,
                '2',
                [
                    {avatarUrl: '', displayName: 'user 1', email: 'user1@gmail.com'},
                    {avatarUrl: '', displayName: 'user 2', email: 'user2@gmail.com'},
                    {avatarUrl: '', displayName: 'user 3', email: 'user3@gmail.com'},
                    {avatarUrl: '', displayName: 'user 4', email: 'user4@gmail.com'},
                    {avatarUrl: '', displayName: 'user 5', email: 'user5@gmail.com'},
                    {avatarUrl: '', displayName: 'user 6', email: 'user6@gmail.com'},
                ],
                undefined,
                undefined,
                undefined,
                undefined,
                123,
                '',
                false,
            );
            await waitForBatchedUpdates();

            // Then the recent attendees should be updated with a maximum of 5 attendees
            const recentAttendees = await new Promise<OnyxEntry<Attendee[]>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
                    callback: (attendees) => {
                        Onyx.disconnect(connection);
                        resolve(attendees);
                    },
                });
            });
            expect(recentAttendees?.length).toBe(CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW);
        });
    });

    describe('rejectMoneyRequest', () => {
        const amount = 10000;
        const comment = 'This expense is rejected';
        let chatReport: OnyxEntry<Report>;
        let iouReport: OnyxEntry<Report>;
        let transaction: OnyxEntry<Transaction>;
        let policy: OnyxEntry<Policy>;
        const TEST_USER_ACCOUNT_ID = 1;
        const MANAGER_ACCOUNT_ID = 2;
        const ADMIN_ACCOUNT_ID = 3;

        beforeEach(async () => {
            // Set up test data
            policy = createRandomPolicy(1);
            policy.role = CONST.POLICY.ROLE.ADMIN;
            policy.autoReporting = true;
            policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY;

            chatReport = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID: policy?.id,
                type: CONST.REPORT.TYPE.CHAT,
            };

            iouReport = {
                ...createRandomReport(2, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: TEST_USER_ACCOUNT_ID,
                managerID: MANAGER_ACCOUNT_ID,
                total: amount,
                currency: CONST.CURRENCY.USD,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                policyID: policy?.id,
                chatReportID: chatReport?.reportID,
            };

            transaction = {
                ...createRandomTransaction(1),
                reportID: iouReport?.reportID,
                amount,
                currency: CONST.CURRENCY.USD,
                merchant: 'Test Merchant',
                transactionID: '1',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`, chatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`, iouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, transaction);
            await Onyx.set(ONYXKEYS.SESSION, {accountID: ADMIN_ACCOUNT_ID});
            await waitForBatchedUpdates();
        });

        afterEach(async () => {
            await Onyx.clear();
            jest.clearAllMocks();
        });

        it('should reject a money request and return navigation route', async () => {
            // Given: An expense report (not IOU) for testing state update
            const expenseReport = {...iouReport, type: CONST.REPORT.TYPE.EXPENSE};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`, expenseReport);
            await waitForBatchedUpdates();

            // When: Reject the money request
            if (!transaction?.transactionID || !iouReport?.reportID) {
                throw new Error('Required transaction or report data is missing');
            }
            const result = rejectMoneyRequest(transaction.transactionID, iouReport.reportID, comment);

            // Then: Should return navigation route to chat report
            expect(result).toBe(ROUTES.REPORT_WITH_ID.getRoute(iouReport.reportID));
        });

        it('should add AUTO_REPORTED_REJECTED_EXPENSE violation for expense reports', async () => {
            // Given: An expense report (not IOU)
            const expenseReport = {...iouReport, type: CONST.REPORT.TYPE.EXPENSE};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`, expenseReport);
            await waitForBatchedUpdates();

            // When: Reject the money request
            if (!transaction?.transactionID || !iouReport?.reportID) {
                throw new Error('Required transaction or report data is missing');
            }
            rejectMoneyRequest(transaction.transactionID, iouReport.reportID, comment);
            await waitForBatchedUpdates();

            // Then: Verify violation is added
            const violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`);
            expect(violations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                        type: CONST.VIOLATION_TYPES.WARNING,
                        data: expect.objectContaining({
                            comment,
                        }),
                    }),
                ]),
            );
        });
    });

    describe('markRejectViolationAsResolved', () => {
        let transaction: OnyxEntry<Transaction>;
        let iouReport: OnyxEntry<Report>;

        beforeEach(async () => {
            transaction = createRandomTransaction(1);
            iouReport = createRandomReport(1, undefined);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`, iouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`, [
                {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {comment: 'Test reject reason'},
                },
            ]);
            await waitForBatchedUpdates();
        });

        afterEach(async () => {
            await Onyx.clear();
            jest.clearAllMocks();
        });

        it('should remove AUTO_REPORTED_REJECTED_EXPENSE violation', async () => {
            // When: Mark violation as resolved
            if (!transaction?.transactionID || !iouReport?.reportID) {
                throw new Error('Required transaction or report data is missing');
            }
            markRejectViolationAsResolved(transaction.transactionID, iouReport.reportID);
            await waitForBatchedUpdates();

            // Then: Verify violation is removed
            const violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`);
            expect(violations).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    }),
                ]),
            );
        });
    });

    describe('retractReport', () => {
        it('should restore the chat report iouReportID', async () => {
            // Given a chat report with no iouReportID
            const chatReport: Report = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                iouReportID: undefined,
            };
            const policy: OnyxEntry<Policy> = createRandomPolicy(1);

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            // When retracting the submitted expense report
            retractReport(expenseReport, chatReport, policy, 1, 'test@example.com', false, false);

            // Then the chat report iouReportID should be set back to the retracted expense report
            const iouReportID = await new Promise<string | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report?.iouReportID);
                    },
                });
            });
            expect(iouReportID).toBe(expenseReport.reportID);
        });
    });
    describe('approveMoneyRequest with take control', () => {
        const adminAccountID = 1;
        const managerAccountID = 2;
        const employeeAccountID = 3;
        const seniorManagerAccountID = 4;
        const adminEmail = 'admin@test.com';
        const managerEmail = 'manager@test.com';
        const employeeEmail = 'employee@test.com';
        const seniorManagerEmail = 'seniormanager@test.com';

        let expenseReport: Report;
        let policy: Policy;

        beforeEach(async () => {
            await Onyx.clear();

            // Set up personal details
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: {
                    accountID: adminAccountID,
                    login: adminEmail,
                    displayName: 'Admin User',
                },
                [seniorManagerAccountID]: {
                    accountID: seniorManagerAccountID,
                    login: seniorManagerEmail,
                    displayName: 'Senior Manager User',
                },
                [managerAccountID]: {
                    accountID: managerAccountID,
                    login: managerEmail,
                    displayName: 'Manager User',
                },
                [employeeAccountID]: {
                    accountID: employeeAccountID,
                    login: employeeEmail,
                    displayName: 'Employee User',
                },
            });

            // Set up session as admin (who will approve)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: adminEmail,
                accountID: adminAccountID,
            });

            // Create policy with approval hierarchy
            policy = {
                id: '1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                owner: adminEmail,
                ownerAccountID: adminAccountID,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: managerEmail,
                    },
                    [managerEmail]: {
                        email: managerEmail,
                        role: CONST.POLICY.ROLE.USER,
                        forwardsTo: seniorManagerEmail,
                    },
                    [seniorManagerEmail]: {
                        email: seniorManagerEmail,
                        role: CONST.POLICY.ROLE.USER,
                        forwardsTo: adminEmail,
                    },
                    [adminEmail]: {
                        email: adminEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        forwardsTo: '',
                    },
                },
            };

            // Create expense report
            expenseReport = {
                reportID: '123',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: employeeAccountID,
                managerID: managerAccountID,
                policyID: policy.id,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                total: 1000,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('should set report to approved when admin takes control and approves', async () => {
            // Admin takes control
            const takeControlAction = {
                reportActionID: 'takeControl1',
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                actorAccountID: adminAccountID,
                created: '2023-01-01T10:00:00.000Z',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });

            // Admin approves the report
            approveMoneyRequest(expenseReport, policy, adminAccountID, adminEmail, false, false);
            await waitForBatchedUpdates();

            // Should be approved since admin took control and is the last approver
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.APPROVED);
        });

        it('should invalidate take control when report is resubmitted after take control', async () => {
            // Admin takes control first
            const takeControlAction = {
                reportActionID: 'takeControl3',
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                actorAccountID: adminAccountID,
                created: '2023-01-01T10:00:00.000Z',
            };

            // Employee resubmits after take control (invalidates it)
            const submittedAction = {
                reportActionID: 'submitted1',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                actorAccountID: employeeAccountID,
                created: '2023-01-01T11:00:00.000Z', // After take control
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
                [submittedAction.reportActionID]: submittedAction,
            });

            // Set session as manager (normal approver)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            // Manager approves the report
            approveMoneyRequest(expenseReport, policy, managerAccountID, managerEmail, false, false);
            await waitForBatchedUpdates();

            // Should be submitted to senior manager (normal flow) since take control was invalidated
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);

            // Get the optimistic next step
            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);

            // The next step message should be defined
            expect(nextStep?.message).toBeDefined();

            // Since take control was invalidated by resubmission, the normal approval chain applies
            // The next step should indicate waiting for the senior manager to approve
            const fullMessage = nextStep?.message?.map((part) => part.text).join('');
            expect(fullMessage).toBe('Waiting for Senior Manager User to approve %expenses.');
        });

        it('should mention an admin to pay expenses in optimistic next step message when admin takes control and approves', async () => {
            // Admin takes control
            const takeControlAction = {
                reportActionID: 'takeControl2',
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                actorAccountID: adminAccountID,
                created: '2023-01-01T10:00:00.000Z',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });

            // Admin approves the report
            approveMoneyRequest(expenseReport, policy, adminAccountID, adminEmail, false, false);
            await waitForBatchedUpdates();

            // Get the optimistic next step
            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);

            // The next step message should be defined
            expect(nextStep?.message).toBeDefined();

            // Since the report is fully approved when admin takes control and approves,
            // the next step should be about payment, which should mention "you" since the admin is the payer
            // The message should equal "Waiting for you to pay %expenses."
            const fullMessage = nextStep?.message?.map((part) => part.text).join('');
            expect(fullMessage).toBe('Waiting for you to pay %expenses.');
        });
    });

    describe('approveMoneyRequest with normal approval chain', () => {
        const adminAccountID = 1;
        const managerAccountID = 2;
        const employeeAccountID = 3;
        const adminEmail = 'admin@test.com';
        const managerEmail = 'manager@test.com';
        const employeeEmail = 'employee@test.com';

        let expenseReport: Report;
        let policy: Policy;

        beforeEach(async () => {
            await Onyx.clear();

            // Set up personal details
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: {
                    accountID: adminAccountID,
                    login: adminEmail,
                    displayName: 'Admin User',
                },
                [managerAccountID]: {
                    accountID: managerAccountID,
                    login: managerEmail,
                    displayName: 'Manager User',
                },
                [employeeAccountID]: {
                    accountID: employeeAccountID,
                    login: employeeEmail,
                    displayName: 'Employee User',
                },
            });

            // Create policy with approval hierarchy
            policy = {
                id: '1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                owner: adminEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: managerEmail,
                    },
                    [managerEmail]: {
                        email: managerEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: adminEmail,
                        forwardsTo: adminEmail,
                    },
                    [adminEmail]: {
                        email: adminEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: '',
                        forwardsTo: '',
                    },
                },
            };

            // Create expense report
            expenseReport = {
                reportID: '123',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: employeeAccountID,
                managerID: managerAccountID,
                policyID: policy.id,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                total: 1000,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('should follow normal approval chain when manager approves without take control', async () => {
            // Set session as manager (first approver in the chain)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            // Manager approves the report (no take control actions)
            approveMoneyRequest(expenseReport, policy, managerAccountID, managerEmail, false, false);
            await waitForBatchedUpdates();

            // Should be submitted to admin (next in approval chain) since manager is not the final approver
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);
            expect(updatedReport?.managerID).toBe(adminAccountID); // Should be forwarded to admin
        });

        it('should handle multi-step approval chain correctly', async () => {
            // First, manager approves
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            approveMoneyRequest(expenseReport, policy, managerAccountID, managerEmail, false, false);
            await waitForBatchedUpdates();

            // Should be submitted to admin
            let updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);
            expect(updatedReport?.managerID).toBe(adminAccountID);

            // Then, admin approves
            await Onyx.set(ONYXKEYS.SESSION, {
                email: adminEmail,
                accountID: adminAccountID,
            });

            approveMoneyRequest(updatedReport, policy, adminAccountID, adminEmail, false, false);
            await waitForBatchedUpdates();

            // Should be fully approved
            updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.APPROVED);
        });

        it('should fully approve report when single approver approves', async () => {
            // Create a policy with only one approver in the chain
            const singleApproverPolicy: Policy = {
                ...policy,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: managerEmail,
                    },
                    [managerEmail]: {
                        email: managerEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: '',
                        forwardsTo: '',
                    },
                },
            };

            // Create expense report with manager as the only approver
            const singleApproverReport: Report = {
                ...expenseReport,
                reportID: '456',
                managerID: managerAccountID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${singleApproverPolicy.id}`, singleApproverPolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${singleApproverReport.reportID}`, singleApproverReport);

            // Set session as the single approver (manager)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            // Manager approves the report
            approveMoneyRequest(singleApproverReport, singleApproverPolicy, managerAccountID, managerEmail, false, false);
            await waitForBatchedUpdates();

            // Should be fully approved since manager is the final approver in the chain
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${singleApproverReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.APPROVED);
        });
    });

    describe('Invoice recipient change while offline', () => {
        const userAAccountID = 1;
        const userBAccountID = 2;
        const senderAccountID = 3;
        const senderWorkspaceID = 'workspace123';
        const amount = 10000;
        const currency = 'USD';

        let transactionID: string;
        let userAInvoiceReport: Report;

        beforeEach(async () => {
            initOnyxDerivedValues();
            await Onyx.clear();
            await waitForBatchedUpdates();

            // Set up current user as sender
            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'sender@test.com',
                accountID: senderAccountID,
            });

            // Set up personal details for both recipients
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [userAAccountID]: {
                    accountID: userAAccountID,
                    login: 'userA@test.com',
                    displayName: 'User A',
                },
                [userBAccountID]: {
                    accountID: userBAccountID,
                    login: 'userB@test.com',
                    displayName: 'User B',
                },
                [senderAccountID]: {
                    accountID: senderAccountID,
                    login: 'sender@test.com',
                    displayName: 'Sender',
                },
            });

            // Create a draft transaction with User A as initial recipient
            transactionID = rand64();
            const transaction = {
                transactionID,
                reportID: undefined,
                amount,
                currency,
                merchant: 'Test Merchant',
                created: '2024-01-01',
                participants: [
                    {
                        accountID: userAAccountID,
                        login: 'userA@test.com',
                        selected: true,
                    },
                    {
                        policyID: senderWorkspaceID,
                        isSender: true,
                        selected: false,
                    },
                ],
            } as Transaction;

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction);

            // Create invoice report for User A
            userAInvoiceReport = {
                reportID: 'invoiceReportA',
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID: senderWorkspaceID,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: userAAccountID,
                },
            } as Report;

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${userAInvoiceReport.reportID}`, userAInvoiceReport);
        });

        it('should send invoice to correct recipient when recipient is changed while offline', async () => {
            // Step 1: Verify initial state - transaction has User A as recipient
            const initialTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(initialTransaction?.participants?.[0]?.accountID).toBe(userAAccountID);

            // Step 2: User changes recipient to User B while offline
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                participants: [
                    {
                        accountID: userBAccountID,
                        login: 'userB@test.com',
                        selected: true,
                    },
                    {
                        policyID: senderWorkspaceID,
                        isSender: true,
                        selected: false,
                    },
                ],
            });
            await waitForBatchedUpdates();

            // Step 3: Get the updated transaction with User B as recipient
            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(updatedTransaction?.participants?.[0]?.accountID).toBe(userBAccountID);

            // Step 4: Call getSendInvoiceInformation with stale User A report
            // This simulates the bug scenario where the report from route params is stale
            const invoiceInfo = getSendInvoiceInformation(
                updatedTransaction,
                senderAccountID,
                userAInvoiceReport, // Passing stale report for User A
            );

            // Step 5: Verify that the invoice is created for User B, not User A
            // The doesReportReceiverMatchParticipant utility should detect the mismatch
            // and create a new chat report for User B instead of using the stale User A report
            expect(invoiceInfo.receiver.accountID).toBe(userBAccountID);
            expect(invoiceInfo.invoiceRoom.reportID).not.toBe(userAInvoiceReport.reportID);
            expect(invoiceInfo.invoiceRoom.invoiceReceiver?.type).toBe(CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL);
            if (invoiceInfo.invoiceRoom.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
                expect(invoiceInfo.invoiceRoom.invoiceReceiver.accountID).toBe(userBAccountID);
            }
        });
    });
});
