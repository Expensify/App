/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getReportPreviewAction} from '@libs/actions/IOU';
import {deleteMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import {requestMoney} from '@libs/actions/IOU/TrackExpense';
import {updateMoneyRequestAmountAndCurrency} from '@libs/actions/IOU/UpdateMoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {addComment, openReport} from '@libs/actions/Report';
import {subscribeToUserEvents} from '@libs/actions/User';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, getReportActionMessage, getReportActionText, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport} from '@libs/ReportUtils';
import {buildTransactionThread, isIOUReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, Report} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import PusherHelper from '../../utils/PusherHelper';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData, setPersonalDetails, signInWithTestUser} from '../../utils/TestHelper';
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
jest.mock('@libs/deferredLayoutWrite', () => ({
    registerDeferredWrite: (_key: string, callback: () => void) => callback(),
    flushDeferredWrite: jest.fn(),
    cancelDeferredWrite: jest.fn(),
    hasDeferredWrite: () => false,
    getOptimisticWatchKey: () => undefined,
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const TEST_INTRO_SELECTED: IntroSelected = {
    choice: CONST.ONBOARDING_CHOICES.SUBMIT,
    isInviteOnboardingComplete: false,
};

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const CARLOS_ACCOUNT_ID = 1;

OnyxUpdateManager();

describe('actions/IOU/DeleteMoneyRequest', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        mockFetch?.mockClear();
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
        let IOU_REPORT: OnyxEntry<Report>;
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
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
            IOU_REPORT = iouReport;

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
            let allTransactions: OnyxCollection<Transaction>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (val) => {
                    allTransactions = val;
                },
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
                deleteMoneyRequest({
                    transactionID: transaction?.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    isChatIOUReportArchived: true,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
                deleteMoneyRequest({
                    transactionID: transaction?.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    isChatIOUReportArchived: true,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            // When we attempt to delete an expense from the IOU report
            mockFetch?.pause?.();
            if (transaction && createIOUAction) {
                deleteMoneyRequest({
                    transactionID: transaction?.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participantLoginList: userLogins,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
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
                deleteMoneyRequest({
                    transactionID: transaction?.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participantLoginList: userLogins,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
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
                    transactionThreadReport: thread,
                    parentReport: iouReport,
                    transactionViolations: {},
                    amount: 20000,
                    currency: CONST.CURRENCY.USD,
                    taxAmount: 0,
                    taxCode: '',
                    taxValue: '',
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
                    policyRecentlyUsedCurrencies: [],
                    parentReportNextStep: undefined,
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
                deleteMoneyRequest({
                    transactionID: transaction?.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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

        it('should delete the transaction thread regardless of whether there are visible comments in the thread.', async () => {
            // Given initial environment is set up
            await waitForBatchedUpdates();

            // Given a transaction thread
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            jest.advanceTimersByTime(10);
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participantLoginList: userLogins,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
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
            addComment({
                report: thread,
                notifyReportID: thread.reportID,
                ancestors: [],
                text: 'Testing a comment',
                timezoneParam: CONST.DEFAULT_TIME_ZONE,
                currentUserAccountID: RORY_ACCOUNT_ID,
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

            mockFetch?.pause?.();

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
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.reportActionID === createIOUAction?.reportActionID,
            );

            if (transaction && createIOUAction) {
                // When deleting expense
                deleteMoneyRequest({
                    transactionID: transaction?.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
            }
            await waitForBatchedUpdates();

            // Then the transaction thread report should be ready to be deleted
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.reportID).toBeFalsy();
                        resolve();
                    },
                });
            });

            // When fetch resumes
            // Then the transaction thread report should be deleted
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the transaction thread report should be deleted
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report).toBeFalsy();
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
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participantLoginList: userLogins,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });

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

            addComment({
                report: thread,
                notifyReportID: thread.reportID,
                ancestors: [],
                text: 'Testing a comment',
                timezoneParam: CONST.DEFAULT_TIME_ZONE,
                currentUserAccountID: RORY_ACCOUNT_ID,
            });
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
                addComment({
                    report: IOU_REPORT,
                    notifyReportID: IOU_REPORT_ID,
                    ancestors: [],
                    text: 'Testing a comment',
                    timezoneParam: CONST.DEFAULT_TIME_ZONE,
                    currentUserAccountID: RORY_ACCOUNT_ID,
                });
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
                deleteMoneyRequest({
                    transactionID: transaction.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    isChatIOUReportArchived: undefined,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
                    policyRecentlyUsedCurrencies: [],
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                    isSelfTourViewed: false,
                    quickAction: undefined,
                    betas: [CONST.BETAS.ALL],
                    personalDetails: {},
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
                deleteMoneyRequest({
                    transactionID: transaction.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    isChatIOUReportArchived: undefined,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            await waitForBatchedUpdates();

            // Given a thread report
            jest.advanceTimersByTime(10);
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toStrictEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            jest.advanceTimersByTime(10);
            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participantLoginList: userLogins,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
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
                navigateToAfterDelete = deleteMoneyRequest({
                    transactionID: transaction.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    isSingleTransactionView: true,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
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
                navigateToAfterDelete = deleteMoneyRequest({
                    transactionID: transaction.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
            }
            // Then we expect to navigate to the chat report
            expect(chatReport?.reportID).not.toBeUndefined();

            if (chatReport?.reportID) {
                expect(navigateToAfterDelete).toEqual(ROUTES.REPORT_WITH_ID.getRoute(chatReport?.reportID));
            }
        });

        it('update reportPreview with childVisibleActionCount if the IOU report is not deleted', async () => {
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
                    transactionViolations: {},
                    currentUserAccountIDParam: 123,
                    currentUserEmailParam: 'existing@example.com',
                    policyRecentlyUsedCurrencies: [],
                    quickAction: undefined,
                    isSelfTourViewed: false,
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                    betas: [CONST.BETAS.ALL],
                    personalDetails: {},
                });
            }

            await waitForBatchedUpdates();

            // Then we expect the IOU report and reportPreview to update with new totals

            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(30000);

            await waitForBatchedUpdates();

            // Given a transaction thread
            thread = buildTransactionThread(createIOUAction, iouReport);

            expect(thread.participants).toEqual({[CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, role: CONST.REPORT.ROLE.ADMIN}});

            const participantAccountIDs = Object.keys(thread.participants ?? {}).map(Number);
            const userLogins = getLoginsByAccountIDs(participantAccountIDs);
            jest.advanceTimersByTime(10);
            openReport({
                reportID: thread.reportID,
                introSelected: TEST_INTRO_SELECTED,
                betas: undefined,
                participantLoginList: userLogins,
                newReportObject: thread,
                parentReportActionID: createIOUAction?.reportActionID,
            });
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
            let iouPreview = getReportPreviewAction(chatReport?.reportID, iouReport?.reportID);
            const ancestors = [];
            ancestors.push(...(iouReport && createIOUAction ? [{report: iouReport, reportAction: createIOUAction, shouldDisplayNewMarker: false}] : []));
            ancestors.push(...(chatReport && iouPreview ? [{report: chatReport, reportAction: iouPreview, shouldDisplayNewMarker: false}] : []));
            addComment({
                report: thread,
                notifyReportID: thread.reportID,
                ancestors,
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

            // Then the childVisibleActionCount of createIOUAction and iouPreview should be increased by 1
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
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                    isMoneyRequestAction(reportAction as ReportAction) && (reportAction as ReportAction).reportActionID === createIOUAction?.reportActionID,
            );
            expect(createIOUAction).toBeTruthy();
            expect(createIOUAction?.childVisibleActionCount).toEqual(1);
            expect(createIOUAction?.childCommenterCount).toEqual(1);

            iouPreview = getReportPreviewAction(chatReport?.reportID, iouReport?.reportID);
            expect(iouPreview).toBeTruthy();
            expect(iouPreview?.childVisibleActionCount).toEqual(1);
            expect(iouPreview?.childCommenterCount).toEqual(1);

            // When we delete the first expense
            mockFetch?.pause?.();
            jest.advanceTimersByTime(10);
            if (transaction && createIOUAction) {
                deleteMoneyRequest({
                    transactionID: transaction.transactionID,
                    reportAction: createIOUAction,
                    transactions: {},
                    violations: {},
                    iouReport,
                    chatReport,
                    allTransactionViolationsParam: {},
                    currentUserAccountID: TEST_USER_ACCOUNT_ID,
                    currentUserEmail: TEST_USER_LOGIN,
                });
            }

            await waitForBatchedUpdates();

            // Then we expect the reportPreview to update with new childVisibleActionCount

            iouPreview = getReportPreviewAction(chatReport?.reportID, iouReport?.reportID);
            expect(iouPreview).toBeTruthy();
            expect(iouPreview?.childVisibleActionCount).toEqual(0);
            expect(iouPreview?.childCommenterCount).toEqual(0);

            // When we resume
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then we expect the reportPreview to update with new childVisibleActionCount
            iouPreview = getReportPreviewAction(chatReport?.reportID, iouReport?.reportID);
            expect(iouPreview).toBeTruthy();
            expect(iouPreview?.childVisibleActionCount).toEqual(0);
            expect(iouPreview?.childCommenterCount).toEqual(0);
        });
    });

    describe('bulk deleteMoneyRequest', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@email.com';

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
            deleteMoneyRequest({
                transactionID: transaction1.transactionID,
                reportAction: moneyRequestAction1,
                transactions: {},
                violations: {},
                iouReport: expenseReport,
                chatReport: expenseReport,
                transactionIDsPendingDeletion: [],
                selectedTransactionIDs,
                allTransactionViolationsParam: {},
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                currentUserEmail: TEST_USER_LOGIN,
            });
            deleteMoneyRequest({
                transactionID: transaction2.transactionID,
                reportAction: moneyRequestAction2,
                transactions: {},
                violations: {},
                iouReport: expenseReport,
                chatReport: expenseReport,
                transactionIDsPendingDeletion: [transaction1.transactionID],
                selectedTransactionIDs,
                allTransactionViolationsParam: {},
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                currentUserEmail: TEST_USER_LOGIN,
            });
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

    describe('deleteMoneyRequest with allTransactionViolationsParam', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@email.com';
        it('should pass transaction violations to hasOutstandingChildRequest correctly', async () => {
            // Given an expense report with a transaction
            const expenseReport: Report = {
                ...createRandomReport(20, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 100,
                currency: CONST.CURRENCY.USD,
            };

            const transaction1: Transaction = {
                ...createRandomTransaction(20),
                amount: 100,
                currency: CONST.CURRENCY.USD,
                reportID: expenseReport.reportID,
                reimbursable: true,
            };

            const moneyRequestAction1: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                ...createRandomReportAction(20),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: '20',
                originalMessage: {
                    IOUReportID: expenseReport.reportID,
                    amount: transaction1.amount,
                    currency: transaction1.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                message: undefined,
                previousMessage: undefined,
            };

            // When we set up the transaction and report in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            // And we call deleteMoneyRequest with transaction violations
            const transactionViolations = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction1.transactionID}`]: [
                    {
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                    },
                ],
            };

            deleteMoneyRequest({
                transactionID: transaction1.transactionID,
                reportAction: moneyRequestAction1,
                transactions: {},
                violations: {},
                iouReport: expenseReport,
                chatReport: expenseReport,
                allTransactionViolationsParam: transactionViolations,
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                currentUserEmail: TEST_USER_LOGIN,
            });

            await waitForBatchedUpdates();

            // Then the transaction should be deleted
            const deletedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });

            expect(deletedTransaction).toBeUndefined();
        });

        it('should handle empty transaction violations correctly', async () => {
            // Given an expense report with a transaction
            const expenseReport: Report = {
                ...createRandomReport(21, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 50,
                currency: CONST.CURRENCY.USD,
            };

            const transaction1: Transaction = {
                ...createRandomTransaction(21),
                amount: 50,
                currency: CONST.CURRENCY.USD,
                reportID: expenseReport.reportID,
                reimbursable: true,
            };

            const moneyRequestAction1: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                ...createRandomReportAction(21),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: '21',
                originalMessage: {
                    IOUReportID: expenseReport.reportID,
                    amount: transaction1.amount,
                    currency: transaction1.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                message: undefined,
                previousMessage: undefined,
            };

            // When we set up the transaction and report in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            // And we call deleteMoneyRequest with empty transaction violations
            deleteMoneyRequest({
                transactionID: transaction1.transactionID,
                reportAction: moneyRequestAction1,
                transactions: {},
                violations: {},
                iouReport: expenseReport,
                chatReport: expenseReport,
                allTransactionViolationsParam: {},
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                currentUserEmail: TEST_USER_LOGIN,
            });

            await waitForBatchedUpdates();

            // Then the transaction should be deleted
            const deletedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });

            expect(deletedTransaction).toBeUndefined();
        });
    });
});
