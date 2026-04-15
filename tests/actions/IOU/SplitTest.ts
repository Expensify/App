/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {createDistanceRequest} from '@libs/actions/IOU/Split';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {notifyNewAction} from '@libs/actions/Report';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, RecentlyUsedTags, Report} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import currencyList from '../../unit/currencyList.json';
import createPersonalDetails from '../../utils/collections/personalDetails';
import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData} from '../../utils/TestHelper';
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
jest.mock('@libs/deferredLayoutWrite', () => ({
    registerDeferredWrite: (_key: string, callback: () => void) => callback(),
    flushDeferredWrite: jest.fn(),
    cancelDeferredWrite: jest.fn(),
    hasDeferredWrite: () => false,
    getOptimisticWatchKey: () => undefined,
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

jest.mock('@src/libs/SearchQueryUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => undefined),
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
describe('actions/IOU/Split', () => {
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
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1}, recentWaypoints),
                participants: [],
            });

            expect(notifyNewAction).toHaveBeenCalledTimes(0);
        });

        it('triggers notifyNewAction when creating distance request in a chat report', async () => {
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123'}, {amount: 1}, recentWaypoints),
                participants: [],
            });

            expect(notifyNewAction).toHaveBeenCalledTimes(1);
        });

        it('correctly sets quickAction', async () => {
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [],
            });
            await waitForBatchedUpdates();

            expect(await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE)).toHaveProperty('isFirstQuickAction', true);

            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [],
                quickAction: {action: CONST.QUICK_ACTIONS.SEND_MONEY, chatReportID: '456'},
            });
            await waitForBatchedUpdates();

            expect(await getOnyxValue(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE)).toMatchObject({
                action: CONST.QUICK_ACTIONS.SPLIT_DISTANCE,
                isFirstQuickAction: false,
            });
        });

        it('merges policyRecentlyUsedCurrencies into recently used currencies', async () => {
            const initialCurrencies = [CONST.CURRENCY.USD, CONST.CURRENCY.EUR];
            await Onyx.set(ONYXKEYS.RECENTLY_USED_CURRENCIES, initialCurrencies);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest({
                ...getDefaultDistanceRequestParams({reportID: '123', type: CONST.REPORT.TYPE.EXPENSE}, {amount: 1, currency: CONST.CURRENCY.GBP}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                policyRecentlyUsedCurrencies: initialCurrencies,
                personalDetails: mockPersonalDetails,
            });
            await waitForBatchedUpdates();

            const recentlyUsedCurrencies = await getOnyxValue(ONYXKEYS.RECENTLY_USED_CURRENCIES);
            expect(recentlyUsedCurrencies).toEqual([CONST.CURRENCY.GBP, ...initialCurrencies]);
        });

        it('should update policyRecentlyUsedTags when tag is provided', async () => {
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

            createDistanceRequest({
                ...getDefaultDistanceRequestParams(iouReport, {amount: 1, currency: CONST.CURRENCY.GBP, tag: transactionTag}, recentWaypoints),
                policyParams: {policyRecentlyUsedTags},
            });
            await waitForBatchedUpdates();

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

            createDistanceRequest({
                ...getDefaultDistanceRequestParams(policyExpenseChat, {amount: 1, currency: CONST.CURRENCY.GBP, tag: transactionTag}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [policyExpenseChat],
                policyParams: {policyRecentlyUsedTags},
            });
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            const validWaypoints: WaypointCollection = {
                waypoint0: {lat: 37.7749, lng: -122.4194, address: '1 Market Street, San Francisco, CA, USA', name: '1 Market Street'},
                waypoint1: {lat: 37.8044, lng: -122.2712, address: '1 Broadway, Oakland, CA, USA', name: '1 Broadway'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(
                getDefaultDistanceRequestParams(
                    testReport,
                    {merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, comment: 'Distance request test', validWaypoints, distance: 15000},
                    recentWaypoints,
                ),
            );
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: 0, distance: 0}, recentWaypoints));
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            const validWaypoints: WaypointCollection = {
                waypoint0: {lat: 37.7749, lng: -122.4194, address: '1 Market Street, San Francisco, CA, USA', name: '1 Market Street'},
                waypoint1: {lat: 37.8044, lng: -122.2712, address: '1 Broadway, Oakland, CA, USA', name: '1 Broadway'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest({
                ...getDefaultDistanceRequestParams(testReport, {amount: 3000, merchant: 'Distance Split', comment: 'Split distance test', validWaypoints, distance: 30000}, recentWaypoints),
                iouType: CONST.IOU.TYPE.SPLIT,
                participants: [
                    {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL},
                    {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL},
                ],
            });
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: 500, comment: 'Odometer test', odometerStart: 10000, odometerEnd: 10050}, recentWaypoints));
            await waitForBatchedUpdates();

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
            const policyID = 'testPolicy123';
            const testCategory = 'Travel';
            const fakePolicy = {...createRandomPolicy(1), id: policyID};
            const fakeCategories = {[testCategory]: {name: testCategory, enabled: true}};
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

            createDistanceRequest({
                ...getDefaultDistanceRequestParams(policyExpenseChat, {amount: 2500, merchant: 'Work Trip', comment: 'Business travel', category: testCategory}, recentWaypoints),
                policyParams: {policy: fakePolicy, policyCategories: fakeCategories},
            });
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            const validWaypoints: WaypointCollection = {
                waypoint0: {lat: 40.7128, lng: -74.006, address: '123 Broadway, New York, NY, USA', name: '123 Broadway'},
                waypoint1: {lat: 40.758, lng: -73.9855, address: 'Times Square, New York, NY, USA', name: 'Times Square'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            await Onyx.set(ONYXKEYS.NVP_RECENT_WAYPOINTS, []);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: 1500, validWaypoints}, recentWaypoints));
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(
                getDefaultDistanceRequestParams(testReport, {amount: 5000, currency: CONST.CURRENCY.EUR, merchant: 'Euro Trip', comment: 'European travel'}, recentWaypoints),
            );
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
            const largeAmount = 999999999;

            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: largeAmount, merchant: 'Long Trip', comment: 'Very long distance'}, recentWaypoints));
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
            const specialComment = 'Trip with special chars: <>&"\'äöü中文🚗';

            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {comment: specialComment}, recentWaypoints));
            await waitForBatchedUpdates();

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
            expect(createdTransaction?.comment?.comment).toContain('Trip with special chars');
            expect(createdTransaction?.comment?.comment).toContain('äöü');
            expect(createdTransaction?.comment?.comment).toContain('中文');
        });

        it('creates optimistic transaction with pending action when API is paused', async () => {
            const testReport = createRandomReport(1, undefined);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            mockFetch?.pause?.();
            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {comment: 'API failure test'}, recentWaypoints));
            await waitForBatchedUpdates();

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

            createDistanceRequest({
                ...getDefaultDistanceRequestParams(testReport, {amount: 1500, comment: 'Billable distance', billable: true}, recentWaypoints),
                policyParams: {policy: fakePolicy},
            });
            await waitForBatchedUpdates();

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

            createDistanceRequest({
                ...getDefaultDistanceRequestParams(testReport, {comment: 'Tax distance', taxCode: testTaxCode, taxAmount: testTaxAmount}, recentWaypoints),
                policyParams: {policy: fakePolicy},
            });
            await waitForBatchedUpdates();

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
            const testReport = createRandomReport(1, undefined);
            const testAttendees: Attendee[] = [
                {email: RORY_EMAIL, displayName: 'Rory', avatarUrl: ''},
                {email: CARLOS_EMAIL, displayName: 'Carlos', avatarUrl: ''},
            ];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${testReport.reportID}`, testReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(getDefaultDistanceRequestParams(testReport, {amount: 2000, attendees: testAttendees, merchant: 'Group Trip', comment: 'Team travel'}, recentWaypoints));
            await waitForBatchedUpdates();

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
            const initialReports = await getOnyxValue(ONYXKEYS.COLLECTION.REPORT);
            const initialReportsCount = Object.keys(initialReports ?? {}).length;
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            createDistanceRequest(getDefaultDistanceRequestParams(undefined, {}, recentWaypoints));
            await waitForBatchedUpdates();

            const allReports = await getOnyxValue(ONYXKEYS.COLLECTION.REPORT);
            const allTransactions = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);
            expect(Object.keys(allReports ?? {}).length).toBeGreaterThan(initialReportsCount);
            expect(Object.keys(allTransactions ?? {}).length).toBeGreaterThanOrEqual(1);
            const createdTransaction = Object.values(allTransactions ?? {}).at(0) as Transaction | undefined;
            expect(createdTransaction).toBeTruthy();
        });
    });
});
