import {getAllPersonalDetails, getAllReportActionsFromIOU, getAllReportNameValuePairs, getAllSnapshots} from '@libs/actions/IOU';
import {updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/SplitTransactionUpdate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults, Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import currencyList from '../../unit/currencyList.json';
import {getGlobalFetchMock, formatPhoneNumber, getCurrencyDecimalsLocal, getCurrencySymbolLocal} from '../../utils/TestHelper';
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
    navigationRef: {getRootState: jest.fn(), isReady: jest.fn(() => true)},
}));
jest.mock('@react-navigation/native');
jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {...originalModule, notifyNewAction: jest.fn()};
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@libs/actions/IOU/PendingNewTransactions', () => ({
    addPendingNewTransactionIDs: jest.fn(),
    deletePendingNewTransactionIDs: jest.fn(),
    isOneToTwoTransactionTransition: jest.fn(() => false),
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const EXPENSE_REPORT_ID = 'expense-report-1';
const CHAT_REPORT_ID = 'chat-report-1';
const ORIGINAL_TX_ID = 'orig-tx-1';
const KEPT_TX_ID = 'child-tx-kept';
const DROPPED_TX_ID = 'child-tx-dropped';
const SNAPSHOT_HASH = '12345';

/** Reads one search snapshot once, then disconnects. */
function readSnapshot(hash: string): Promise<OnyxEntry<SearchResults>> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            callback: (value) => {
                Onyx.disconnect(connectionID);
                resolve(value);
            },
        });
    });
}

OnyxUpdateManager();
describe('updateSplitTransactionsFromSplitExpensesFlow cached collections', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    /** The collections `DynamicSplitExpensePage` used to subscribe to purely so it could forward them here. */
    const personalDetails = {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL, displayName: 'Rory'}};
    const reportActions = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`]: {
            action1: {reportActionID: 'action1', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, created: '2024-01-01 00:00:00'},
        },
    };
    const reportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${EXPENSE_REPORT_ID}`]: {private_isArchived: ''}};
    const snapshots = {
        [`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`]: {
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${KEPT_TX_ID}`]: {transactionID: KEPT_TX_ID},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${DROPPED_TX_ID}`]: {transactionID: DROPPED_TX_ID},
            },
            search: {type: 'expense', status: 'all'},
        },
    };

    function seedOnyx() {
        return Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            ...reportActions,
            ...reportNameValuePairs,
            ...snapshots,
        } as Parameters<typeof Onyx.multiSet>[0]).then(waitForBatchedUpdates);
    }

    function buildChildTransaction(transactionID: string): Transaction {
        return {
            transactionID,
            reportID: EXPENSE_REPORT_ID,
            amount: -500,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01',
            merchant: '',
            comment: {originalTransactionID: ORIGINAL_TX_ID, source: CONST.IOU.TYPE.SPLIT},
        };
    }

    /** Params as the page now sends them: the four cached collections are omitted. */
    function buildParams(): Parameters<typeof updateSplitTransactionsFromSplitExpensesFlow>[0] {
        return {
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
            allTransactionsList: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${ORIGINAL_TX_ID}`]: {
                    transactionID: ORIGINAL_TX_ID,
                    reportID: EXPENSE_REPORT_ID,
                    amount: -1000,
                    currency: CONST.CURRENCY.USD,
                    created: '2024-01-01',
                    merchant: '',
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${KEPT_TX_ID}`]: buildChildTransaction(KEPT_TX_ID),
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${DROPPED_TX_ID}`]: buildChildTransaction(DROPPED_TX_ID),
            },
            allReportsList: {
                [`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`]: {reportID: EXPENSE_REPORT_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE},
            },
            transactionData: {
                reportID: EXPENSE_REPORT_ID,
                originalTransactionID: ORIGINAL_TX_ID,
                // Two splits keeps this off the reverse-split path; DROPPED_TX_ID is left out, so it gets deleted
                splitExpenses: [
                    {transactionID: KEPT_TX_ID, reportID: EXPENSE_REPORT_ID, statusNum: 0, amount: 500, created: '2024-01-01'},
                    {transactionID: 'new-tx-1', reportID: EXPENSE_REPORT_ID, statusNum: 0, amount: 500, created: '2024-01-01'},
                ] as SplitExpense[],
                splitExpensesTotal: 1000,
            },
            policyCategories: undefined,
            policy: undefined,
            policyRecentlyUsedCategories: undefined,
            iouReport: undefined,
            firstIOU: undefined,
            isASAPSubmitBetaEnabled: false,
            currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL, displayName: 'Rory', avatar: '', fallbackIcon: ''},
            transactionViolations: {},
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            betas: [],
            allPolicyTags: {},
            transactionReport: {reportID: EXPENSE_REPORT_ID, chatReportID: CHAT_REPORT_ID},
            expenseReport: {reportID: EXPENSE_REPORT_ID, chatReportID: CHAT_REPORT_ID},
            isOffline: false,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            formatPhoneNumber,
        };
    }

    it('hydrates the module-level caches for the collections the page no longer subscribes to', async () => {
        // Given the four collections written to Onyx
        await seedOnyx();

        // Then the action layer's own caches hold them, so it can resolve them without the page forwarding them
        expect(getAllPersonalDetails()).toMatchObject(personalDetails);
        expect(getAllReportActionsFromIOU()).toMatchObject(reportActions);
        expect(getAllReportNameValuePairs()).toMatchObject(reportNameValuePairs);
        expect(getAllSnapshots()).toMatchObject(snapshots);
    });

    it('still clears deleted splits out of search snapshots when the caller omits allSnapshots', async () => {
        // Given a cached search snapshot holding both child transactions
        await seedOnyx();

        // When the split is saved without DROPPED_TX_ID, and without the page passing allSnapshots
        updateSplitTransactionsFromSplitExpensesFlow(buildParams());
        await waitForBatchedUpdates();

        // Then the dropped split is removed from the snapshot, so search can't show it as stale.
        // Reading allSnapshots from the module cache is what makes this possible — before the
        // fallback existed, an omitted allSnapshots silently skipped this cleanup entirely.
        const snapshot = await readSnapshot(SNAPSHOT_HASH);
        expect(snapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${DROPPED_TX_ID}`]).toBeUndefined();

        // And the split that survived is untouched
        expect(snapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${KEPT_TX_ID}`]).toBeDefined();
    });
});
