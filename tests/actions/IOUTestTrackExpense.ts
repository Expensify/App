/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {waitFor} from '@testing-library/react-native';
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {convertBulkTrackedExpensesToIOU, trackExpense} from '@libs/actions/IOU';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {isActionableTrackExpense, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';
import {getValidWaypoints, isDistanceRequest as isDistanceRequestUtil} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {Accountant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Participant} from '@src/types/onyx/Report';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import currencyList from '../unit/currencyList.json';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import type {MockFetch} from '../utils/TestHelper';
import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
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

jest.mock('@src/libs/SearchQueryUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => ({
            hash: 71801560,
            query: 'test',
            type: 'expense',
            status: ['drafts', 'outstanding'],
            filters: {operator: 'eq', left: 'reimbursable', right: 'yes'},
            flatFilters: [{key: 'reimbursable', filters: [{operator: 'eq', value: 'yes'}]}],
            inputQuery: '',
            recentSearchHash: 89,
            similarSearchHash: 1832274510,
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
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;

OnyxUpdateManager();
describe('actions/IOU/TrackExpense', () => {
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
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
                {},
                undefined,
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
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
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                introSelected: undefined,
                activePolicyID: undefined,
                quickAction: undefined,
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
                convertBulkTrackedExpensesToIOU(
                    [transactionID],
                    targetReportID,
                    false, // isASAPSubmitBetaEnabled
                    currentUserAccountID,
                    currentUserEmail,
                    {}, // transactionViolations
                    [], // policyRecentlyUsedCurrencies
                    undefined, // quickAction
                    testPersonalDetails,
                );
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
                convertBulkTrackedExpensesToIOU(
                    [], // empty transaction IDs
                    targetReportID,
                    false,
                    currentUserAccountID,
                    currentUserEmail,
                    {},
                    [],
                    undefined,
                    testPersonalDetails,
                );
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
                convertBulkTrackedExpensesToIOU(
                    [],
                    targetReportID,
                    false,
                    currentUserAccountID,
                    currentUserEmail,
                    {},
                    [],
                    undefined,
                    {}, // empty personalDetails
                );
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
                convertBulkTrackedExpensesToIOU([], targetReportID, false, currentUserAccountID, currentUserEmail, {}, [], undefined, undefined);
            }).not.toThrow();
        });
    });
});
