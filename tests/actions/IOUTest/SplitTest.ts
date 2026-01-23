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
import {completeSplitBill, splitBill, startSplitBill, updateSplitTransactionsFromSplitExpensesFlow} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RecentlyUsedTags, Report, ReportNameValuePairs, SearchResults} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Participant} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import currencyList from '../../unit/currencyList.json';
import createPersonalDetails from '../../utils/collections/personalDetails';
import {createRandomReport} from '../../utils/collections/reports';
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
        completeSplitBill(reportID, iouAction, updatedSplitTransaction, RORY_ACCOUNT_ID, false, undefined, {}, RORY_EMAIL);

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
            selfTourViewed: false,
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
            selfTourViewed: false,
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
            selfTourViewed: false,
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
            selfTourViewed: false,
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
