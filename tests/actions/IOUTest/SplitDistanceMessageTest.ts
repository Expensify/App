import Onyx from 'react-native-onyx';
import {getUpdateMoneyRequestParams} from '@libs/actions/IOU';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

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

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

const TRANSACTION_ID = 'testTransactionID';
const REPORT_ID = 'testReportID';
const IOU_REPORT_ID = 'testIOUReportID';

const baseTransaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: REPORT_ID,
    amount: 1000,
    modifiedAmount: 0,
    currency: CONST.CURRENCY.USD,
    comment: {
        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
        customUnit: {
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
        },
    },
    merchant: '5.00 mi @ $0.70 / mi',
    modifiedMerchant: '',
    modifiedCurrency: '',
    created: '2024-01-01',
} as Transaction;

const transactionThreadReport: Report = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    parentReportID: IOU_REPORT_ID,
    parentReportActionID: 'testParentReportActionID',
} as Report;

const iouReport: Report = {
    reportID: IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.IOU,
    total: 1000,
    currency: CONST.CURRENCY.USD,
    ownerAccountID: RORY_ACCOUNT_ID,
} as Report;

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
    return Onyx.clear().then(waitForBatchedUpdates);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('split distance system message', () => {
    /**
     * Sets up a distance transaction in Onyx and returns params for getUpdateMoneyRequestParams.
     */
    async function setupDistanceTransaction() {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, baseTransaction);
        await waitForBatchedUpdates();
    }

    it('should NOT include optimistic report action when updating waypoints on a regular (non-split) distance expense', async () => {
        await setupDistanceTransaction();

        const {params} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {
                waypoints: {
                    waypoint0: {lat: 37.78, lng: -122.4, address: 'Start', name: 'Start'},
                    waypoint1: {lat: 37.8, lng: -122.47, address: 'End', name: 'End'},
                },
                merchant: '10.00 mi @ $0.70 / mi',
                amount: 700,
            },
            policy: undefined,
            policyTagList: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            isSplitTransaction: false,
        });

        // For regular distance expenses with pending waypoints, the server creates the
        // MODIFIED_EXPENSE action after MapBox processing, so no reportActionID should be set.
        expect(params.reportActionID).toBeUndefined();
    });

    it('should include optimistic report action when updating waypoints on a split distance expense with merchant and amount', async () => {
        await setupDistanceTransaction();

        const {params, onyxData} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {
                waypoints: {
                    waypoint0: {lat: 37.78, lng: -122.4, address: 'Start', name: 'Start'},
                    waypoint1: {lat: 37.8, lng: -122.47, address: 'End', name: 'End'},
                },
                merchant: '10.00 mi @ $0.70 / mi',
                amount: 700,
            },
            policy: undefined,
            policyTagList: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            isSplitTransaction: true,
        });

        // For split transactions, merchant and amount are already computed, so we CAN build
        // a valid optimistic MODIFIED_EXPENSE even when waypoints are pending.
        expect(params.reportActionID).toBeDefined();

        // The optimistic data should contain a REPORT_ACTIONS entry for the transaction thread report
        const reportActionsOptimisticEntry = onyxData.optimisticData?.find(
            (entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` && entry.value !== null && typeof entry.value === 'object',
        );
        expect(reportActionsOptimisticEntry).toBeDefined();
    });

    it('should NOT include optimistic report action for a split distance expense when merchant is missing from transactionChanges', async () => {
        await setupDistanceTransaction();

        const {params} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {
                waypoints: {
                    waypoint0: {lat: 37.78, lng: -122.4, address: 'Start', name: 'Start'},
                    waypoint1: {lat: 37.8, lng: -122.47, address: 'End', name: 'End'},
                },
                amount: 700,
            },
            policy: undefined,
            policyTagList: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            isSplitTransaction: true,
        });

        // Even though it's a split transaction, without merchant the hasSplitDistanceMessageFields
        // condition is false, so we should not create the optimistic report action.
        expect(params.reportActionID).toBeUndefined();
    });

    it('should NOT include optimistic report action for a split distance expense when amount is missing from transactionChanges', async () => {
        await setupDistanceTransaction();

        const {params} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {
                waypoints: {
                    waypoint0: {lat: 37.78, lng: -122.4, address: 'Start', name: 'Start'},
                    waypoint1: {lat: 37.8, lng: -122.47, address: 'End', name: 'End'},
                },
                merchant: '10.00 mi @ $0.70 / mi',
            },
            policy: undefined,
            policyTagList: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            isSplitTransaction: true,
        });

        // Without amount, hasSplitDistanceMessageFields is false, so no optimistic report action.
        expect(params.reportActionID).toBeUndefined();
    });
});
