import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/Split';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import createPersonalDetails from '../../utils/collections/personalDetails';
import {createSelfDM} from '../../utils/collections/reports';
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

jest.mock('@src/libs/SearchQueryUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockReturnValue(null),
        buildCannedSearchQuery: jest.fn(),
    };
});

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mockFetch: MockFetch;

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
        },
    });
    initOnyxDerivedValues();
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

describe('updateSplitTransactionsFromSplitExpensesFlow - selfDM', () => {
    /**
     * Creates a tracked expense in a selfDM report and returns the related objects.
     */
    async function setupSelfDMTrackedExpense() {
        const selfDMReport = createSelfDM(1, RORY_ACCOUNT_ID);
        const originalTransactionID = 'orig-txn-selfDM';

        const originalTransaction: Transaction = {
            transactionID: originalTransactionID,
            // Tracked expenses live in the selfDM report (not UNREPORTED_REPORT_ID)
            reportID: selfDMReport.reportID,
            amount: -2000,
            currency: CONST.CURRENCY.USD,
            created: DateUtils.getDBTime(),
            merchant: 'Grocery Store',
            comment: {comment: ''},
        } as Transaction;

        const trackIouAction = {
            ...buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                amount: 2000,
                currency: CONST.CURRENCY.USD,
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID: originalTransactionID,
                isPersonalTrackingExpense: true,
            }),
        } as ReportAction;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`, originalTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`, {
            [trackIouAction.reportActionID]: trackIouAction,
        });
        await waitForBatchedUpdates();

        return {selfDMReport, originalTransaction, trackIouAction};
    }

    it('stores new IOU actions in the selfDM report when splitting a tracked expense', async () => {
        const {selfDMReport, originalTransaction, trackIouAction} = await setupSelfDMTrackedExpense();

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
                reportID: selfDMReport.reportID,
                originalTransactionID: originalTransaction.transactionID,
                splitExpenses: [
                    {
                        transactionID: 'split-txn-1',
                        amount: 1000,
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        created: DateUtils.getDBTime(),
                        merchant: 'Grocery Store',
                    },
                    {
                        transactionID: 'split-txn-2',
                        amount: 1000,
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        created: DateUtils.getDBTime(),
                        merchant: 'Grocery Store',
                    },
                ],
                splitExpensesTotal: 2000,
            },
            searchContext: {currentSearchHash: -2},
            policyCategories: undefined,
            policy: undefined,
            policyRecentlyUsedCategories: [],
            iouReport: undefined,
            firstIOU: trackIouAction,
            isASAPSubmitBetaEnabled: false,
            currentUserPersonalDetails,
            transactionViolations: {},
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            iouReportNextStep: undefined,
            betas: [CONST.BETAS.ALL],
            policyTags: {},
            personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
            transactionReport: selfDMReport,
            expenseReport: undefined,
        });

        await waitForBatchedUpdates();
        await waitForNetworkPromises();
        await waitForBatchedUpdates();

        const selfDMReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`);
        const splitIouActions = Object.values(selfDMReportActions ?? {}).filter((action): action is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => isMoneyRequestAction(action));

        // Both new split IOU actions should be stored in the selfDM report
        expect(splitIouActions.length).toBeGreaterThanOrEqual(2);
    });

    it('new split transactions retain UNREPORTED_REPORT_ID when splitting a selfDM tracked expense', async () => {
        const {selfDMReport, originalTransaction, trackIouAction} = await setupSelfDMTrackedExpense();

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
                reportID: selfDMReport.reportID,
                originalTransactionID: originalTransaction.transactionID,
                splitExpenses: [
                    {
                        transactionID: 'split-txn-A',
                        amount: 1000,
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        created: DateUtils.getDBTime(),
                        merchant: 'Grocery Store',
                    },
                    {
                        transactionID: 'split-txn-B',
                        amount: 1000,
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        created: DateUtils.getDBTime(),
                        merchant: 'Grocery Store',
                    },
                ],
                splitExpensesTotal: 2000,
            },
            searchContext: {currentSearchHash: -2},
            policyCategories: undefined,
            policy: undefined,
            policyRecentlyUsedCategories: [],
            iouReport: undefined,
            firstIOU: trackIouAction,
            isASAPSubmitBetaEnabled: false,
            currentUserPersonalDetails,
            transactionViolations: {},
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            iouReportNextStep: undefined,
            betas: [CONST.BETAS.ALL],
            policyTags: {},
            personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
            transactionReport: selfDMReport,
            expenseReport: undefined,
        });

        await waitForBatchedUpdates();
        await waitForNetworkPromises();
        await waitForBatchedUpdates();

        const splitTxn1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}split-txn-A`);
        const splitTxn2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}split-txn-B`);

        // selfDM split transactions should keep UNREPORTED_REPORT_ID (not get assigned to an IOU report)
        expect(splitTxn1?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
        expect(splitTxn2?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
    });

    it('does NOT create a new IOU expense report when splitting a selfDM tracked expense', async () => {
        const {selfDMReport, originalTransaction, trackIouAction} = await setupSelfDMTrackedExpense();

        let allTransactions: OnyxCollection<Transaction>;
        let allReports: OnyxCollection<Report>;
        let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
        const reportsBefore: string[] = [];

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
                for (const key of Object.keys(value ?? {})) {
                    reportsBefore.push(key);
                }
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
                reportID: selfDMReport.reportID,
                originalTransactionID: originalTransaction.transactionID,
                splitExpenses: [
                    {
                        transactionID: 'split-txn-C',
                        amount: 1000,
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        created: DateUtils.getDBTime(),
                        merchant: 'Grocery Store',
                    },
                    {
                        transactionID: 'split-txn-D',
                        amount: 1000,
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        created: DateUtils.getDBTime(),
                        merchant: 'Grocery Store',
                    },
                ],
                splitExpensesTotal: 2000,
            },
            searchContext: {currentSearchHash: -2},
            policyCategories: undefined,
            policy: undefined,
            policyRecentlyUsedCategories: [],
            iouReport: undefined,
            firstIOU: trackIouAction,
            isASAPSubmitBetaEnabled: false,
            currentUserPersonalDetails,
            transactionViolations: {},
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            iouReportNextStep: undefined,
            betas: [CONST.BETAS.ALL],
            policyTags: {},
            personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
            transactionReport: selfDMReport,
            expenseReport: undefined,
        });

        await waitForBatchedUpdates();
        await waitForNetworkPromises();
        await waitForBatchedUpdates();

        let newIouReport: OnyxEntry<Report> | undefined;
        await getOnyxData({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (allReportsAfter) => {
                // Check if any NEW IOU-type report was created after the split
                newIouReport = Object.entries(allReportsAfter ?? {})
                    .filter(([key]) => !reportsBefore.includes(key))
                    .map(([, report]) => report)
                    .find((report) => report?.type === CONST.REPORT.TYPE.IOU);
            },
        });

        // No new IOU expense report should be created for selfDM splits
        expect(newIouReport).toBeUndefined();
    });
});
