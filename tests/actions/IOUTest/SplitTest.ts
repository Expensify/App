/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {requestMoney} from '@libs/actions/IOU';
import {putOnHold} from '@libs/actions/IOU/Hold';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {createWorkspace, generatePolicyID, setWorkspaceApprovalMode} from '@libs/actions/Policy/Policy';
import {rand64} from '@libs/NumberUtils';
import {getOriginalMessage, isActionOfType, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    addSplitExpenseField,
    completeSplitBill,
    evenlyDistributeSplitExpenseAmounts,
    initDraftSplitExpenseDataForEdit,
    initSplitExpense,
    initSplitExpenseItemData,
    removeSplitExpenseField,
    resetSplitExpensesByDateRange,
    setDraftSplitTransaction,
    splitBill,
    startSplitBill,
    updateSplitExpenseAmountField,
    updateSplitExpenseField,
    updateSplitTransactionsFromSplitExpensesFlow,
} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, RecentlyUsedTags, Report, ReportNameValuePairs, SearchResults} from '@src/types/onyx';
import type {Participant as IOUParticipant, SplitExpense} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Participant} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import currencyList from '../../unit/currencyList.json';
import createPersonalDetails from '../../utils/collections/personalDetails';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../../utils/waitForNetworkPromises';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
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

const unapprovedCashHash = 71801560;
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
            similarSearchHash: 1832274510,
            sortBy: 'tag',
            sortOrder: 'asc',
        })),
        buildCannedSearchQuery: jest.fn(),
    };
});

// Test user constants
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

