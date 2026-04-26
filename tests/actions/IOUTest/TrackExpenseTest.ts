/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {convertBulkTrackedExpensesToIOU, deleteTrackExpense, getDeleteTrackExpenseInformation, getTrackExpenseInformation, trackExpense} from '@libs/actions/IOU/TrackExpense';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {addComment, openReport} from '@libs/actions/Report';
import {subscribeToUserEvents} from '@libs/actions/User';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getOriginalMessage, isActionableTrackExpense, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport} from '@libs/ReportUtils';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';
import {getValidWaypoints, isDistanceRequest as isDistanceRequestUtil} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {Accountant} from '@src/types/onyx/IOU';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomPolicyCategories from '../../utils/collections/policyCategory';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import PusherHelper from '../../utils/PusherHelper';
import type {MockFetch} from '../../utils/TestHelper';
import * as TestHelper from '../../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData, setPersonalDetails, signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '23423423'),
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
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;

const TEST_INTRO_SELECTED: IntroSelected = {
    choice: CONST.ONBOARDING_CHOICES.SUBMIT,
    isInviteOnboardingComplete: false,
};

OnyxUpdateManager();

describe('actions/IOU/TrackExpense', () => {
    let mockFetch: MockFetch;

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
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
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

            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [fakeTransaction.transactionID],
                isSelfTourViewed: false,
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
            createDraftTransactionAndNavigateToParticipantSelector({
                reportID: selfDMReport.reportID,
                actionName: CONST.IOU.ACTION.CATEGORIZE,
                reportActionID: reportActionableTrackExpense?.reportActionID,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                draftTransactionIDs: [],
                activePolicy: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                transaction,
                currentUserAccountID: RORY_ACCOUNT_ID,
                currentUserEmail: RORY_EMAIL,
            });
            await waitForBatchedUpdates();

            // Then the transaction draft should be saved successfully
            let allTransactionsDraft: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                waitForCollectionCallback: true,
                callback: (val) => {
                    allTransactionsDraft = val;
                },
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

            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [transaction.transactionID],
                isSelfTourViewed: false,
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

            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [transaction.transactionID],
                isSelfTourViewed: false,
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

        it('share with accountant who is already an admin does not update their role or re-add them', async () => {
            const accountant: Required<Accountant> = {login: VIT_EMAIL, accountID: VIT_ACCOUNT_ID};
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: 'ABC',
                employeeList: {[accountant.login]: {email: accountant.login, role: CONST.POLICY.ROLE.ADMIN}},
            };
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
                    amount: transaction.amount,
                    currency: transaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transaction.merchant,
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
                draftTransactionIDs: [transaction.transactionID],
                isSelfTourViewed: false,
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

            const linkedTrackedExpenseReportAction = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isMoneyRequestAction(reportAction));
            const reportActionableTrackExpense = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isActionableTrackExpense(reportAction));

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

            // Accountant is already an admin so the role should stay ADMIN
            expect(policyOnyx?.employeeList?.[accountant.login].role).toBe(CONST.POLICY.ROLE.ADMIN);
            // And the share command should still have fired
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, 1);
        });

        it('share with accountant on a policy with existing members creates the optimistic announce chat', async () => {
            const existingMemberA = 'member-a@expensifail.com';
            const existingMemberAID = 100;
            const existingMemberB = 'member-b@expensifail.com';
            const existingMemberBID = 101;
            const accountant: Required<Accountant> = {login: VIT_EMAIL, accountID: VIT_ACCOUNT_ID};
            const policy: Policy = {
                ...createRandomPolicy(1),
                id: 'ABC',
                employeeList: {
                    [existingMemberA]: {email: existingMemberA, role: CONST.POLICY.ROLE.USER},
                    [existingMemberB]: {email: existingMemberB, role: CONST.POLICY.ROLE.USER},
                },
            };
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
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [existingMemberAID]: {accountID: existingMemberAID, login: existingMemberA},
                [existingMemberBID]: {accountID: existingMemberBID, login: existingMemberB},
            });

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
                    amount: transaction.amount,
                    currency: transaction.currency,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: transaction.merchant,
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
                draftTransactionIDs: [transaction.transactionID],
                isSelfTourViewed: false,
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

            const linkedTrackedExpenseReportAction = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isMoneyRequestAction(reportAction));
            const reportActionableTrackExpense = Object.values(selfDMReportActionsOnyx ?? {}).find((reportAction) => isActionableTrackExpense(reportAction));

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

            await mockFetch?.resume?.();

            // With 2 existing policy members + the new accountant there are 3 participants, so the #announce room should be created for this policy
            const announceChat = Object.values(allReports ?? {}).find((report) => report?.policyID === policy.id && report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE);
            expect(announceChat).toBeTruthy();
            expect(announceChat?.writeCapability).toBe(CONST.REPORT.WRITE_CAPABILITIES.ADMINS);
        });

        /**
         * Creates default trackExpense parameters - only override what's needed for each test
         */
        function getDefaultTrackExpenseParams(
            report: Report | undefined,
            transactionOverrides: Partial<Parameters<typeof trackExpense>[0]['transactionParams']> = {},
        ): Parameters<typeof trackExpense>[0] {
            return {
                report,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Test Merchant',
                    billable: false,
                    ...transactionOverrides,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints: [],
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
            };
        }

        it('should create optimistic transaction with correct amount and currency', async () => {
            // Given a selfDM report and transaction data
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-unit-1',
            };
            const testAmount = 15000; // $150.00
            const testCurrency = 'USD';
            const testMerchant = 'Unit Test Merchant';

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with specific amount and currency
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: testAmount, currency: testCurrency, merchant: testMerchant}));
            await waitForBatchedUpdates();

            // Then transaction should be created with correct values
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();
            // Amount is stored as negative for track expenses
            expect(Math.abs(createdTransaction?.amount ?? 0)).toBe(testAmount);
            expect(createdTransaction?.currency).toBe(testCurrency);
            expect(createdTransaction?.merchant).toBe(testMerchant);
        });

        it('should create actionable track expense whisper for selfDM reports', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-unit-2',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called on selfDM
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 5000}));
            await waitForBatchedUpdates();

            // Then an actionable track expense whisper should be created
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`);

            const actionableWhisper = Object.values(reportActions ?? {}).find((action) => isActionableTrackExpense(action));
            expect(actionableWhisper).toBeTruthy();
        });

        it('should set correct tax fields when tax parameters are provided', async () => {
            // Given a selfDM report and transaction with tax
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-unit-3',
            };
            const testTaxCode = 'TAX_CODE_1';
            const testTaxAmount = 500; // $5.00 tax

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with tax parameters
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {merchant: 'Tax Test Merchant', taxCode: testTaxCode, taxAmount: testTaxAmount}));
            await waitForBatchedUpdates();

            // Then transaction should have correct tax fields
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction?.taxCode).toBe(testTaxCode);
            expect(createdTransaction?.taxAmount).toBe(-testTaxAmount);
        });

        it('should set billable and reimbursable flags correctly', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-unit-4',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with billable=true and reimbursable=true
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 7500, merchant: 'Billable Test', billable: true, reimbursable: true}));
            await waitForBatchedUpdates();

            // Then transaction should have correct billable and reimbursable flags
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction?.billable).toBe(true);
            expect(createdTransaction?.reimbursable).toBe(true);
        });

        it('should complete full track expense flow: create -> categorize -> submit to workspace', async () => {
            // Given a selfDM report, policy, and expense chat
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-func-1',
            };
            const policy = createRandomPolicy(1);
            const policyExpenseChat: Report = {
                ...createRandomReport(2, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: 'expense-chat-func-1',
                policyID: policy.id,
                type: CONST.REPORT.TYPE.CHAT,
                isOwnPolicyExpenseChat: true,
            };
            const policyCategories = createRandomPolicyCategories(3);
            const selectedCategory = Object.keys(policyCategories).at(0) ?? '';

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When trackExpense is called to create a tracked expense in selfDM
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 25000, merchant: 'Functional Test Restaurant'}));
            await waitForBatchedUpdates();

            // Then the initial expense should be created with report actions
            const selfDMReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`);

            expect(Object.values(selfDMReportActions ?? {}).length).toBe(2);
            const moneyRequestAction = Object.values(selfDMReportActions ?? {}).find((action) => isMoneyRequestAction(action));
            const actionableWhisper = Object.values(selfDMReportActions ?? {}).find((action) => isActionableTrackExpense(action));
            expect(moneyRequestAction).toBeTruthy();
            expect(actionableWhisper).toBeTruthy();

            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });
            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction).toBeTruthy();

            // When a draft is created for categorization
            createDraftTransactionAndNavigateToParticipantSelector({
                reportID: selfDMReport.reportID,
                actionName: CONST.IOU.ACTION.CATEGORIZE,
                reportActionID: actionableWhisper?.reportActionID,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                draftTransactionIDs: [],
                activePolicy: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                transaction: createdTransaction,
                currentUserAccountID: RORY_ACCOUNT_ID,
                currentUserEmail: RORY_EMAIL,
            });
            await waitForBatchedUpdates();

            // Then the draft should be created
            let transactionDrafts: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactionDrafts = val;
                },
            });
            const draftTransaction = transactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${createdTransaction?.transactionID}`];
            expect(draftTransaction).toBeTruthy();

            // When the expense is categorized and submitted to workspace
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.CATEGORIZE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: policyExpenseChat.reportID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                    policyCategories,
                },
                transactionParams: {
                    amount: draftTransaction?.amount ?? 25000,
                    currency: draftTransaction?.currency ?? 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: draftTransaction?.merchant ?? 'Functional Test Restaurant',
                    category: selectedCategory,
                    actionableWhisperReportActionID: draftTransaction?.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: moneyRequestAction,
                    linkedTrackedExpenseReportID: selfDMReport.reportID,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints: [],
                draftTransactionIDs: [],
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
            });
            await waitForBatchedUpdates();

            // Then the transaction should be categorized
            let finalTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    finalTransactions = val;
                },
            });
            const categorizedTransaction = finalTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${createdTransaction?.transactionID}`];
            expect(categorizedTransaction?.category).toBe(selectedCategory);
        });

        it('should handle expense with attendees correctly', async () => {
            // Given a selfDM report with attendees data
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-func-2',
            };
            const testAttendees = [
                {email: 'attendee1@test.com', displayName: 'Attendee One', avatarUrl: ''},
                {email: 'attendee2@test.com', displayName: 'Attendee Two', avatarUrl: ''},
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with attendees
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 30000, merchant: 'Team Lunch', attendees: testAttendees}));
            await waitForBatchedUpdates();

            // Then transaction should have attendees
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction?.comment?.attendees).toHaveLength(2);
            expect(createdTransaction?.comment?.attendees?.at(0)?.email).toBe('attendee1@test.com');
        });

        it('should update quick action when tracking expense to policy expense chat', async () => {
            // Given a policy expense chat
            const policy = createRandomPolicy(1);
            const policyExpenseChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: 'expense-chat-func-2',
                policyID: policy.id,
                type: CONST.REPORT.TYPE.CHAT,
                isOwnPolicyExpenseChat: true,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When trackExpense is called on policy expense chat
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: policyExpenseChat.reportID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                },
                transactionParams: {
                    amount: 12000,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Quick Action Test',
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints: [],
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
            });
            await waitForBatchedUpdates();

            // Then quick action should be updated
            const quickAction = await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
            expect(quickAction).toBeTruthy();
            expect(quickAction?.chatReportID).toBe(policyExpenseChat.reportID);
        });

        it('should handle tracking expense without merchant gracefully', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-1',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called without merchant
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 5000, merchant: ''}));
            await waitForBatchedUpdates();

            // Then transaction should still be created
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            expect(Object.values(transactions ?? {}).length).toBeGreaterThan(0);
        });

        it('should handle zero amount expense', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-2',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with zero amount
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 0, merchant: 'Zero Amount Test'}));
            await waitForBatchedUpdates();

            // Then transaction should be created with zero amount
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            // trackExpense negates the amount, so 0 becomes -0, defaults to 1 to be able to use Math.abs
            expect(createdTransaction).toBeTruthy();
            expect(Object.is(Math.abs(createdTransaction?.amount ?? 1), 0)).toBe(true);
        });

        it('should handle different currency codes correctly', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-3',
            };
            const testCurrency = 'EUR';

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with EUR currency
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 8500, currency: testCurrency, merchant: 'European Merchant'}));
            await waitForBatchedUpdates();

            // Then transaction should have correct currency
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction?.currency).toBe(testCurrency);
        });

        it('should create optimistic selfDM report when none exists', async () => {
            // Given no selfDM report exists

            // When trackExpense is called with undefined report
            trackExpense(getDefaultTrackExpenseParams(undefined, {amount: 3000, merchant: 'Optimistic SelfDM Test'}));
            await waitForBatchedUpdates();

            // Then a selfDM report should be created optimistically
            const reports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });

            const selfDMReports = Object.values(reports ?? {}).filter((r) => r?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM);
            expect(selfDMReports.length).toBeGreaterThan(0);
        });

        it('should handle API failure gracefully with failure data', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-5',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
            mockFetch?.fail?.();

            // When trackExpense is called and the API fails
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 5000, merchant: 'Failure Test'}));
            await waitForBatchedUpdates();

            // Then optimistic data should still be created initially
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            expect(Object.values(transactions ?? {}).length).toBeGreaterThan(0);

            mockFetch?.succeed?.();
        });

        it('should handle category and tag together correctly', async () => {
            // Given a selfDM report with category and tag
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-6',
            };
            const testCategory = 'Travel';
            const testTag = 'Business Trip';

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with category and tag
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 50000, merchant: 'Airline', category: testCategory, tag: testTag}));
            await waitForBatchedUpdates();

            // Then transaction should have correct category and tag
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction?.category).toBe(testCategory);
            expect(createdTransaction?.tag).toBe(testTag);
        });

        it('should handle very large expense amounts', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-7',
            };
            const largeAmount = 99999999; // Large amount in cents

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with very large amount
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: largeAmount, merchant: 'Large Purchase'}));
            await waitForBatchedUpdates();

            // Then transaction should handle large amount correctly
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(Math.abs(createdTransaction?.amount ?? 0)).toBe(largeAmount);
        });

        it('should handle expense with special characters in merchant name', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-qa-8',
            };
            const specialMerchant = "McDonald's & Café ñ 日本語";

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with special characters in merchant
            trackExpense(getDefaultTrackExpenseParams(selfDMReport, {amount: 1500, merchant: specialMerchant}));
            await waitForBatchedUpdates();

            // Then transaction should preserve special characters
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransaction = Object.values(transactions ?? {}).at(0);
            expect(createdTransaction?.merchant).toBe(specialMerchant);
        });

        it('should pass isSelfTourViewed true to trackExpense and create transaction successfully', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-tour-1',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with isSelfTourViewed: true
            trackExpense({
                ...getDefaultTrackExpenseParams(selfDMReport, {amount: 12000, merchant: 'Tour Viewed Merchant'}),
                isSelfTourViewed: true,
            });
            await waitForBatchedUpdates();

            // Then the transaction should be created with correct values
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransactionResult = Object.values(transactions ?? {}).at(0);
            expect(createdTransactionResult).toBeTruthy();
            expect(Math.abs(createdTransactionResult?.amount ?? 0)).toBe(12000);
            expect(createdTransactionResult?.merchant).toBe('Tour Viewed Merchant');
        });

        it('should pass isSelfTourViewed false to trackExpense and create transaction successfully', async () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-tour-2',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // When trackExpense is called with isSelfTourViewed: false
            trackExpense({
                ...getDefaultTrackExpenseParams(selfDMReport, {amount: 9000, merchant: 'Tour Not Viewed Merchant'}),
                isSelfTourViewed: false,
            });
            await waitForBatchedUpdates();

            // Then the transaction should be created with correct values
            let transactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    transactions = val;
                },
            });

            const createdTransactionResult = Object.values(transactions ?? {}).at(0);
            expect(createdTransactionResult).toBeTruthy();
            expect(Math.abs(createdTransactionResult?.amount ?? 0)).toBe(9000);
            expect(createdTransactionResult?.merchant).toBe('Tour Not Viewed Merchant');
        });

        it('should return valid track expense information from getTrackExpenseInformation with isSelfTourViewed true', () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-info-1',
            };

            // When getTrackExpenseInformation is called with isSelfTourViewed: true
            const result = getTrackExpenseInformation({
                parentChatReport: selfDMReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID},
                },
                policyParams: {
                    policy: undefined,
                    policyCategories: undefined,
                    policyTagList: undefined,
                },
                transactionParams: {
                    amount: 5000,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Info Test Merchant',
                    comment: 'test comment',
                    receipt: undefined,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: true,
            });

            // Then the result should contain valid track expense data
            expect(result).toBeDefined();
            expect(result.chatReport).toBeDefined();
            expect(result.transaction).toBeDefined();
            expect(result.iouAction).toBeDefined();
            expect(result.onyxData).toBeDefined();
        });

        it('should return valid track expense information from getTrackExpenseInformation with isSelfTourViewed false', () => {
            // Given a selfDM report
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: 'selfDM-info-2',
            };

            // When getTrackExpenseInformation is called with isSelfTourViewed: false
            const result = getTrackExpenseInformation({
                parentChatReport: selfDMReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID},
                },
                policyParams: {
                    policy: undefined,
                    policyCategories: undefined,
                    policyTagList: undefined,
                },
                transactionParams: {
                    amount: 7000,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Info Test Merchant False',
                    comment: 'test comment false',
                    receipt: undefined,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
            });

            // Then the result should contain valid track expense data
            expect(result).toBeDefined();
            expect(result.chatReport).toBeDefined();
            expect(result.transaction).toBeDefined();
            expect(result.iouAction).toBeDefined();
            expect(result.onyxData).toBeDefined();
        });

        it('should return valid track expense information for policy expense chat with both isSelfTourViewed values', () => {
            // Given a policy expense chat report
            const policy = createRandomPolicy(1);
            const policyExpenseChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: 'policy-chat-tour-test',
                policyID: policy.id,
            };

            // When getTrackExpenseInformation is called with isSelfTourViewed: true
            const resultWithTourViewed = getTrackExpenseInformation({
                parentChatReport: policyExpenseChat,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                    policyCategories: undefined,
                    policyTagList: undefined,
                },
                transactionParams: {
                    amount: 3000,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Policy Chat Merchant',
                    comment: '',
                    receipt: undefined,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: true,
            });

            // Then result should be valid
            expect(resultWithTourViewed).toBeDefined();
            expect(resultWithTourViewed.chatReport).toBeDefined();
            expect(resultWithTourViewed.transaction).toBeDefined();

            // When getTrackExpenseInformation is called with isSelfTourViewed: false
            const resultWithoutTourViewed = getTrackExpenseInformation({
                parentChatReport: {
                    ...policyExpenseChat,
                    reportID: 'policy-chat-tour-test-2',
                },
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                    policyCategories: undefined,
                    policyTagList: undefined,
                },
                transactionParams: {
                    amount: 3000,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Policy Chat Merchant',
                    comment: '',
                    receipt: undefined,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
            });

            expect(resultWithoutTourViewed).toBeDefined();
            expect(resultWithoutTourViewed.chatReport).toBeDefined();
            expect(resultWithoutTourViewed.transaction).toBeDefined();
        });
    });

    describe('getDeleteTrackExpenseInformation', () => {
        const amount = 10000;
        const comment = 'Send me money please';
        let selfDMReport: Report;
        let createIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
        let transaction: OnyxEntry<Transaction>;
        let thread: OptimisticChatReport;
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
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
            subscribeToUserEvents(TEST_USER_ACCOUNT_ID, undefined);
            await waitForBatchedUpdates();
            await setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

            selfDMReport = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
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
            expect(Object.values(allReports ?? {}).length).toBe(2);

            // Then one of them should be a chat report with relevant properties
            const transactionThreadReport = Object.values(allReports ?? {}).find(
                (report) => report?.type === CONST.REPORT.TYPE.CHAT && report?.parentReportID === selfDMReport.reportID && report?.reportID !== selfDMReport.reportID,
            );
            if (transactionThreadReport) {
                thread = transactionThreadReport;
            }
            expect(thread).toBeTruthy();
            expect(thread).toHaveProperty('reportID');
            expect(thread?.parentReportID).toBe(selfDMReport.reportID);
            expect(thread).toHaveProperty('parentReportActionID');

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
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.reportActionID === thread?.parentReportActionID,
            );
            expect(createIOUAction).toBeTruthy();
            expect(createIOUAction?.childReportID).toBe(thread?.reportID);

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
            expect(transaction?.amount).toBe(-amount);
            expect(transaction?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
            expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUTransactionID).toBe(transaction?.transactionID);
        });

        afterEach(PusherHelper.teardown);

        it('should delete the transaction thread regardless of whether there are visible comments in the thread, if isMovingTransactionFromTrackExpense equals false.', async () => {
            // Given initial environment is set up
            await waitForBatchedUpdates();

            expect(thread.participants).toEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            jest.advanceTimersByTime(10);
            const allPersonalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
            const participants = userLogins.map((login, index) => ({
                login,
                accountID: participantAccountIDs.at(index),
            }));
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participants,
                personalDetails: allPersonalDetails,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
            await waitForBatchedUpdates();

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread?.reportID}`,
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
            addComment({
                report: thread,
                notifyReportID: thread.reportID,
                ancestors: [],
                text: 'Testing a comment',
                timezoneParam: CONST.DEFAULT_TIME_ZONE,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
            });
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

            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.reportActionID === createIOUAction?.reportActionID,
            );
            expect(createIOUAction).toBeTruthy();

            // When deleting expense
            const {optimisticData, successData, shouldDeleteTransactionThread} = getDeleteTrackExpenseInformation(
                selfDMReport,
                transaction?.transactionID,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                createIOUAction!,
                false,
                undefined,
                undefined,
            );
            await waitForBatchedUpdates();

            // Then the transaction thread report should be ready to be deleted
            expect(shouldDeleteTransactionThread).toBe(true);
            expect(optimisticData).toEqual(
                expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`, value: expect.objectContaining({reportID: null})})]),
            );
            expect(optimisticData).toEqual(expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`, value: null})]));
            expect(successData).toEqual(expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`, value: null})]));
        });

        it('should NOT delete the transaction thread regardless of whether there are no visible comments in the thread, if isMovingTransactionFromTrackExpense equals true.', async () => {
            // Given initial environment is set up
            await waitForBatchedUpdates();

            expect(thread.participants).toEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            jest.advanceTimersByTime(10);
            const allPersonalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
            const participants = userLogins.map((login, index) => ({
                login,
                accountID: participantAccountIDs.at(index),
            }));
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participants,
                personalDetails: allPersonalDetails,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
            await waitForBatchedUpdates();

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread?.reportID}`,
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

            // When deleting expense
            const {optimisticData, successData, shouldDeleteTransactionThread} = getDeleteTrackExpenseInformation(
                selfDMReport,
                transaction?.transactionID,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                createIOUAction!,
                false,
                undefined,
                true,
            );
            await waitForBatchedUpdates();

            // Then the transaction thread report should be ready to be deleted
            expect(shouldDeleteTransactionThread).toBe(false);
            expect(optimisticData).not.toEqual(
                expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`, value: expect.objectContaining({reportID: null})})]),
            );
            expect(optimisticData).not.toEqual(expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`, value: null})]));
            expect(successData).not.toEqual(expect.arrayContaining([expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`, value: null})]));
        });
    });

    describe('deleteTrackExpense', () => {
        const amount = 10000;
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        let selfDMReport: Report;
        let iouReportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
        let transaction: OnyxEntry<Transaction>;
        let thread: OptimisticChatReport;

        beforeEach(async () => {
            jest.clearAllMocks();
            PusherHelper.setup();

            await signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            subscribeToUserEvents(TEST_USER_ACCOUNT_ID, undefined);
            await waitForBatchedUpdates();
            await setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

            selfDMReport = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '20',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

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
                    merchant: 'Delete tracked expense test',
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: TEST_USER_ACCOUNT_ID,
                currentUserEmailParam: TEST_USER_LOGIN,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
            });
            await waitForBatchedUpdates();

            const allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

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

            const allTransactions = await new Promise<OnyxCollection<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            const transactionThreadReport = Object.values(allReports ?? {}).find(
                (report) => report?.type === CONST.REPORT.TYPE.CHAT && report?.parentReportID === selfDMReport.reportID && report?.reportID !== selfDMReport.reportID,
            );
            if (transactionThreadReport) {
                thread = transactionThreadReport;
            }

            iouReportAction = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`] ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.reportActionID === thread?.parentReportActionID,
            );
            transaction = Object.values(allTransactions ?? {}).find((trackedTransaction) => trackedTransaction);

            expect(thread).toBeTruthy();
            expect(iouReportAction).toBeTruthy();
            expect(transaction).toBeTruthy();
        });

        afterEach(PusherHelper.teardown);

        it('should call API.write with delete money request onyx data for selfDM track expenses and return the parent report route in single transaction view', () => {
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            const result = deleteTrackExpense({
                chatReportID: selfDMReport.reportID,
                chatReport: selfDMReport,
                transactionID: transaction?.transactionID,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                reportAction: iouReportAction!,
                iouReport: undefined,
                chatIOUReport: undefined,
                transactions: {},
                violations: {},
                isSingleTransactionView: true,
                isChatReportArchived: false,
                isChatIOUReportArchived: false,
                allTransactionViolationsParam: {},
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                currentUserEmail: TEST_USER_LOGIN,
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            expect(result).toBe(ROUTES.REPORT_WITH_ID.getRoute(selfDMReport.reportID));
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_MONEY_REQUEST,
                expect.objectContaining({
                    transactionID: transaction?.transactionID,
                    reportActionID: iouReportAction?.reportActionID,
                }),
                expect.objectContaining({
                    optimisticData: expect.any(Array),
                    successData: expect.any(Array),
                    failureData: expect.any(Array),
                }),
            );
        });
    });

    describe('convertBulkTrackedExpensesToIOU', () => {
        it('should accept personalDetails as a required parameter', async () => {
            const currentUserAccountID = 1;
            const currentUserEmail = 'user@test.com';
            const payerAccountID = 2;
            const payerEmail = 'payer@test.com';
            const selfDMReportID = 'selfDM123';
            const targetReportID = 'iouReport456';
            const chatReportID = 'chatReport789';
            const transactionID = 'transaction001';

            // Setup personal details
            const testPersonalDetails: PersonalDetailsList = {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    displayName: 'Current User',
                    login: currentUserEmail,
                },
                [payerAccountID]: {
                    accountID: payerAccountID,
                    displayName: 'Payer User',
                    login: payerEmail,
                },
            };

            // Setup self DM report
            const selfDMReport: Report = {
                reportID: selfDMReportID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                ownerAccountID: currentUserAccountID,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            // Setup IOU report (target)
            const iouReport: Report = {
                reportID: targetReportID,
                type: CONST.REPORT.TYPE.IOU,
                chatReportID,
                ownerAccountID: currentUserAccountID,
                managerID: payerAccountID,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [payerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            // Setup chat report
            const chatReport: Report = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: targetReportID,
                ownerAccountID: currentUserAccountID,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [payerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            // Setup transaction
            const transaction: Transaction = {
                transactionID,
                reportID: selfDMReportID,
                amount: 1000,
                currency: 'USD',
                merchant: 'Test Merchant',
                created: DateUtils.getDBTime(),
                comment: {comment: 'Test expense'},
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, selfDMReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            // Call should not throw when personalDetails is provided
            expect(() => {
                convertBulkTrackedExpensesToIOU({
                    transactions: [transaction],
                    iouReport,
                    chatReport,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    personalDetails: testPersonalDetails,
                    betas: [CONST.BETAS.ALL],
                });
            }).not.toThrow();
        });

        it('should use personalDetails to look up payer email', async () => {
            const currentUserAccountID = 10;
            const currentUserEmail = 'current@test.com';
            const payerAccountID = 20;
            const payerEmail = 'payer@test.com';
            const targetReportID = 'iouReport200';
            const chatReportID = 'chatReport200';

            // Personal details with payer information
            const testPersonalDetails: PersonalDetailsList = {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    displayName: 'Current User',
                    login: currentUserEmail,
                },
                [payerAccountID]: {
                    accountID: payerAccountID,
                    displayName: 'Payer From PersonalDetails',
                    login: payerEmail,
                },
            };

            // Setup IOU report
            const iouReport: Report = {
                reportID: targetReportID,
                type: CONST.REPORT.TYPE.IOU,
                chatReportID,
                ownerAccountID: currentUserAccountID,
                managerID: payerAccountID,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [payerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            // Setup chat report
            const chatReport: Report = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: targetReportID,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [payerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await waitForBatchedUpdates();

            // The function should be able to look up payer email from personalDetails
            // Even if no transactions are provided, it should not throw
            expect(() => {
                convertBulkTrackedExpensesToIOU({
                    transactions: [],
                    iouReport,
                    chatReport,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    personalDetails: testPersonalDetails,
                    betas: [CONST.BETAS.ALL],
                });
            }).not.toThrow();
        });

        it('should handle empty personalDetails gracefully', async () => {
            const currentUserAccountID = 30;
            const currentUserEmail = 'user30@test.com';
            const targetReportID = 'iouReport300';
            const chatReportID = 'chatReport300';

            // Setup minimal IOU report
            const iouReport: Report = {
                reportID: targetReportID,
                type: CONST.REPORT.TYPE.IOU,
                chatReportID,
            };

            const chatReport: Report = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await waitForBatchedUpdates();

            // Should not throw even with empty personalDetails
            expect(() => {
                convertBulkTrackedExpensesToIOU({
                    transactions: [],
                    iouReport,
                    chatReport,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    personalDetails: undefined,
                    betas: [CONST.BETAS.ALL],
                });
            }).not.toThrow();
        });

        it('should handle undefined personalDetails gracefully', async () => {
            const currentUserAccountID = 40;
            const currentUserEmail = 'user40@test.com';
            const targetReportID = 'iouReport400';
            const chatReportID = 'chatReport400';

            // Setup minimal IOU report
            const iouReport: Report = {
                reportID: targetReportID,
                type: CONST.REPORT.TYPE.IOU,
                chatReportID,
            };

            const chatReport: Report = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await waitForBatchedUpdates();

            // Should not throw even with undefined personalDetails
            expect(() => {
                convertBulkTrackedExpensesToIOU({
                    transactions: [],
                    iouReport,
                    chatReport,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    transactionViolations: {},
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    personalDetails: undefined,
                    betas: [CONST.BETAS.ALL],
                });
            }).not.toThrow();
        });
    });
});
