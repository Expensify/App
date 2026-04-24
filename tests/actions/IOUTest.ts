/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {renderHook, waitFor} from '@testing-library/react-native';
import {format} from 'date-fns';
import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxMergeCollectionInput} from 'react-native-onyx';
import type {SearchQueryJSON, SearchStatus} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import {clearAllRelatedReportActionErrors} from '@libs/actions/ClearReportActionErrors';
import {
    calculateDiffAmount,
    createDistanceRequest,
    handleNavigateAfterExpenseCreate,
    initMoneyRequest,
    resetDraftTransactionsCustomUnit,
    setMoneyRequestAmount,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestCreated,
    setMoneyRequestDateAttribute,
    setMoneyRequestDescription,
    setMoneyRequestDistanceRate,
    setMoneyRequestMerchant,
    setMoneyRequestTag,
    shouldOptimisticallyUpdateSearch,
} from '@libs/actions/IOU';
import {putOnHold} from '@libs/actions/IOU/Hold';
import {completeSplitBill, splitBill, startSplitBill, updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/Split';
import {requestMoney, trackExpense} from '@libs/actions/IOU/TrackExpense';
import {removeMoneyRequestOdometerImage, setMoneyRequestOdometerImage} from '@libs/actions/OdometerTransactionUtils';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {createWorkspace, generatePolicyID, setWorkspaceApprovalMode} from '@libs/actions/Policy/Policy';
import {createNewReport, deleteReport, notifyNewAction} from '@libs/actions/Report';
import {subscribeToUserEvents} from '@libs/actions/User';
import type {ApiCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {getManagerMcTestParticipant} from '@libs/OptionsListUtils';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getAllReportActions, getIOUActionForReportID, getOriginalMessage, isActionableTrackExpense, isActionOfType, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReportAction, createDraftTransactionAndNavigateToParticipantSelector, getReportOrDraftReport} from '@libs/ReportUtils';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import DateUtils from '@src/libs/DateUtils';
import * as SearchQueryUtils from '@src/libs/SearchQueryUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastSelectedDistanceRates, PersonalDetailsList, Policy, PolicyTagLists, RecentlyUsedTags, Report, ReportNameValuePairs, SearchResults} from '@src/types/onyx';
import type {Attendee, Participant as IOUParticipant, SplitExpense} from '@src/types/onyx/IOU';
import type {OriginalMessageMovedTransaction} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Participant} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SafeString from '@src/utils/SafeString';
import {changeTransactionsReport} from '../../src/libs/actions/Transaction';
import currencyList from '../unit/currencyList.json';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import type {MockFetch} from '../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData, setPersonalDetails, signInWithTestUser, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

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

const getTransactionAndExpenseReports = (reportID: string) => {
    const transactionReport = getReportOrDraftReport(reportID);
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    const expenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;
    return {transactionReport, expenseReport};
};

const getPolicyTags = async (expenseReportPolicyID: string | undefined) => {
    let allPolicyTags: OnyxCollection<PolicyTagLists>;
    await getOnyxData({
        key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}`,
        waitForCollectionCallback: true,
        callback: (value) => {
            allPolicyTags = value;
        },
    });

    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${expenseReportPolicyID}`] ?? {};
    return policyTags;
};