const currentUserPersonalDetails: CurrentUserPersonalDetails = {
    ...createPersonalDetails(RORY_ACCOUNT_ID),
    login: RORY_EMAIL,
    email: RORY_EMAIL,
    displayName: RORY_EMAIL,
    avatar: 'https://example.com/avatar.jpg',
};

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
                        quickAction: undefined,
                        policyRecentlyUsedCurrencies: [],
                        policyRecentlyUsedTags: undefined,
                        betas: [CONST.BETAS.ALL],
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
                                        report?.type === CONST.REPORT.TYPE.CHAT && deepEqual(report.participants, {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [VIT_ACCOUNT_ID]: VIT_PARTICIPANT}),
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
            betas: [CONST.BETAS.ALL],
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
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            policyRecentlyUsedTags: undefined,
            betas: [CONST.BETAS.ALL],
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
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            policyRecentlyUsedTags: undefined,
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
        completeSplitBill(reportID, iouAction, updatedSplitTransaction, RORY_ACCOUNT_ID, false, undefined, {}, [CONST.BETAS.ALL], RORY_EMAIL);

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
                    const splits = Object.values(transactions ?? {}).filter((t) => t?.transactionID !== originalTransactionID && t?.comment?.originalTransactionID === originalTransactionID);
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

        // When doing a split bill with a receipt
        startSplitBill({
            participants: [{isPolicyExpenseChat: true, policyID}],
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
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            isSelfTourViewed: false,
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
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            isSelfTourViewed: false,
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
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            isSelfTourViewed: false,
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
            quickAction: undefined,
            isSelfTourViewed: false,
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
            putOnHold(originalTransactionID, 'Test hold reason', transactionThreadReportID);
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

        // When splitting the held expense
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

describe('initSplitExpense', () => {
    it('should initialize split expense with correct transaction details', async () => {
        const transaction: Transaction = {
            transactionID: '123',
            amount: -100,
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
            amount: -1700,
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

    it('should initialize split expense for distance transaction with customUnit and merchant', async () => {
        const customUnitRateID = 'rate-123';
        const customUnitID = 'distance-unit';
        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    rates: {
                        [customUnitRateID]: {
                            customUnitRateID,
                            currency: CONST.CURRENCY.USD,
                            rate: 100,
                            enabled: true,
                            name: 'Default Rate',
                            subRates: [],
                        },
                    },
                },
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const transaction: Transaction = {
            transactionID: '123',
            amount: -20000,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Distance expense',
                splitExpenses: [],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
            category: 'Car',
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

        initSplitExpense(allTransactions, allReports, transaction, policy);
        await waitForBatchedUpdates();

        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`);

        expect(draftTransaction).toBeTruthy();

        const splitExpenses = draftTransaction?.comment?.splitExpenses;
        expect(splitExpenses).toHaveLength(2);
        expect(draftTransaction?.amount).toBe(20000);
        expect(draftTransaction?.currency).toBe('USD');

        expect(splitExpenses?.[0].amount).toBe(10000);
        expect(splitExpenses?.[1].amount).toBe(10000);
        expect(splitExpenses?.[0].customUnit?.quantity).toBe(100);
        expect(splitExpenses?.[1].customUnit?.quantity).toBe(100);
        expect(splitExpenses?.[0].merchant).toBeTruthy();
        expect(splitExpenses?.[0].merchant).toContain('100');
        expect(splitExpenses?.[1].merchant).toBeTruthy();
        expect(splitExpenses?.[1].merchant).toContain('100');
    });
});

describe('addSplitExpenseField', () => {
    const expenseReport = {
        reportID: '456',
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        total: 100,
        currency: 'USD',
    };

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

        addSplitExpenseField(transaction, draftTransaction, expenseReport);
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
        addSplitExpenseField(cardTransaction, draftTransaction, expenseReport);
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

    it('should add new split expense field for distance transaction with customUnit and merchant', async () => {
        const customUnitRateID = 'rate-456';
        const customUnitID = 'distance-unit';
        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    rates: {
                        [customUnitRateID]: {
                            customUnitRateID,
                            currency: CONST.CURRENCY.USD,
                            rate: 100,
                            enabled: true,
                            name: 'Default Rate',
                            subRates: [],
                        },
                    },
                },
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const transaction: Transaction = {
            transactionID: '123',
            amount: -20000,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Distance expense',
                splitExpenses: [],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        const draftTransaction: Transaction = {
            transactionID: '123',
            amount: 20000,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Distance expense',
                splitExpenses: [
                    {
                        transactionID: '789',
                        amount: 10000,
                        description: 'Distance expense',
                        category: 'Car',
                        tags: [],
                        created: DateUtils.getDBTime(),
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID,
                            customUnitRateID,
                            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            quantity: 100,
                        },
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        const transactionReport: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            total: 20000,
            currency: 'USD',
        };

        addSplitExpenseField(transaction, draftTransaction, transactionReport, policy);
        await waitForBatchedUpdates();

        const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`);
        expect(updatedDraftTransaction).toBeTruthy();

        const splitExpenses = updatedDraftTransaction?.comment?.splitExpenses;
        expect(splitExpenses).toHaveLength(2);
        expect(splitExpenses?.[1].amount).toBe(0);
        expect(splitExpenses?.[1].customUnit).toBeTruthy();
        expect(splitExpenses?.[1].customUnit?.quantity).toBe(0);
        expect(splitExpenses?.[1].merchant).toBeDefined();
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

    it('should update distance and merchant for distance transactions when distributing amounts', async () => {
        const customUnitRateID = 'rate-dist';
        const customUnitID = 'distance-unit';
        const originalTransactionID = 'orig-dist';
        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    rates: {
                        [customUnitRateID]: {
                            customUnitRateID,
                            currency: CONST.CURRENCY.USD,
                            rate: 100,
                            enabled: true,
                            name: 'Default Rate',
                            subRates: [],
                        },
                    },
                },
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, {
            transactionID: originalTransactionID,
            amount: -20000,
            currency: 'USD',
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
        });
        await waitForBatchedUpdates();

        const draftTransaction: Transaction = {
            transactionID: 'draft-dist',
            amount: 20000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {
                comment: 'Test comment',
                originalTransactionID,
                splitExpenses: [
                    {
                        transactionID: 'x',
                        amount: 0,
                        description: 'X',
                        created: DateUtils.getDBTime(),
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID,
                            customUnitRateID,
                            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            quantity: 0,
                        },
                    },
                    {
                        transactionID: 'y',
                        amount: 0,
                        description: 'Y',
                        created: DateUtils.getDBTime(),
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID,
                            customUnitRateID,
                            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            quantity: 0,
                        },
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            created: DateUtils.getDBTime(),
            reportID: 'rep-dist',
        };

        const originalTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`);
        evenlyDistributeSplitExpenseAmounts(draftTransaction, originalTransaction, policy);
        await waitForBatchedUpdates();

        const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(updatedDraft).toBeTruthy();
        const splitExpenses = updatedDraft?.comment?.splitExpenses ?? [];

        expect(splitExpenses.at(0)?.amount).toBe(10000);
        expect(splitExpenses.at(1)?.amount).toBe(10000);
        expect(splitExpenses.at(0)?.customUnit?.quantity).toBe(100);
        expect(splitExpenses.at(1)?.customUnit?.quantity).toBe(100);
        expect(splitExpenses.at(0)?.merchant).toBeTruthy();
        expect(splitExpenses.at(0)?.merchant).toContain('100');
        expect(splitExpenses.at(1)?.merchant).toBeTruthy();
        expect(splitExpenses.at(1)?.merchant).toContain('100');
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

    it('should update distance and merchant for distance transactions when amount changes', async () => {
        const customUnitRateID = 'rate-update';
        const customUnitID = 'distance-unit';
        const originalTransactionID = '123';
        const currentTransactionID = '789';
        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    rates: {
                        [customUnitRateID]: {
                            customUnitRateID,
                            currency: CONST.CURRENCY.USD,
                            rate: 100,
                            enabled: true,
                            name: 'Default Rate',
                            subRates: [],
                        },
                    },
                },
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, {
            transactionID: originalTransactionID,
            amount: -20000,
            currency: 'USD',
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
        });
        await waitForBatchedUpdates();

        const draftTransaction: Transaction = {
            transactionID: '234',
            amount: 20000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {
                comment: 'Test comment',
                originalTransactionID,
                splitExpenses: [
                    {
                        transactionID: currentTransactionID,
                        amount: 10000,
                        description: 'Test comment',
                        category: 'Car',
                        tags: [],
                        created: DateUtils.getDBTime(),
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID,
                            customUnitRateID,
                            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            quantity: 100,
                        },
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        updateSplitExpenseAmountField(draftTransaction, currentTransactionID, 15000, policy);
        await waitForBatchedUpdates();

        const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(updatedDraftTransaction).toBeTruthy();

        const splitExpenses = updatedDraftTransaction?.comment?.splitExpenses;
        expect(splitExpenses?.[0].amount).toBe(15000);
        expect(splitExpenses?.[0].customUnit?.quantity).toBe(150);
        expect(splitExpenses?.[0].merchant).toBeTruthy();
        expect(splitExpenses?.[0].merchant).toContain('150');
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

describe('initSplitExpenseItemData', () => {
    it('should create split expense item data from transaction', () => {
        const transaction: Transaction = {
            transactionID: '123',
            amount: -100,
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

        const transactionReport: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        const splitExpense = initSplitExpenseItemData(transaction, transactionReport);

        expect(splitExpense.transactionID).toBe('123');
        expect(splitExpense.amount).toBe(100);
        expect(splitExpense.description).toBe('Test comment');
        expect(splitExpense.category).toBe('Food');
        expect(splitExpense.tags).toEqual(['lunch']);
        expect(splitExpense.merchant).toBe('Test Merchant');
        expect(splitExpense.reportID).toBe('456');
    });

    it('should use provided parameters over transaction data', () => {
        const transaction: Transaction = {
            transactionID: '123',
            amount: -100,
            currency: 'USD',
            merchant: 'Original Merchant',
            comment: {
                comment: 'Original comment',
                splitExpenses: [],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            category: 'Food',
            tag: 'lunch',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        const customUnit: TransactionCustomUnit = {
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            customUnitID: 'distance-unit',
            customUnitRateID: 'rate-123',
            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            quantity: 50,
        };

        const transactionReport: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {
            amount: 200,
            transactionID: '999',
            reportID: '888',
            created: '2024-01-01',
            merchant: 'Custom Merchant',
            customUnit,
        });

        expect(splitExpense.transactionID).toBe('999');
        expect(splitExpense.amount).toBe(200);
        expect(splitExpense.reportID).toBe('888');
        expect(splitExpense.created).toBe('2024-01-01');
        expect(splitExpense.merchant).toBe('Custom Merchant');
        expect(splitExpense.customUnit).toEqual(customUnit);
    });

    it('should handle transaction with waypoints and odometer readings', () => {
        const transaction: Transaction = {
            transactionID: '123',
            amount: -100,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {
                comment: 'Test comment',
                splitExpenses: [],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                waypoints: {
                    waypoint0: {lat: 0, lng: 0, name: 'Start'},
                    waypoint1: {lat: 1, lng: 1, name: 'End'},
                },
                odometerStart: 1000,
                odometerEnd: 1200,
            },
            category: 'Food',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        const transactionReport: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        const splitExpense = initSplitExpenseItemData(transaction, transactionReport);

        expect(splitExpense.waypoints).toEqual(transaction.comment?.waypoints);
        expect(splitExpense.odometerStart).toBe(1000);
        expect(splitExpense.odometerEnd).toBe(1200);
    });
});

describe('initDraftSplitExpenseDataForEdit', () => {
    it('should create draft transaction for editing split expense', async () => {
        const originalTransactionID = 'orig-123';
        const splitExpenseTransactionID = 'split-456';
        const reportID = 'report-789';

        const originalTransaction: Transaction = {
            transactionID: originalTransactionID,
            amount: -20000,
            currency: 'USD',
            merchant: 'Original Merchant',
            comment: {
                comment: 'Original comment',
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID: 'distance-unit',
                    customUnitRateID: 'rate-123',
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, originalTransaction);
        await waitForBatchedUpdates();

        const draftTransaction: Transaction = {
            transactionID: 'draft-123',
            amount: 20000,
            currency: 'USD',
            merchant: 'Draft Merchant',
            comment: {
                comment: 'Draft comment',
                originalTransactionID,
                splitExpenses: [
                    {
                        transactionID: splitExpenseTransactionID,
                        amount: 10000,
                        description: 'Split expense',
                        category: 'Car',
                        tags: ['tag1'],
                        created: DateUtils.getDBTime(),
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID: 'distance-unit',
                            customUnitRateID: 'rate-123',
                            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            quantity: 100,
                        },
                        waypoints: {
                            waypoint0: {lat: 0, lng: 0, name: 'Start'},
                        },
                        odometerStart: 1000,
                        odometerEnd: 1100,
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            participants: [{accountID: 1}] as IOUParticipant[],
            created: DateUtils.getDBTime(),
            reportID,
        };

        initDraftSplitExpenseDataForEdit(draftTransaction, splitExpenseTransactionID, reportID);
        await waitForBatchedUpdates();

        const editDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
        expect(editDraftTransaction).toBeTruthy();
        expect(editDraftTransaction?.amount).toBe(10000);
        expect(editDraftTransaction?.currency).toBe('USD');
        expect(editDraftTransaction?.comment?.comment).toBe('Split expense');
        expect(editDraftTransaction?.category).toBe('Car');
        expect(editDraftTransaction?.tag).toBe('tag1');
        expect(editDraftTransaction?.comment?.customUnit?.quantity).toBe(100);
        expect(editDraftTransaction?.comment?.waypoints).toEqual({
            waypoint0: {lat: 0, lng: 0, name: 'Start'},
        });
        expect(editDraftTransaction?.comment?.odometerStart).toBe(1000);
        expect(editDraftTransaction?.comment?.odometerEnd).toBe(1100);
    });

    it('should not create draft if draftTransaction or splitExpenseTransactionID is missing', async () => {
        initDraftSplitExpenseDataForEdit(undefined, 'split-456', 'report-789');
        await waitForBatchedUpdates();

        const editDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
        expect(editDraftTransaction).toBeFalsy();
    });
});

describe('resetSplitExpensesByDateRange', () => {
    it('should reset split expenses and create new ones based on date range', async () => {
        const transactionID = 'trans-123';
        const startDate = '2024-01-01';
        const endDate = '2024-01-03';

        const transaction: Transaction = {
            transactionID,
            amount: -30000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {
                comment: 'Test comment',
                splitExpenses: [],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            category: 'Food',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        const transactionReport: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        resetSplitExpensesByDateRange(transaction, transactionReport, startDate, endDate);
        await waitForBatchedUpdates();

        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
        expect(draftTransaction).toBeTruthy();

        const splitExpenses = draftTransaction?.comment?.splitExpenses;
        expect(splitExpenses).toHaveLength(3);
        expect(splitExpenses?.[0].amount).toBe(10000);
        expect(splitExpenses?.[1].amount).toBe(10000);
        expect(splitExpenses?.[2].amount).toBe(10000);
        expect(splitExpenses?.[0].created).toBe('2024-01-01');
        expect(splitExpenses?.[1].created).toBe('2024-01-02');
        expect(splitExpenses?.[2].created).toBe('2024-01-03');

        expect(draftTransaction?.comment?.splitsStartDate).toBe(startDate);
        expect(draftTransaction?.comment?.splitsEndDate).toBe(endDate);
    });

    it('should handle distance transactions with customUnit and merchant', async () => {
        const customUnitRateID = 'rate-date';
        const customUnitID = 'distance-unit';
        const transactionID = 'trans-date';
        const startDate = '2024-01-01';
        const endDate = '2024-01-02';

        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    rates: {
                        [customUnitRateID]: {
                            customUnitRateID,
                            currency: CONST.CURRENCY.USD,
                            rate: 100,
                            enabled: true,
                            name: 'Default Rate',
                            subRates: [],
                        },
                    },
                },
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const transaction: Transaction = {
            transactionID,
            amount: -20000,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Distance expense',
                splitExpenses: [],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        const transactionReport: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        resetSplitExpensesByDateRange(transaction, transactionReport, startDate, endDate, policy);
        await waitForBatchedUpdates();

        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
        expect(draftTransaction).toBeTruthy();

        const splitExpenses = draftTransaction?.comment?.splitExpenses;
        expect(splitExpenses).toHaveLength(2);
        expect(splitExpenses?.[0].amount).toBe(10000);
        expect(splitExpenses?.[1].amount).toBe(10000);
        expect(splitExpenses?.[0].customUnit?.quantity).toBe(100);
        expect(splitExpenses?.[1].customUnit?.quantity).toBe(100);
        expect(splitExpenses?.[0].merchant).toBeTruthy();
        expect(splitExpenses?.[0].merchant).toContain('100');
        expect(splitExpenses?.[1].merchant).toBeTruthy();
        expect(splitExpenses?.[1].merchant).toContain('100');
    });

    it('should not reset if transaction, startDate, or endDate is missing', async () => {
        resetSplitExpensesByDateRange(undefined, undefined, '2024-01-01', '2024-01-03');
        await waitForBatchedUpdates();
    });
});

describe('removeSplitExpenseField', () => {
    it('should remove split expense field from draft transaction', async () => {
        const originalTransactionID = 'orig-remove';
        const splitExpenseTransactionID = 'split-to-remove';

        const draftTransaction: Transaction = {
            transactionID: 'draft-remove',
            amount: 30000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {
                comment: 'Test comment',
                originalTransactionID,
                splitExpenses: [
                    {
                        transactionID: 'split-keep-1',
                        amount: 10000,
                        description: 'Keep 1',
                        created: DateUtils.getDBTime(),
                    },
                    {
                        transactionID: splitExpenseTransactionID,
                        amount: 10000,
                        description: 'To Remove',
                        created: DateUtils.getDBTime(),
                    },
                    {
                        transactionID: 'split-keep-2',
                        amount: 10000,
                        description: 'Keep 2',
                        created: DateUtils.getDBTime(),
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            created: DateUtils.getDBTime(),
            reportID: 'rep-remove',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, draftTransaction);
        await waitForBatchedUpdates();

        removeSplitExpenseField(draftTransaction, splitExpenseTransactionID);
        await waitForBatchedUpdates();

        const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(updatedDraft).toBeTruthy();

        const splitExpenses = updatedDraft?.comment?.splitExpenses;
        expect(splitExpenses).toHaveLength(2);
        expect(splitExpenses?.find((s) => s.transactionID === splitExpenseTransactionID)).toBeUndefined();
        expect(splitExpenses?.find((s) => s.transactionID === 'split-keep-1')).toBeTruthy();
        expect(splitExpenses?.find((s) => s.transactionID === 'split-keep-2')).toBeTruthy();
        expect(updatedDraft?.comment?.splitsStartDate).toBeFalsy();
        expect(updatedDraft?.comment?.splitsEndDate).toBeFalsy();
    });

    it('should not remove if draftTransaction or splitExpenseTransactionID is missing', async () => {
        removeSplitExpenseField(undefined, 'split-123');
        await waitForBatchedUpdates();
    });
});

describe('updateSplitExpenseField', () => {
    it('should update split expense field with new transaction details', async () => {
        const originalTransactionID = 'orig-update';
        const splitExpenseTransactionID = 'split-update';

        const originalTransaction: Transaction = {
            transactionID: originalTransactionID,
            amount: -20000,
            currency: 'USD',
            merchant: 'Original Merchant',
            comment: {
                comment: 'Original comment',
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            category: 'Food',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, originalTransaction);
        await waitForBatchedUpdates();

        const originalTransactionDraft: Transaction = {
            transactionID: 'draft-orig',
            amount: 20000,
            currency: 'USD',
            merchant: 'Draft Merchant',
            comment: {
                comment: 'Draft comment',
                originalTransactionID,
                splitExpenses: [
                    {
                        transactionID: splitExpenseTransactionID,
                        amount: 10000,
                        description: 'Original description',
                        category: 'Food',
                        tags: ['tag1'],
                        created: '2024-01-01',
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, originalTransactionDraft);
        await waitForBatchedUpdates();

        const splitExpenseDraftTransaction: Transaction = {
            transactionID: 'draft-split',
            amount: 15000,
            currency: 'USD',
            merchant: 'Updated Merchant',
            comment: {
                comment: 'Updated description',
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                originalTransactionID,
                waypoints: {
                    waypoint0: {lat: 0, lng: 0, name: 'Start'},
                },
                odometerStart: 1000,
                odometerEnd: 1100,
            },
            category: 'Car',
            tag: 'tag2',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        updateSplitExpenseField(splitExpenseDraftTransaction, originalTransactionDraft, splitExpenseTransactionID, originalTransaction);
        await waitForBatchedUpdates();

        const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(updatedDraft).toBeTruthy();

        const splitExpenses = updatedDraft?.comment?.splitExpenses;
        const updatedSplit = splitExpenses?.find((s) => s.transactionID === splitExpenseTransactionID);
        expect(updatedSplit).toBeTruthy();
        expect(updatedSplit?.amount).toBe(15000);
        expect(updatedSplit?.description).toBe('Updated description');
        expect(updatedSplit?.category).toBe('Car');
        expect(updatedSplit?.tags).toEqual(['tag2']);
        expect(updatedSplit?.waypoints).toEqual({
            waypoint0: {lat: 0, lng: 0, name: 'Start'},
        });
        expect(updatedSplit?.odometerStart).toBe(1000);
        expect(updatedSplit?.odometerEnd).toBe(1100);
    });

    it('should recalculate amount for distance transactions when distance changes', async () => {
        const customUnitRateID = 'rate-update-field';
        const customUnitID = 'distance-unit';
        const originalTransactionID = 'orig-dist-update';
        const splitExpenseTransactionID = 'split-dist-update';

        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {
                        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                    rates: {
                        [customUnitRateID]: {
                            customUnitRateID,
                            currency: CONST.CURRENCY.USD,
                            rate: 100,
                            enabled: true,
                            name: 'Default Rate',
                            subRates: [],
                        },
                    },
                },
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const originalTransaction: Transaction = {
            transactionID: originalTransactionID,
            amount: -20000,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Distance expense',
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 200,
                },
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, originalTransaction);
        await waitForBatchedUpdates();

        const originalTransactionDraft: Transaction = {
            transactionID: 'draft-orig-dist',
            amount: 20000,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Draft comment',
                originalTransactionID,
                splitExpenses: [
                    {
                        transactionID: splitExpenseTransactionID,
                        amount: 10000,
                        description: 'Original',
                        category: 'Car',
                        tags: [],
                        created: DateUtils.getDBTime(),
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID,
                            customUnitRateID,
                            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            quantity: 100,
                        },
                    },
                ],
                attendees: [],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, originalTransactionDraft);
        await waitForBatchedUpdates();

        const splitExpenseDraftTransaction: Transaction = {
            transactionID: 'draft-split-dist',
            amount: 0,
            currency: 'USD',
            merchant: '',
            comment: {
                comment: 'Updated description',
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                originalTransactionID,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID,
                    customUnitRateID,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    quantity: 150,
                },
            },
            category: 'Car',
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        updateSplitExpenseField(splitExpenseDraftTransaction, originalTransactionDraft, splitExpenseTransactionID, originalTransaction, policy);
        await waitForBatchedUpdates();

        const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(updatedDraft).toBeTruthy();

        const splitExpenses = updatedDraft?.comment?.splitExpenses;
        const updatedSplit = splitExpenses?.find((s) => s.transactionID === splitExpenseTransactionID);
        expect(updatedSplit).toBeTruthy();
        expect(updatedSplit?.amount).toBe(15000);
        expect(updatedSplit?.customUnit?.quantity).toBe(150);
        expect(updatedSplit?.merchant).toBeTruthy();
        expect(updatedSplit?.merchant).toContain('150');
    });

    it('should reset date range if created date is modified', async () => {
        const originalTransactionID = 'orig-date-reset';
        const splitExpenseTransactionID = 'split-date-reset';

        const originalTransaction: Transaction = {
            transactionID: originalTransactionID,
            amount: -20000,
            currency: 'USD',
            merchant: '',
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, originalTransaction);
        await waitForBatchedUpdates();

        const originalTransactionDraft: Transaction = {
            transactionID: 'draft-date',
            amount: 20000,
            currency: 'USD',
            merchant: '',
            comment: {
                originalTransactionID,
                splitsStartDate: '2024-01-01',
                splitsEndDate: '2024-01-03',
                splitExpenses: [
                    {
                        transactionID: splitExpenseTransactionID,
                        amount: 10000,
                        description: 'Test',
                        created: '2024-01-01',
                    },
                ],
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            },
            created: DateUtils.getDBTime(),
            reportID: '456',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, originalTransactionDraft);
        await waitForBatchedUpdates();

        const splitExpenseDraftTransaction: Transaction = {
            transactionID: 'draft-split-date',
            amount: 10000,
            currency: 'USD',
            merchant: '',
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                originalTransactionID,
            },
            created: '2024-01-05',
            reportID: '456',
        };

        updateSplitExpenseField(splitExpenseDraftTransaction, originalTransactionDraft, splitExpenseTransactionID, originalTransaction);
        await waitForBatchedUpdates();

        const updatedDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(updatedDraft).toBeTruthy();
        expect(updatedDraft?.comment?.splitsStartDate).toBeFalsy();
        expect(updatedDraft?.comment?.splitsEndDate).toBeFalsy();
    });
});