OnyxUpdateManager();
describe('actions/IOU', () => {
    const currentUserPersonalDetails: CurrentUserPersonalDetails = {
        ...createPersonalDetails(RORY_ACCOUNT_ID),
        login: RORY_EMAIL,
        email: RORY_EMAIL,
        displayName: RORY_EMAIL,
        avatar: 'https://example.com/avatar.jpg',
    };

    const getParticipantsPolicyTags = async (participants: IOUParticipant[]) => {
        let participantsPolicyTags: Record<string, PolicyTagLists> = {};
        await getOnyxData({
            waitForCollectionCallback: true,
            key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}`,
            callback: (tags) => {
                participantsPolicyTags = participants.reduce<Record<string, PolicyTagLists>>((acc, participant) => {
                    if (participant.policyID) {
                        acc[participant.policyID] = tags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${participant.policyID}`] ?? {};
                    }
                    return acc;
                }, {});
            },
        });
        return participantsPolicyTags;
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

        it('when the current hash includes a policyID filter it should only return true if the iou report matches the policyID filter', () => {
            const transaction = {
                ...createRandomTransaction(1),
            };
            const policyID = '12345';
            const currentSearchQueryJSON = {
                type: 'expense',
                status: '',
                sortBy: 'date',
                sortOrder: 'desc',
                policyID: [policyID],
                filters: null,
                inputQuery: `type:expense sortBy:date sortOrder:desc policyID:${policyID}`,
                flatFilters: [],
                hash: 591785022,
                recentSearchHash: 714245044,
                similarSearchHash: 1023624110,
                rawFilterList: [
                    {
                        key: 'policyID',
                        operator: 'eq',
                        value: policyID,
                        isDefault: true,
                    },
                ],
            } as unknown as SearchQueryJSON;

            // When the IOU report has a matching policyID, it should return true
            const matchingIOUReport: Report = {
                ...createRandomReport(2, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, matchingIOUReport, false, transaction)).toBeTruthy();

            // When the IOU report has a different policyID, it should return false
            const nonMatchingIOUReport: Report = {
                ...createRandomReport(3, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'differentPolicyID',
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, nonMatchingIOUReport, false, transaction)).toBeFalsy();
        });
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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
                            merchant: '(none)',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                        policyRecentlyUsedCurrencies: [],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        isSelfTourViewed: false,
                        quickAction: undefined,
                        betas: [CONST.BETAS.ALL],
                        personalDetails: {},
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
                            policyRecentlyUsedCurrencies: [],
                            existingTransactionDraft: undefined,
                            draftTransactionIDs: [],
                            isSelfTourViewed: false,
                            quickAction: undefined,
                            betas: [CONST.BETAS.ALL],
                            personalDetails: {},
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
                                    expect(newTransaction?.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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
                                        expect(transaction?.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
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
                                    clearAllRelatedReportActionErrors(iouReportID, iouAction ?? null, iouReportID);
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

            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
        });

        it('should pass isSelfTourViewed true to the request when user has viewed the tour', () => {
            const {iouReport} = requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 1000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'Test Merchant',
                    comment: 'Test comment',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: true,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            // Verify that the iouReport is created successfully when isSelfTourViewed is true
            expect(iouReport).toBeDefined();
            expect(iouReport?.reportID).toBeDefined();
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserEmailParam: 'existing@example.com',
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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

        it('should update policyRecentlyUsedTags when tag is provided', async () => {
            // Given a policy recently used tags
            const transactionTag = 'new tag';
            const policyID = 'A';
            const tagName = 'Tag';
            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                nonReimbursableTotal: 0,
                total: 0,
                ownerAccountID: RORY_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                policyID,
            };
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);

            // When requesting money
            requestMoney({
                report: expenseReport,
                existingIOUReport: expenseReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: '1', isPolicyExpenseChat: true},
                },
                policyParams: {policyRecentlyUsedTags},
                transactionParams: {
                    amount: 100,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    tag: transactionTag,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
        });

        it('should use personalDetails to create expense with participant display name', async () => {
            const testPersonalDetails: PersonalDetailsList = {
                [CARLOS_ACCOUNT_ID]: {
                    accountID: CARLOS_ACCOUNT_ID,
                    login: CARLOS_EMAIL,
                    displayName: 'Carlos Martinez',
                    firstName: 'Carlos',
                    lastName: 'Martinez',
                    avatar: 'https://example.com/carlos.jpg',
                },
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory Smith',
                    firstName: 'Rory',
                    lastName: 'Smith',
                    avatar: 'https://example.com/rory.jpg',
                },
            };

            const amount = 5000;
            const comment = 'Test expense with personal details';
            const merchant = 'Test Store';

            const {iouReport} = requestMoney({
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: testPersonalDetails,
                betas: [CONST.BETAS.ALL],
            });

            expect(iouReport).toBeDefined();
            expect(iouReport?.reportID).toBeDefined();

            // Verify that the expense was created successfully with the personal details
            await waitForBatchedUpdates();

            const createdIouReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`);
            expect(createdIouReport).toBeDefined();
            expect(createdIouReport?.ownerAccountID).toBe(RORY_ACCOUNT_ID);
        });

        it('should create expense correctly when personalDetails contains multiple users', async () => {
            const testPersonalDetails: PersonalDetailsList = {
                [CARLOS_ACCOUNT_ID]: {
                    accountID: CARLOS_ACCOUNT_ID,
                    login: CARLOS_EMAIL,
                    displayName: 'Carlos Martinez',
                    firstName: 'Carlos',
                    lastName: 'Martinez',
                },
                [JULES_ACCOUNT_ID]: {
                    accountID: JULES_ACCOUNT_ID,
                    login: JULES_EMAIL,
                    displayName: 'Jules Thompson',
                    firstName: 'Jules',
                    lastName: 'Thompson',
                },
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory Smith',
                    firstName: 'Rory',
                    lastName: 'Smith',
                },
                [VIT_ACCOUNT_ID]: {
                    accountID: VIT_ACCOUNT_ID,
                    login: VIT_EMAIL,
                    displayName: 'Vit Developer',
                    firstName: 'Vit',
                    lastName: 'Developer',
                },
            };

            const amount = 10000;
            const {iouReport} = requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: JULES_EMAIL, accountID: JULES_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'Multi-user test',
                    comment: 'Testing with multiple personal details',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: testPersonalDetails,
                betas: [CONST.BETAS.ALL],
            });

            expect(iouReport).toBeDefined();
            expect(iouReport?.reportID).toBeDefined();

            await waitForBatchedUpdates();

            // Verify the IOU report was created successfully with multiple users in personalDetails
            const createdIouReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`);
            expect(createdIouReport).toBeDefined();
            // The IOU report should have the correct owner (payee)
            expect(createdIouReport?.ownerAccountID).toBe(RORY_ACCOUNT_ID);
        });

        it('should handle empty personalDetails gracefully', async () => {
            const amount = 2500;

            const {iouReport} = requestMoney({
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
                    merchant: 'Empty details test',
                    comment: 'Testing with empty personal details',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: {},
                betas: [CONST.BETAS.ALL],
            });

            // Should still create the expense even with empty personalDetails
            expect(iouReport).toBeDefined();

            await waitForBatchedUpdates();

            const createdIouReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`);
            expect(createdIouReport).toBeDefined();
        });

        it('should update the parentReportID and parentReportActionID of the transactionThreadReport of the transaction when submitted to another report', async () => {
            const amount = 10000;
            const comment = 'Send me money please';
            const chatReport: OnyxEntry<Report> = {
                reportID: '1234',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };
            const TEST_USER_ACCOUNT_ID = 1;
            const TEST_USER_LOGIN = 'test@test.com';

            // Given a test user is signed in with Onyx setup and some initial data
            await signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            subscribeToUserEvents(TEST_USER_ACCOUNT_ID, undefined);
            await waitForBatchedUpdates();
            await setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // Create a tracked expense
            trackExpense({
                report: selfDMReport,
                isDraftPolicy: true,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: TEST_USER_LOGIN,
                    payeeAccountID: TEST_USER_ACCOUNT_ID,
                    participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: comment,
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
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

            // Then we should have exactly 2 reports
            expect(Object.values(allReports ?? {}).length).toBe(3);

            // Then one of them should be a chat report with relevant properties
            const transactionThreadReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT && report?.parentReportID === selfDMReport.reportID);
            expect(transactionThreadReport).toBeTruthy();
            expect(transactionThreadReport).toHaveProperty('reportID');
            expect(transactionThreadReport).toHaveProperty('parentReportActionID');

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
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`];
            const createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.reportActionID === transactionThreadReport?.parentReportActionID,
            );
            expect(createIOUAction).toBeTruthy();
            expect(createIOUAction?.childReportID).toBe(transactionThreadReport?.reportID);

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
            const transaction = Object.values(allTransactions ?? {}).find((t) => t);
            expect(transaction).toBeTruthy();
            expect(transaction?.amount).toBe(-amount);
            expect(transaction?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
            expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUTransactionID).toBe(transaction?.transactionID);

            // When: submitting the tracked expense to another user
            const {iouReport} = requestMoney({
                action: CONST.IOU.ACTION.SUBMIT,
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
                    linkedTrackedExpenseReportAction: createIOUAction,
                    linkedTrackedExpenseReportID: selfDMReport.reportID,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                policyRecentlyUsedCurrencies: [],
                quickAction: undefined,
                isSelfTourViewed: false,
                existingTransactionDraft: transaction,
                draftTransactionIDs: [],
                personalDetails: {},
                betas: [CONST.BETAS.ALL],
            });

            await waitForBatchedUpdates();

            // Then: the parentReportID and parentReportActionID of the transactionThreadReport should be updated correctly
            const updatedTransactionThreadReport = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`]);
                    },
                });
            });

            const iouReportActionID = getIOUActionForReportID(iouReport?.reportID, transaction?.transactionID)?.reportActionID;
            expect(updatedTransactionThreadReport).toBeTruthy();
            expect(updatedTransactionThreadReport?.parentReportID).toBe(iouReport?.reportID);
            expect(updatedTransactionThreadReport?.parentReportActionID).toBe(iouReportActionID);

            // Also, the fromReportID of movedTransactionAction should be CONST.REPORT.UNREPORTED_REPORT_ID
            const updatedTransactionThreadReportActions = getAllReportActions(transactionThreadReport?.reportID);
            const movedTransactionAction = Object.values(updatedTransactionThreadReportActions ?? {}).find(
                (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
            );
            expect(movedTransactionAction).toBeTruthy();
            const originalMessage = getOriginalMessage(movedTransactionAction) as OriginalMessageMovedTransaction | undefined;
            expect(originalMessage?.fromReportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
        });

        it('creates new chat report when participant does not match existing chat report participants', () => {
            const amount = 10000;
            const comment = 'Test participant mismatch';

            // Create an existing chat report between RORY and JULES (not CARLOS)
            const existingChatReport: Report = {
                reportID: '9999',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [JULES_ACCOUNT_ID]: JULES_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingChatReport.reportID}`, existingChatReport)
                .then(() => {
                    // Request money from CARLOS, but pass the existing chat report with JULES
                    // This simulates the scenario where submit frequency is disabled and user selects a different participant
                    requestMoney({
                        report: existingChatReport,
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
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: RORY_ACCOUNT_ID,
                        currentUserEmailParam: RORY_EMAIL,
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
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

                                    // A NEW chat report should be created for RORY and CARLOS
                                    // The existing chat report between RORY and JULES should still exist
                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);

                                    // There should be at least 2 chat reports (existing one + new one for RORY/CARLOS)
                                    // Plus a transaction thread
                                    expect(chatReports.length).toBeGreaterThanOrEqual(2);

                                    // Find the chat report that has RORY and CARLOS as participants
                                    const newChatReport = chatReports.find((report) => {
                                        const participantKeys = Object.keys(report?.participants ?? {}).map(Number);
                                        return participantKeys.includes(RORY_ACCOUNT_ID) && participantKeys.includes(CARLOS_ACCOUNT_ID) && participantKeys.length === 2;
                                    });

                                    // The new chat report should exist and NOT be the existing one
                                    expect(newChatReport).toBeDefined();
                                    expect(newChatReport?.reportID).not.toBe(existingChatReport.reportID);

                                    // The new chat report should have RORY and CARLOS as participants
                                    expect(newChatReport?.participants).toEqual({
                                        [RORY_ACCOUNT_ID]: RORY_PARTICIPANT,
                                        [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT,
                                    });

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('reuses existing chat report when participant matches chat report participants', () => {
            const amount = 10000;
            const comment = 'Test participant match';

            // Create an existing chat report between RORY and CARLOS (matching the participant)
            const existingChatReport: Report = {
                reportID: '8888',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingChatReport.reportID}`, existingChatReport)
                .then(() => {
                    // Request money from CARLOS with matching chat report
                    requestMoney({
                        report: existingChatReport,
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
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: RORY_ACCOUNT_ID,
                        currentUserEmailParam: RORY_EMAIL,
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
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

                                    // The existing chat report should be reused
                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);

                                    // Find the chat report that has RORY and CARLOS as participants
                                    const chatReportWithParticipants = chatReports.find((report) => {
                                        const participantKeys = Object.keys(report?.participants ?? {}).map(Number);
                                        return participantKeys.includes(RORY_ACCOUNT_ID) && participantKeys.includes(CARLOS_ACCOUNT_ID) && participantKeys.length === 2;
                                    });

                                    // The existing chat report should be reused
                                    expect(chatReportWithParticipants?.reportID).toBe(existingChatReport.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('skips participant validation for policy expense chat participant', () => {
            const amount = 10000;
            const comment = 'Test policy expense chat';
            const policyID = 'policy123';

            // Create a policy expense chat report
            const policyExpenseChatReport: Report = {
                reportID: '7777',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChatReport.reportID}`, policyExpenseChatReport)
                .then(() => {
                    // Request money with isPolicyExpenseChat: true - should skip participant validation
                    requestMoney({
                        report: policyExpenseChatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: policyExpenseChatReport.reportID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
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

                                    // The policy expense chat report should be reused (participant validation skipped)
                                    const policyExpenseChats = Object.values(allReports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    // The original policy expense chat should still exist
                                    expect(policyExpenseChats.some((report) => report?.reportID === policyExpenseChatReport.reportID)).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('skips participant validation when chatReport is a Policy Expense Chat', () => {
            const amount = 10000;
            const comment = 'Test chatReport is policy expense chat';
            const policyID = 'policy456';

            // Create a policy expense chat report (the chatReport itself is a policy expense chat)
            const policyExpenseChatReport: Report = {
                reportID: '6666',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [JULES_ACCOUNT_ID]: JULES_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChatReport.reportID}`, policyExpenseChatReport)
                .then(() => {
                    // Request money from CARLOS but passing a policy expense chat report with different participants (JULES)
                    // Since the chatReport is a policy expense chat, participant validation should be skipped
                    requestMoney({
                        report: policyExpenseChatReport,
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
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
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

                                    // Even though participants don't match (JULES vs CARLOS),
                                    // since the chatReport is a policy expense chat, it should be reused
                                    // (no new 1:1 DM chat should be created for this case)
                                    const policyExpenseChats = Object.values(allReports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    // The policy expense chat should still exist
                                    expect(policyExpenseChats.some((report) => report?.reportID === policyExpenseChatReport.reportID)).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('skips participant validation for self-DM report with accountID 0', () => {
            const amount = 10000;
            const comment = 'Test self-DM track expense';

            // Create a self-DM report (Your Space)
            const selfDMReport: Report = {
                reportID: '5555',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport)
                .then(() => {
                    // Track expense in self-DM with accountID: 0 (as getMoneyRequestParticipantsFromReport does)
                    // This simulates the scenario where user starts an expense from "Your Space"
                    requestMoney({
                        report: selfDMReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            // accountID: 0 is used for self-DM participants (represents the report itself, not another user)
                            participant: {accountID: 0, reportID: selfDMReport.reportID, isPolicyExpenseChat: false},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: RORY_ACCOUNT_ID,
                        currentUserEmailParam: RORY_EMAIL,
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
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

                                    // The self-DM report should be reused (participant validation should be skipped)
                                    // No new 1:1 DM chat with accountID 0 should be created
                                    const selfDMReports = Object.values(allReports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM);

                                    // The original self-DM report should still exist
                                    expect(selfDMReports.some((report) => report?.reportID === selfDMReport.reportID)).toBe(true);

                                    // There should NOT be a new invalid chat report with accountID 0 participant
                                    const chatReportsWithZeroParticipant = Object.values(allReports ?? {}).filter((report) => {
                                        if (report?.type !== CONST.REPORT.TYPE.CHAT || report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM) {
                                            return false;
                                        }
                                        const participantKeys = Object.keys(report?.participants ?? {}).map(Number);
                                        return participantKeys.includes(0);
                                    });

                                    // No chat reports should have accountID 0 as a participant (that would be invalid)
                                    expect(chatReportsWithZeroParticipant.length).toBe(0);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });
    });

    describe('createDistanceRequest', () => {
        const mockPersonalDetails: PersonalDetailsList = {
            [RORY_ACCOUNT_ID]: {
                accountID: RORY_ACCOUNT_ID,
                login: RORY_EMAIL,
                displayName: 'Rory',
            },
            [CARLOS_ACCOUNT_ID]: {
                accountID: CARLOS_ACCOUNT_ID,
                login: CARLOS_EMAIL,
                displayName: 'Carlos',
            },
        };

        function getDefaultDistanceRequestParams(
            report: Report | undefined,
            transactionOverrides: Partial<Parameters<typeof createDistanceRequest>[0]['transactionParams']> = {},
            recentWaypoints: Awaited<ReturnType<typeof getOnyxValue<typeof ONYXKEYS.NVP_RECENT_WAYPOINTS>>> = [],
        ): Parameters<typeof createDistanceRequest>[0] {
            return {
                report,
                participants: [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                transactionParams: {
                    amount: 1000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    validWaypoints: {},
                    ...transactionOverrides,
                },
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                recentWaypoints: recentWaypoints ?? [],
                personalDetails: mockPersonalDetails,
                betas: [CONST.BETAS.ALL],
            };
        }

        it('does not trigger notifyNewAction when creating distance request in an expense report', async () => {
            // Given recent waypoints from Onyx
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request in an expense report
            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1}, recentWaypoints),
                participants: [],
            });

            // Then notifyNewAction should not be called
            expect(notifyNewAction).toHaveBeenCalledTimes(0);
        });

        it('triggers notifyNewAction when creating distance request in a chat report', async () => {
            // Given recent waypoints from Onyx
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request in a chat report
            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123'}, {amount: 1}, recentWaypoints),
                participants: [],
            });

            // Then notifyNewAction should be called once
            expect(notifyNewAction).toHaveBeenCalledTimes(1);
        });

        it('correctly sets quickAction', async () => {
            // Given recent waypoints from Onyx
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a split distance request for the first time
            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [],
            });
            await waitForBatchedUpdates();

            // Then isFirstQuickAction should be true
            expect(await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE)).toHaveProperty('isFirstQuickAction', true);

            // When creating another split distance request with existing quickAction
            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [],
                quickAction: {action: CONST.QUICK_ACTIONS.SEND_MONEY, chatReportID: '456'},
            });
            await waitForBatchedUpdates();

            // Then quickAction should be updated to SPLIT_DISTANCE with isFirstQuickAction false
            expect(await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE)).toMatchObject({
                action: CONST.QUICK_ACTIONS.SPLIT_DISTANCE,
                isFirstQuickAction: false,
            });
        });

        it('merges policyRecentlyUsedCurrencies into recently used currencies', async () => {
            // Given initial recently used currencies
            const initialCurrencies = [CONST.CURRENCY.USD, CONST.CURRENCY.EUR];
            await Onyx.set(ONYXKEYS.RECENTLY_USED_CURRENCIES, initialCurrencies);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with GBP currency
            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1, currency: CONST.CURRENCY.GBP}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                policyRecentlyUsedCurrencies: initialCurrencies,
                personalDetails: mockPersonalDetails,
            });
            await waitForBatchedUpdates();

            // Then GBP should be added at the beginning of recently used currencies
            const recentlyUsedCurrencies = await getOnyxValue(ONYXKEYS.RECENTLY_USED_CURRENCIES);
            expect(recentlyUsedCurrencies).toEqual([CONST.CURRENCY.GBP, ...initialCurrencies]);
        });

        it('should update policyRecentlyUsedTags when tag is provided', async () => {
            // Given a policy with recently used tags and an IOU report
            const transactionTag = 'new tag';
            const policyID = 'A';
            const tagName = 'Tag';
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };
            const iouReport = {
                reportID: '3',
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserPersonalDetails.accountID,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, {reportID: iouReport.reportID, policyID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with a tag
            createDistanceRequest({
                ...getDefaultDistanceRequestParams(iouReport, {amount: 1, currency: CONST.CURRENCY.GBP, tag: transactionTag}, recentWaypoints),
                policyParams: {policyRecentlyUsedTags},
            });
            await waitForBatchedUpdates();

            // Then the tag should be added to recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
        });

        it('should update policyRecentlyUsedTags when splitting with tag is provided', async () => {
            // Given a policy expense chat with recently used tags
            const transactionTag = 'new tag';
            const policyID = 'A';
            const tagName = 'Tag';
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };
            const policyExpenseChat = {
                reportID: '2',
                policyID,
                isPolicyExpenseChat: true,
                isOwnPolicyExpenseChat: true,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a split distance request with a tag
            createDistanceRequest({
                ...getDefaultDistanceRequestParams(policyExpenseChat, {amount: 1, currency: CONST.CURRENCY.GBP, tag: transactionTag}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [policyExpenseChat],
                policyParams: {policyRecentlyUsedTags},
            });
            await waitForBatchedUpdates();

            // Then the tag should be added to recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
        });

        it('creates a basic distance request with valid waypoints', async () => {
            // Given a report and valid waypoints
            const testReport = createRandomReport(1, undefined);
            const validWaypoints: WaypointCollection = {
                waypoint0: {
                    lat: 37.7749,
                    lng: -122.4194,
                    address: '1 Market Street, San Francisco, CA, USA',
                    name: '1 Market Street',
                },
                waypoint1: {
                    lat: 37.8044,
                    lng: -122.2712,
                    address: '1 Broadway, Oakland, CA, USA',
                    name: '1 Broadway',
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request
            createDistanceRequest(
                getDefaultDistanceRequestParams(
                    testReport,
                    {
                        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                        comment: 'Distance request test',
                        validWaypoints,
                        distance: 15000,
                    },
                    recentWaypoints,
                ),
            );
            await waitForBatchedUpdates();

            // Then a transaction should be created with correct comment
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.comment?.comment).toBe('Distance request test');
        });

        it('creates a distance request with zero distance', async () => {
            // Given a report
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with zero distance
            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: 0, distance: 0}, recentWaypoints));
            await waitForBatchedUpdates();

            // Then a transaction should be created with zero amount
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });

            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.amount).toBe(0);
        });

        it('creates a split distance request between participants', async () => {
            // Given a report, waypoints, and multiple participants
            const testReport = createRandomReport(1, undefined);
            const validWaypoints: WaypointCollection = {
                waypoint0: {
                    lat: 37.7749,
                    lng: -122.4194,
                    address: '1 Market Street, San Francisco, CA, USA',
                    name: '1 Market Street',
                },
                waypoint1: {
                    lat: 37.8044,
                    lng: -122.2712,
                    address: '1 Broadway, Oakland, CA, USA',
                    name: '1 Broadway',
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a split distance request
            createDistanceRequest({
                ...getDefaultDistanceRequestParams(
                    testReport,
                    {
                        amount: 3000,
                        merchant: 'Distance Split',
                        comment: 'Split distance test',
                        validWaypoints,
                        distance: 30000,
                    },
                    recentWaypoints,
                ),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [
                    {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL},
                    {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL},
                ],
            });

            await waitForBatchedUpdates();

            // Then at least one transaction should be created
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            expect(Object.values(allTransactions ?? {}).length).toBeGreaterThanOrEqual(1);
        });

        it('creates a distance request with odometer values', async () => {
            // Given a report
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with odometer values
            createDistanceRequest(
                getDefaultDistanceRequestParams(
                    testReport,
                    {
                        amount: 500,
                        comment: 'Odometer test',
                        odometerStart: 10000,
                        odometerEnd: 10050,
                    },
                    recentWaypoints,
                ),
            );

            await waitForBatchedUpdates();

            // Then a transaction should be created with odometer comment
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.comment?.comment).toBe('Odometer test');
            expect(createdTransaction?.comment?.odometerStart).toBe(10000);
            expect(createdTransaction?.comment?.odometerEnd).toBe(10050);
        });

        it('creates distance request with category in policy expense chat', async () => {
            // Given a policy with categories and a policy expense chat
            const policyID = 'testPolicy123';
            const testCategory = 'Travel';
            const fakePolicy = {...createRandomPolicy(1), id: policyID};
            const fakeCategories = {
                [testCategory]: {
                    name: testCategory,
                    enabled: true,
                },
            };
            const policyExpenseChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                isOwnPolicyExpenseChat: true,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, fakeCategories);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with a category
            createDistanceRequest({
                ...getDefaultDistanceRequestParams(
                    policyExpenseChat,
                    {
                        amount: 2500,
                        merchant: 'Work Trip',
                        comment: 'Business travel',
                        category: testCategory,
                    },
                    recentWaypoints,
                ),
                policyParams: {
                    policy: fakePolicy,
                    policyCategories: fakeCategories,
                },
            });

            await waitForBatchedUpdates();

            // Then a transaction should be created with the category
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.category).toBe(testCategory);
        });

        it('creates distance request and updates recent waypoints', async () => {
            // Given a report and waypoints with empty recent waypoints
            const testReport = createRandomReport(1, undefined);
            const validWaypoints: WaypointCollection = {
                waypoint0: {
                    lat: 40.7128,
                    lng: -74.006,
                    address: '123 Broadway, New York, NY, USA',
                    name: '123 Broadway',
                },
                waypoint1: {
                    lat: 40.758,
                    lng: -73.9855,
                    address: 'Times Square, New York, NY, USA',
                    name: 'Times Square',
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            await Onyx.set(ONYXKEYS.NVP_RECENT_WAYPOINTS, []);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with waypoints
            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: 1500, validWaypoints}, recentWaypoints));
            await waitForBatchedUpdates();

            // Then a transaction should be created
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            expect(Object.values(allTransactions ?? {}).length).toBeGreaterThanOrEqual(1);
        });

        it('creates distance request with different currencies', async () => {
            // Given a report
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with EUR currency
            createDistanceRequest(
                getDefaultDistanceRequestParams(
                    testReport,
                    {
                        amount: 5000,
                        currency: CONST.CURRENCY.EUR,
                        merchant: 'Euro Trip',
                        comment: 'European travel',
                    },
                    recentWaypoints,
                ),
            );
            await waitForBatchedUpdates();

            // Then a transaction should be created with EUR currency
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.currency).toBe(CONST.CURRENCY.EUR);
        });

        it('creates distance request with large amount', async () => {
            // Given a report and large amount
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
            const largeAmount = 999999999;

            // When creating a distance request with large amount
            createDistanceRequest(
                getDefaultDistanceRequestParams(
                    testReport,
                    {
                        amount: largeAmount,
                        merchant: 'Long Trip',
                        comment: 'Very long distance',
                    },
                    recentWaypoints,
                ),
            );
            await waitForBatchedUpdates();

            // Then a transaction should be created with the large amount
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.amount).toBe(largeAmount);
        });

        it('preserves special characters in comment when creating distance request', async () => {
            // Given a report and comment with special characters
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
            const specialComment = 'Trip with special chars: <>&"\'äöü中文🚗';

            // When creating a distance request with special characters
            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {comment: specialComment}, recentWaypoints));
            await waitForBatchedUpdates();

            // Then a transaction should be created with the special comment preserved
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            // The comment contains the original text but HTML special chars are escaped and emoji is wrapped
            expect(createdTransaction?.comment?.comment).toContain('Trip with special chars');
            expect(createdTransaction?.comment?.comment).toContain('äöü');
            expect(createdTransaction?.comment?.comment).toContain('中文');
        });

        it('creates optimistic transaction with pending action when API is paused', async () => {
            // Given a report and paused API
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with paused API
            mockFetch?.pause?.();
            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {comment: 'API failure test'}, recentWaypoints));
            await waitForBatchedUpdates();

            // Then optimistic transaction should exist with pending action
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
        });

        it('creates billable distance request when billable flag is set', async () => {
            // Given a policy expense chat with billable enabled
            const policyID = 'billablePolicy';
            const fakePolicy = {...createRandomPolicy(1), id: policyID, disabledFields: {defaultBillable: false}};
            const testReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a billable distance request
            createDistanceRequest({
                ...getDefaultDistanceRequestParams(
                    testReport,
                    {
                        amount: 1500,
                        comment: 'Billable distance',
                        billable: true,
                    },
                    recentWaypoints,
                ),
                policyParams: {
                    policy: fakePolicy,
                },
            });
            await waitForBatchedUpdates();

            // Then a billable transaction should be created
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.billable).toBe(true);
        });

        it('creates distance request with tax information', async () => {
            // Given a policy expense chat with tax settings
            const policyID = 'taxPolicy';
            const testTaxCode = 'TAX_20';
            const testTaxAmount = 200;
            const fakePolicy = {...createRandomPolicy(1), id: policyID};
            const testReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with tax information
            createDistanceRequest({
                ...getDefaultDistanceRequestParams(
                    testReport,
                    {
                        comment: 'Tax distance',
                        taxCode: testTaxCode,
                        taxAmount: testTaxAmount,
                    },
                    recentWaypoints,
                ),
                policyParams: {
                    policy: fakePolicy,
                },
            });
            await waitForBatchedUpdates();

            // Then a transaction should be created with tax info
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.taxCode).toBe(testTaxCode);
        });

        it('creates distance request with attendees', async () => {
            // Given a report and attendees
            const testReport = createRandomReport(1, undefined);
            const testAttendees: Attendee[] = [
                {email: RORY_EMAIL, displayName: 'Rory', avatarUrl: ''},
                {email: CARLOS_EMAIL, displayName: 'Carlos', avatarUrl: ''},
            ];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request with attendees
            createDistanceRequest(
                getDefaultDistanceRequestParams(
                    testReport,
                    {
                        amount: 2000,
                        attendees: testAttendees,
                        merchant: 'Group Trip',
                        comment: 'Team travel',
                    },
                    recentWaypoints,
                ),
            );
            await waitForBatchedUpdates();

            // Then a transaction should be created with attendees
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (transactions) => {
                    allTransactions = transactions;
                },
            });
            const createdTransaction = Object.values(allTransactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            expect(createdTransaction?.comment?.attendees?.length).toBe(2);
        });

        it('creates new chat report when creating distance request without existing report', async () => {
            // Given no existing report (only recent waypoints)
            const initialReports = await getOnyxValue(ONYXKEYS.COLLECTION.REPORT);
            const initialReportsCount = Object.keys(initialReports ?? {}).length;
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When creating a distance request without a report
            createDistanceRequest(getDefaultDistanceRequestParams(undefined, {}, recentWaypoints));
            await waitForBatchedUpdates();

            // Then a new report should be created along with the transaction
            const allReports = await getOnyxValue(ONYXKEYS.COLLECTION.REPORT);
            const allTransactions = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);
            expect(Object.keys(allReports ?? {}).length).toBeGreaterThan(initialReportsCount);
            expect(Object.keys(allTransactions ?? {}).length).toBeGreaterThanOrEqual(1);
            const createdTransaction = Object.values(allTransactions ?? {}).at(0) as Transaction | undefined;
            expect(createdTransaction).toBeTruthy();
        });
    });

    describe('setMoneyRequestDistanceRate', () => {
        it('does not set distance rate if transaction is invalid', async () => {
            // Given an invalid transaction
            const consoleWarnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});

            // When calling setMoneyRequestDistanceRate with invalid transaction
            setMoneyRequestDistanceRate(undefined, 'customUnitRateID123', createRandomPolicy(1), false);
            // Then a warning should be logged and distance rate should not be set
            expect(consoleWarnSpy).toHaveBeenCalledWith('setMoneyRequestDistanceRate is called without a valid transaction, skipping setting distance rate.');
            const distanceRates = await getOnyxValue(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
            expect(distanceRates).toBeUndefined();
            consoleWarnSpy.mockRestore();
        });

        it('sets the last selected distance rate for valid transaction', async () => {
            const policy = createRandomPolicy(1);
            // Given a valid transaction
            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                    attendees: [],
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            // When calling setMoneyRequestDistanceRate with valid transaction
            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, false);
            await waitForBatchedUpdates();
            // Then the distance rate should be set in Onyx
            const lastDistanceRates = (await getOnyxValue(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES)) as LastSelectedDistanceRates | undefined;
            expect(lastDistanceRates?.[policy.id]).toBeDefined();
            expect(lastDistanceRates?.[policy.id]).toBe(customUnitRateID);
        });

        it('sets distance rate and distance unit for draft transaction', async () => {
            const policy = createRandomPolicy(1);
            policy.customUnits = {
                distanceUnitID: {
                    customUnitID: 'distanceUnitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                    rates: {},
                },
            };

            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, true);
            await waitForBatchedUpdates();

            const transactionDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${testTransaction.transactionID}`);
            expect(transactionDraft?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transactionDraft?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            expect(transactionDraft?.comment?.customUnit?.defaultP2PRate).toBeUndefined();
        });

        it('converts distance quantity if distance unit changes', async () => {
            const policy = createRandomPolicy(1);
            policy.customUnits = {
                distanceUnitID: {
                    customUnitID: 'distanceUnitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                    rates: {},
                },
            };

            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, false);
            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`);
            expect(transaction?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transaction?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            // 10 miles to kilometers = 10 / 0.000621371 * 0.001 = 16.093444978925636
            expect(transaction?.comment?.customUnit?.quantity).toBe(16.093444978925636);
        });

        it('does not convert distance quantity if distance unit changes but it is an odometer request', async () => {
            const policy = createRandomPolicy(1);
            policy.customUnits = {
                distanceUnitID: {
                    customUnitID: 'distanceUnitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                    rates: {},
                },
            };

            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
                comment: {
                    comment: 'Test transaction',
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, policy, false);
            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`);
            expect(transaction?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transaction?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            // Quantity should remain 10 for odometer requests
            expect(transaction?.comment?.customUnit?.quantity).toBe(10);
        });

        it('does not set defaultP2PRate to null when policy is undefined', async () => {
            const testTransaction: Transaction = {
                transactionID: 'testTransaction123',
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    comment: 'Test transaction',
                    customUnit: {
                        defaultP2PRate: CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS,
                    },
                },
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID: 'testReport123',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`, testTransaction);

            const customUnitRateID = 'customUnitRateID123';
            setMoneyRequestDistanceRate(testTransaction, customUnitRateID, undefined, false);
            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${testTransaction.transactionID}`);
            expect(transaction?.comment?.customUnit?.customUnitRateID).toBe(customUnitRateID);
            expect(transaction?.comment?.customUnit?.defaultP2PRate).toBe(CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS);
        });
    });

    describe('split expense', () => {
        const splitMockPersonalDetails: PersonalDetailsList = {
            [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL, displayName: 'Rory'},
            [CARLOS_ACCOUNT_ID]: {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL, displayName: 'Carlos'},
            [JULES_ACCOUNT_ID]: {accountID: JULES_ACCOUNT_ID, login: JULES_EMAIL, displayName: 'Jules'},
            [VIT_ACCOUNT_ID]: {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL, displayName: 'Vit'},
        };

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

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportCollectionDataSet as OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.REPORT>)
                .then(() =>
                    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
                        ...carlosActionsCollectionDataSet,
                        ...julesCreatedActionsCollectionDataSet,
                        ...julesActionsCollectionDataSet,
                    } as OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>),
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
                            quickAction: undefined,
                            policyRecentlyUsedCurrencies: [],
                            policyRecentlyUsedTags: undefined,
                            betas: [CONST.BETAS.ALL],
                            personalDetails: splitMockPersonalDetails,
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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
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

        it('correctly sets quickAction', async () => {
            // Given a expense chat with no expenses
            const workspaceReportID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {reportID: workspaceReportID, isOwnPolicyExpenseChat: true});

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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
            });

            await waitForBatchedUpdates();

            expect(await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE)).toHaveProperty('isFirstQuickAction', true);

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
                quickAction: {action: CONST.QUICK_ACTIONS.SEND_MONEY, chatReportID: '456'},
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
            });
            await waitForBatchedUpdates();

            expect(await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE)).toMatchObject({
                action: CONST.QUICK_ACTIONS.SPLIT_MANUAL,
                isFirstQuickAction: false,
            });
        });

        it('merges policyRecentlyUsedCurrencies when splitting a bill', async () => {
            const initialCurrencies = [CONST.CURRENCY.USD];
            await Onyx.set(ONYXKEYS.RECENTLY_USED_CURRENCIES, initialCurrencies);

            splitBill({
                participants: [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}],
                currentUserLogin: RORY_EMAIL,
                currentUserAccountID: RORY_ACCOUNT_ID,
                comment: '',
                amount: 100,
                currency: CONST.CURRENCY.EUR,
                merchant: 'test',
                created: '',
                existingSplitChatReportID: '',
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                quickAction: undefined,
                policyRecentlyUsedCurrencies: initialCurrencies,
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
            });

            await waitForBatchedUpdates();

            const recentlyUsedCurrencies = await getOnyxValue(ONYXKEYS.RECENTLY_USED_CURRENCIES);
            expect(recentlyUsedCurrencies).toEqual([CONST.CURRENCY.EUR, ...initialCurrencies]);
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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [],
                personalDetails: splitMockPersonalDetails,
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

            await waitForBatchedUpdates();

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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
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

        it('should update the policyRecentlyUsedTags when tag is provided', async () => {
            // Given a policy recently used tags
            const policyID = 'A';
            const transactionTag = 'new tag';
            const tagName = 'Tag';
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };

            const policyExpenseChat = {
                reportID: '2',
                policyID,
                isPolicyExpenseChat: true,
                isOwnPolicyExpenseChat: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);

            // When doing a split bill
            splitBill({
                participants: [{isPolicyExpenseChat: true, policyID}],
                existingSplitChatReportID: policyExpenseChat.reportID,
                currentUserLogin: currentUserPersonalDetails.login ?? '',
                currentUserAccountID: currentUserPersonalDetails.accountID,
                amount: 1,
                created: '',
                comment: '',
                merchant: '',
                transactionViolations: undefined,
                category: undefined,
                tag: transactionTag,
                currency: CONST.CURRENCY.USD,
                taxCode: '',
                taxAmount: 0,
                isASAPSubmitBetaEnabled: false,
                policyRecentlyUsedTags,
                quickAction: {},
                policyRecentlyUsedCurrencies: [],
                betas: [CONST.BETAS.ALL],
                personalDetails: splitMockPersonalDetails,
            });

            waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
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

            const participants: IOUParticipant[] = [{accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL}];
            const participantsPolicyTags = await getParticipantsPolicyTags(participants);

            // Start a scan split bill
            const {splitTransactionID} = startSplitBill({
                participants,
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
                quickAction: undefined,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags: undefined,
                participantsPolicyTags,
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
            completeSplitBill(reportID, iouAction, updatedSplitTransaction, RORY_ACCOUNT_ID, false, undefined, {}, [CONST.BETAS.ALL], splitMockPersonalDetails, RORY_EMAIL);

            await waitForBatchedUpdates();

            splitTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransactionID}`);

            // Then the description should be the same since it was not changed
            expect(splitTransaction?.comment?.comment).toBe('<h1>test</h1>');
        });

        it('should calculate proportional convertedAmount for split transactions with foreign currency', async () => {
            jest.setTimeout(10 * 1000);

            // Given: An expense report with AED currency and a USD transaction with convertedAmount
            const originalAmount = -1000;
            const originalConvertedAmount = -3673;
            const reportID = rand64();
            const originalTransactionID = rand64();

            const expenseReport: Report = {
                reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                currency: 'AED',
                ownerAccountID: RORY_ACCOUNT_ID,
                total: originalAmount,
            };

            const originalTransaction = {
                transactionID: originalTransactionID,
                amount: originalAmount,
                modifiedAmount: '', // Empty string - the edge case that was causing the bug
                currency: 'USD',
                modifiedCurrency: '',
                convertedAmount: originalConvertedAmount,
                created: DateUtils.getDBTime(),
                merchant: 'Test Merchant',
                reportID,
                comment: {},
            } as unknown as Transaction;

            const transactionThread: Report = {
                reportID: rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: reportID,
                parentReportActionID: rand64(),
            };

            const iouAction: ReportAction = {
                ...buildOptimisticIOUReportAction({
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: Math.abs(originalAmount),
                    currency: 'USD',
                    comment: '',
                    participants: [],
                    transactionID: originalTransactionID,
                    iouReportID: reportID,
                }),
                childReportID: transactionThread.reportID,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`, transactionThread);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [iouAction.reportActionID]: iouAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, originalTransaction);

            const splitExpenses: SplitExpense[] = [
                {
                    transactionID: rand64(),
                    amount: -500,
                    created: DateUtils.getDBTime(),
                    merchant: 'Test Merchant',
                },
                {
                    transactionID: rand64(),
                    amount: -500,
                    created: DateUtils.getDBTime(),
                    merchant: 'Test Merchant',
                },
            ];

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

            const reports = getTransactionAndExpenseReports(reportID);
            const policyTags = await getPolicyTags(reports.expenseReport?.policyID);

            // When splitting the expense
            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
                allReportNameValuePairsList: allReportNameValuePairs,
                transactionData: {
                    reportID,
                    originalTransactionID,
                    splitExpenses,
                    splitExpensesTotal: -1000,
                },
                searchContext: {
                    currentSearchHash: -1,
                },
                policyCategories: undefined,
                policy: undefined,
                policyRecentlyUsedCategories: [],
                iouReport: expenseReport,
                firstIOU: iouAction,
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

            // Then each split transaction should have proportional convertedAmount
            // Formula: Math.round((originalConvertedAmount * splitAmount) / originalAmount)
            const expectedProportionalConvertedAmount = -1836;

            const splitTransactions = await new Promise<Transaction[]>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        const splits = Object.values(transactions ?? {}).filter(
                            (t) => t?.transactionID !== originalTransactionID && t?.comment?.originalTransactionID === originalTransactionID,
                        );
                        resolve(splits as Transaction[]);
                    },
                });
            });

            expect(splitTransactions.length).toBe(2);

            for (const splitTransaction of splitTransactions) {
                expect(splitTransaction.convertedAmount).toBe(expectedProportionalConvertedAmount);
            }
        });
    });

    describe('startSplitBill', () => {
        it('should update the policyRecentlyUsedTags when tag is provided', async () => {
            // Given a policy recently used tags
            const policyID = 'A';
            const transactionTag = 'new tag';
            const tagName = 'Tag';
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);

            const participants: IOUParticipant[] = [{isPolicyExpenseChat: true, policyID}];
            const participantsPolicyTags = await getParticipantsPolicyTags(participants);

            // When doing a split bill with a receipt
            startSplitBill({
                participants,
                currentUserLogin: currentUserPersonalDetails.login ?? '',
                currentUserAccountID: currentUserPersonalDetails.accountID,
                comment: '',
                receipt: {},
                category: undefined,
                tag: transactionTag,
                currency: CONST.CURRENCY.USD,
                taxCode: '',
                taxAmount: 0,
                policyRecentlyUsedTags,
                quickAction: {},
                policyRecentlyUsedCurrencies: [],
                participantsPolicyTags,
            });

            waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
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
            const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
            const policyTags = await getPolicyTags(reportID);
            const reports = getTransactionAndExpenseReports(reportID);

            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
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
                firstIOU: iouAction,
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

            const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
            const policyTags = await getPolicyTags(reportID);
            const reports = getTransactionAndExpenseReports(reportID);

            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
                allReportNameValuePairsList: allReportNameValuePairs,
                transactionData: {
                    reportID,
                    originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                    splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                    splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                },
                searchContext: {
                    currentSearchHash: hash,
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

            const reportID = draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
            const policyTags = await getPolicyTags(reportID);
            const reports = getTransactionAndExpenseReports(reportID);

            updateSplitTransactionsFromSplitExpensesFlow({
                allTransactionsList: allTransactions,
                allReportsList: allReports,
                allReportNameValuePairsList: allReportNameValuePairs,
                transactionData: {
                    reportID,
                    originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                    splitExpenses: draftTransaction?.comment?.splitExpenses ?? [],
                    splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal,
                },
                searchContext: {
                    currentSearchHash: hash,
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
            setMoneyRequestCategory(transactionID, category, fakePolicy);

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
                setMoneyRequestCategory(transactionID, category, fakePolicy);

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
                setMoneyRequestCategory(transactionID, category, fakePolicy);

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
            setMoneyRequestCategory(transactionID, '', undefined);
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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

        it('adds grouped from snapshot optimistic data for grouped search queries', async () => {
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING] as SearchStatus,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                filters: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                    left: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
                    right: 'yes',
                },
                inputQuery: 'sortBy:date sortOrder:desc type:expense groupBy:from status:drafts,outstanding',
                flatFilters: [],
                hash: 71801560,
                recentSearchHash: 1043581824,
                similarSearchHash: 1832274510,
                view: CONST.SEARCH.VIEW.TABLE,
            } as SearchQueryJSON;

            const getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue(currentSearchQueryJSON);

            requestMoney({
                action: CONST.IOU.ACTION.CREATE,
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                transactionViolations: {},
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            expect(writeSpy).toHaveBeenCalledTimes(1);
            const [, , requestData] = writeSpy.mock.calls.at(0) as [ApiCommand, Record<string, unknown>, {optimisticData?: Array<{key: string}>}];
            const optimisticData = requestData.optimisticData ?? [];
            const mainSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`;
            expect(optimisticData.some((update) => update.key === mainSnapshotKey)).toBeTruthy();

            const newFlatFilters = currentSearchQueryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
            newFlatFilters.push({
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: String(RORY_ACCOUNT_ID)}],
            });
            const groupedTransactionsQueryJSON = SearchQueryUtils.buildSearchQueryJSON(
                SearchQueryUtils.buildSearchQueryString({
                    ...currentSearchQueryJSON,
                    groupBy: undefined,
                    flatFilters: newFlatFilters,
                }),
            );

            expect(groupedTransactionsQueryJSON?.hash).toBeDefined();
            if (!groupedTransactionsQueryJSON) {
                throw new Error('Expected grouped transactions query JSON to be defined');
            }
            const groupedSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${groupedTransactionsQueryJSON.hash}`;
            expect(optimisticData.some((update) => update.key === groupedSnapshotKey)).toBeTruthy();

            getCurrentSearchQueryJSONSpy.mockRestore();
        });

        test.each([
            [WRITE_COMMANDS.TRACK_EXPENSE, CONST.IOU.ACTION.CREATE],
            [WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, CONST.IOU.ACTION.CATEGORIZE],
            [WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, CONST.IOU.ACTION.SHARE],
        ])('%s', async (expectedCommand: ApiCommand, action: IOUAction) => {
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
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

        it('should return 0 when the currency and amount of the transactions are the same for an invoice report', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
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

        it('should return the correct diff for an invoice report (same sign convention as expense reports)', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
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

        it('should return null when the currency of the updated and current transactions differ for an invoice report', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
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
        const fakePersonalPolicy: Pick<Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'> = {
            id: '2',
            autoReporting: true,
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
            merchant: 'Expense',
        };

        const currentDate = '2025-04-01';
        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, null);
            await Onyx.merge(`${ONYXKEYS.CURRENT_DATE}`, currentDate);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            return waitForBatchedUpdates();
        });

        it('should merge transaction draft onyx value', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [],
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
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        currentIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [],
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual({
                        ...transactionResult,
                        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    });
                });
        });
        it('should return personal currency when policy is missing', async () => {
            await waitForBatchedUpdates()
                .then(() => {
                    return initMoneyRequest({
                        reportID: fakeReport.reportID,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [],
                    });
                })
                .then(async () => {
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual({
                        ...transactionResult,
                        currency: fakePersonalPolicy.outputCurrency,
                    });
                });
        });

        it('should remove non-optimistic draft transactions when draftTransactionIDs is provided', async () => {
            const otherDraftTransactionID = '123456';
            const otherDraftTransaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID: otherDraftTransactionID,
            };

            // Set up an additional draft transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`, otherDraftTransaction);

            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [otherDraftTransactionID],
                    });
                })
                .then(async () => {
                    // The other draft transaction should be removed (Onyx returns undefined for removed keys)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`)).toBeUndefined();
                    // The optimistic transaction should be created
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });

        it('should preserve optimistic transaction in draftTransactionIDs while removing others', async () => {
            const otherDraftTransactionID = '789012';
            const otherDraftTransaction: Transaction = {
                ...createRandomTransaction(2),
                transactionID: otherDraftTransactionID,
            };
            const existingOptimisticTransaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            };

            // Set up both draft transactions
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`, otherDraftTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, existingOptimisticTransaction);

            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [otherDraftTransactionID, CONST.IOU.OPTIMISTIC_TRANSACTION_ID],
                    });
                })
                .then(async () => {
                    // The other draft transaction should be removed (Onyx returns undefined for removed keys)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${otherDraftTransactionID}`)).toBeUndefined();
                    // The optimistic transaction should be updated with the new transaction result (not removed)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });

        it('should remove multiple draft transactions when draftTransactionIDs contains several entries', async () => {
            const draftTransactionID1 = '111111';
            const draftTransactionID2 = '222222';
            const draftTransaction1: Transaction = {
                ...createRandomTransaction(4),
                transactionID: draftTransactionID1,
            };
            const draftTransaction2: Transaction = {
                ...createRandomTransaction(5),
                transactionID: draftTransactionID2,
            };

            // Set up multiple draft transactions
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID1}`, draftTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID2}`, draftTransaction2);

            await waitForBatchedUpdates()
                .then(() => {
                    initMoneyRequest({
                        reportID: fakeReport.reportID,
                        policy: fakePolicy,
                        personalPolicy: fakePersonalPolicy,
                        isFromGlobalCreate: true,
                        newIouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        report: fakeReport,
                        parentReport: fakeParentReport,
                        currentDate,
                        currentUserPersonalDetails,
                        hasOnlyPersonalPolicies: false,
                        draftTransactionIDs: [draftTransactionID1, draftTransactionID2],
                    });
                })
                .then(async () => {
                    // Both draft transactions should be removed (Onyx returns undefined for removed keys)
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID1}`)).toBeUndefined();
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransactionID2}`)).toBeUndefined();
                    // The optimistic transaction should be created
                    expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`)).toStrictEqual(transactionResult);
                });
        });
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
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
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
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
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
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
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
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
                    isSelfTourViewed: false,
                    betas: undefined,
                    hasActiveAdminPolicies: false,
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
                    putOnHold(originalTransactionID, 'Test hold reason', transactionThreadReportID, false);
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

    describe('getManagerMcTestParticipant', () => {
        it('should return manager mctest participant when personalDetails contains manager_mctest', () => {
            // Given personalDetails that include manager_mctest
            const managerMcTestAccountID = CONST.ACCOUNT_ID.MANAGER_MCTEST;
            const personalDetailsList: PersonalDetailsList = {
                [managerMcTestAccountID]: {
                    accountID: managerMcTestAccountID,
                    login: CONST.EMAIL.MANAGER_MCTEST,
                    displayName: 'Manager McTest',
                },
            };

            // When calling getManagerMcTestParticipant with personalDetails
            const result = getManagerMcTestParticipant(RORY_ACCOUNT_ID, personalDetailsList);

            // Then it should return a participant with the manager mctest account ID
            expect(result).toBeDefined();
            expect(result?.accountID).toBe(managerMcTestAccountID);
        });

        it('should return undefined when personalDetails does not contain manager_mctest', () => {
            // Given personalDetails without manager_mctest
            const personalDetailsList: PersonalDetailsList = {
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory',
                },
            };

            // When calling getManagerMcTestParticipant with personalDetails
            const result = getManagerMcTestParticipant(RORY_ACCOUNT_ID, personalDetailsList);

            // Then it should return undefined since manager_mctest is not in the provided personalDetails
            expect(result).toBeUndefined();
        });

        it('should return undefined when personalDetails is empty', () => {
            // Given empty personalDetails
            const personalDetailsList: PersonalDetailsList = {};

            // When calling getManagerMcTestParticipant with empty personalDetails
            const result = getManagerMcTestParticipant(RORY_ACCOUNT_ID, personalDetailsList);

            // Then it should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('Report Totals Calculation for Split Expenses', () => {
        function calculateReportTotalsForSplitExpenses(
            expenseReport: Report | undefined,
            splitExpenses: SplitExpense[],
            allReportsList: Record<string, Report> | undefined,
            changesInReportTotal: number,
        ): Map<string, number> {
            const reportTotals = new Map<string, number>();
            const expenseReportID = expenseReport?.reportID;

            if (expenseReportID) {
                const expenseReportKey = `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`;
                const expenseReportTotal = allReportsList?.[expenseReportKey]?.total ?? expenseReport?.total ?? 0;
                reportTotals.set(expenseReportID, expenseReportTotal - changesInReportTotal);
            }

            for (const expense of splitExpenses) {
                const splitExpenseReportID = expense.reportID;
                if (!splitExpenseReportID || reportTotals.has(splitExpenseReportID)) {
                    continue;
                }

                const splitExpenseReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpenseReportID}`];
                reportTotals.set(splitExpenseReportID, splitExpenseReport?.total ?? 0);
            }

            return reportTotals;
        }

        it('should calculate expense report total minus changes when expense report ID exists', () => {
            const expenseReport: Report = {
                reportID: 'report1',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {
                    reportID: 'report1',
                    total: 10000,
                } as Report,
            };
            const changesInReportTotal = 2000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('report1')).toBe(8000); // 10000 - 2000
        });

        it('should use expense report total directly when not in allReportsList', () => {
            const expenseReport: Report = {
                reportID: 'report1',
                total: 15000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {}; // Empty, so should fall back to expenseReport.total
            const changesInReportTotal = 3000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('report1')).toBe(12000); // 15000 - 3000
        });

        it('should use allReportsList total when it differs from expense report total', () => {
            const expenseReport: Report = {
                reportID: 'report1',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {
                    reportID: 'report1',
                    total: 12000, // Different from expenseReport.total
                } as Report,
            };
            const changesInReportTotal = 2000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('report1')).toBe(10000); // 12000 - 2000 (uses allReportsList value)
        });

        it('should add split expenses from different reports to the map', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [
                {
                    reportID: 'splitReport1',
                    amount: 2000,
                } as SplitExpense,
                {
                    reportID: 'splitReport2',
                    amount: 3000,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport1`]: {
                    reportID: 'splitReport1',
                    total: 5000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport2`]: {
                    reportID: 'splitReport2',
                    total: 7000,
                } as Report,
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(3);
            expect(result.get('mainReport')).toBe(9000); // 10000 - 1000
            expect(result.get('splitReport1')).toBe(5000);
            expect(result.get('splitReport2')).toBe(7000);
        });

        it('should skip split expenses without reportID', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [
                {
                    reportID: undefined,
                    amount: 2000,
                } as SplitExpense,
                {
                    reportID: 'splitReport1',
                    amount: 3000,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport1`]: {
                    reportID: 'splitReport1',
                    total: 5000,
                } as Report,
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(2); // Only mainReport and splitReport1
            expect(result.get('mainReport')).toBe(9000);
            expect(result.get('splitReport1')).toBe(5000);
        });

        it('should skip split expenses that are already in reportTotals', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            // Two split expenses with the same reportID
            const splitExpenses: SplitExpense[] = [
                {
                    reportID: 'splitReport1',
                    amount: 2000,
                } as SplitExpense,
                {
                    reportID: 'splitReport1', // Duplicate reportID
                    amount: 3000,
                } as SplitExpense,
                {
                    reportID: 'splitReport2',
                    amount: 1500,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport1`]: {
                    reportID: 'splitReport1',
                    total: 5000,
                } as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}splitReport2`]: {
                    reportID: 'splitReport2',
                    total: 3000,
                } as Report,
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(3);
            expect(result.get('mainReport')).toBe(9000);
            expect(result.get('splitReport1')).toBe(5000); // Should only be added once
            expect(result.get('splitReport2')).toBe(3000);
        });

        it('should default split expense report total to 0 when not found in allReportsList', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [
                {
                    reportID: 'splitReport1',
                    amount: 2000,
                } as SplitExpense,
            ];

            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
                // splitReport1 is NOT in allReportsList
            };
            const changesInReportTotal = 1000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(2);
            expect(result.get('mainReport')).toBe(9000);
            expect(result.get('splitReport1')).toBe(0); // Defaults to 0
        });

        it('should handle empty split expenses array', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
            };
            const changesInReportTotal = 2000;

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('mainReport')).toBe(8000);
        });

        it('should handle negative changesInReportTotal', () => {
            const expenseReport: Report = {
                reportID: 'mainReport',
                total: 10000,
            } as Report;

            const splitExpenses: SplitExpense[] = [];
            const allReportsList = {
                [`${ONYXKEYS.COLLECTION.REPORT}mainReport`]: {
                    reportID: 'mainReport',
                    total: 10000,
                } as Report,
            };
            const changesInReportTotal = -2000; // Negative change

            const result = calculateReportTotalsForSplitExpenses(expenseReport, splitExpenses, allReportsList, changesInReportTotal);

            expect(result.size).toBe(1);
            expect(result.get('mainReport')).toBe(12000); // 10000 - (-2000) = 12000
        });
    });

    it('handleNavigateAfterExpenseCreate', async () => {
        const mockedIsReportTopmostSplitNavigator = isReportTopmostSplitNavigator as jest.MockedFunction<typeof isReportTopmostSplitNavigator>;
        const spyOnMergeTransactionIdsHighlightOnSearchRoute = jest.spyOn(require('@libs/actions/Transaction'), 'mergeTransactionIdsHighlightOnSearchRoute');
        const activeReportID = '1';
        const transactionID = '1';
        mockedIsReportTopmostSplitNavigator.mockReturnValue(false);

        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: false});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        mockedIsReportTopmostSplitNavigator.mockReturnValue(true);
        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true, transactionID});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        mockedIsReportTopmostSplitNavigator.mockReturnValue(false);
        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true, transactionID});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        handleNavigateAfterExpenseCreate({activeReportID, isFromGlobalCreate: true, transactionID, isInvoice: true});
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(0);

        spyOnMergeTransactionIdsHighlightOnSearchRoute.mockReset();
    });

    describe('resetDraftTransactionsCustomUnit', () => {
        it('should do nothing if transaction is not passed', async () => {
            // Call the reset function without a transaction
            resetDraftTransactionsCustomUnit(undefined);
            await waitForBatchedUpdates();
            const allDraftTransactions = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT);
            // Assuming there are no draft transactions, this should be undefined or an empty object
            expect(allDraftTransactions).toBeUndefined();
        });
        it('should reset custom unit for a transaction', async () => {
            const transactionID = 'transaction_reset_001';
            const fakeTransaction: Transaction = {
                transactionID,
                amount: 1500,
                currency: CONST.CURRENCY.USD,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                merchant: 'Test Reset',
                reportID: 'report_reset_001',
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        quantity: 100,
                    },
                    waypoints: {
                        waypoint0: {lat: 40.7128, lng: -74.006, address: 'NYC', name: 'NYC', keyForList: 'nyc_key'},
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, fakeTransaction);
            await waitForBatchedUpdates();
            // Call the reset function
            resetDraftTransactionsCustomUnit(fakeTransaction);
            await waitForBatchedUpdates();
            // Verify the transaction's custom unit and waypoints have been reset
            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(updatedTransaction?.comment?.customUnit?.name).toBe(CONST.CUSTOM_UNITS.NAME_DISTANCE);
            expect(updatedTransaction?.comment?.customUnit?.quantity).toBe(100);
        });
    });

    describe('setMoneyRequest helpers', () => {
        const transactionID = 'testTransaction123';

        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('setMoneyRequestAmount should set amount, currency, and shouldShowOriginalAmount on transaction draft', async () => {
            setMoneyRequestAmount(transactionID, 500, 'EUR', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.amount).toBe(500);
            expect(draft?.currency).toBe('EUR');
            expect(draft?.shouldShowOriginalAmount).toBe(true);
        });

        it('setMoneyRequestCreated should set created on transaction draft', async () => {
            setMoneyRequestCreated(transactionID, '2024-01-15', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.created).toBe('2024-01-15');
        });

        it('setMoneyRequestDateAttribute should set date attributes on transaction draft', async () => {
            setMoneyRequestDateAttribute(transactionID, '2024-01-01', '2024-01-31');
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.comment?.customUnit?.attributes?.dates?.start).toBe('2024-01-01');
            expect(draft?.comment?.customUnit?.attributes?.dates?.end).toBe('2024-01-31');
        });

        it('setMoneyRequestDescription should set comment on transaction draft', async () => {
            setMoneyRequestDescription(transactionID, '  Lunch with team  ', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.comment?.comment).toBe('Lunch with team');
        });

        it('setMoneyRequestMerchant should set merchant on transaction draft', async () => {
            setMoneyRequestMerchant(transactionID, 'Coffee Shop', true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.merchant).toBe('Coffee Shop');
        });

        it('setMoneyRequestTag should set tag on transaction draft', async () => {
            setMoneyRequestTag(transactionID, 'Engineering');
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.tag).toBe('Engineering');
        });

        it('setMoneyRequestBillable should set billable on transaction draft', async () => {
            setMoneyRequestBillable(transactionID, true);
            await waitForBatchedUpdates();
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draft?.billable).toBe(true);
        });
    });
    describe('setMoneyRequestOdometerImage and removeMoneyRequestOdometerImage', () => {
        beforeEach(() => {
            jest.mock('@libs/OdometerImageUtils', () => ({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __esModule: true,
                default: jest.fn(),
            }));
        });

        afterEach(() => {
            jest.unmock('@libs/OdometerImageUtils');
        });
        it('should set odometer start image on a draft transaction', async () => {
            const transaction = createRandomTransaction(1);
            const transactionID = transaction.transactionID;
            const file = {uri: 'image.uri', name: 'image.jpg', type: 'image/jpeg', size: 1234};
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.START;

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction);

            setMoneyRequestOdometerImage(transaction, imageType, file, true, false);
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draftTransaction?.comment?.odometerStartImage).toEqual(file);
        });

        it('should set odometer end image on a non-draft transaction', async () => {
            const transaction = createRandomTransaction(1);
            const transactionID = transaction.transactionID;
            const file = {uri: 'image.uri', name: 'image.jpg', type: 'image/jpeg', size: 1234};
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.END;

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

            setMoneyRequestOdometerImage(transaction, imageType, file, false, false);
            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(updatedTransaction?.comment?.odometerEndImage).toEqual(file);
        });

        it('should remove odometer start image from a draft transaction', async () => {
            const transaction = {
                ...createRandomTransaction(1),
                comment: {
                    odometerStartImage: {uri: 'image.uri'},
                },
            } as Transaction;
            const transactionID = transaction.transactionID;
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.START;

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction);

            removeMoneyRequestOdometerImage(transaction, imageType, true, false);
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(draftTransaction?.comment?.odometerStartImage).toBeUndefined();
        });

        it('should remove odometer end image from a non-draft transaction', async () => {
            const transaction = {
                ...createRandomTransaction(1),
                comment: {
                    odometerEndImage: {uri: 'image.uri'},
                },
            } as Transaction;
            const transactionID = transaction.transactionID;
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.END;

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

            removeMoneyRequestOdometerImage(transaction, imageType, false, false);
            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(updatedTransaction?.comment?.odometerEndImage).toBeUndefined();
        });
    });
});
