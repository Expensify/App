/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import '@libs/actions/IOU/MoneyRequest';
import {shouldOptimisticallyUpdateSearch} from '@libs/actions/IOU/SearchUpdate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import type * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import currencyList from '../../unit/currencyList.json';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import { getQueryHashes } from '@libs/SearchQueryUtils';

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

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/IOU', () => {
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
                hash: 344995086,
                recentSearchHash: 1106848141,
                similarSearchHash: 1135147670,
            } as SearchQueryJSON;
            const iouReport: Report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

            // When the report is in draft status it should return true
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, RORY_ACCOUNT_ID, transaction)).toBeTruthy();

            // If the report is not in draft state it should return false
            iouReport.stateNum = CONST.REPORT.STATE_NUM.SUBMITTED;
            iouReport.statusNum = CONST.REPORT.STATUS_NUM.SUBMITTED;
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, RORY_ACCOUNT_ID, transaction)).toBeFalsy();
        });

        it('when the current hash is approve action query it should only return true if the iou report is in outstanding state', () => {
            const transaction = {
                ...createRandomTransaction(1),
            };
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
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
                        left: 'to',
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
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: '20671314',
                            },
                        ],
                    },
                ],
                hash: 1343227670,
                inputQuery: 'sortBy:date sortOrder:desc type:expense-report action:approve to:20671314',
                recentSearchHash: 1216776837,
                similarSearchHash: 911924256,
            } as SearchQueryJSON;
            const iouReport: Report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

            // When the report is in draft status it should return false
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, RORY_ACCOUNT_ID, transaction)).toBeFalsy();

            // If the report is in outstanding state it should return true
            iouReport.stateNum = CONST.REPORT.STATE_NUM.SUBMITTED;
            iouReport.statusNum = CONST.REPORT.STATUS_NUM.SUBMITTED;
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, RORY_ACCOUNT_ID, transaction)).toBeTruthy();
        });

        it('when the current hash is unapproved cash action query it should only return true if the iou report is in either draft or outstanding state', () => {
            const transaction = {
                ...createRandomTransaction(1),
                reimbursable: true,
            };
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                filters: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                    left: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
                        right: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                    },
                    right: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: 'reimbursable',
                        right: 'yes',
                    },
                },
                flatFilters: [
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
                        filters: [
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
                            },
                            {
                                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                                value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
                            },
                        ],
                    },
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
                hash: 280939045,
                inputQuery: 'sortBy:date sortOrder:desc type:expense groupBy:from status:drafts,outstanding reimbursable:yes',
                recentSearchHash: 2045056096,
                similarSearchHash: 1931622284,
            } as SearchQueryJSON;

            const iouReport: Report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

            // When the report is in draft status it should return true
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, RORY_ACCOUNT_ID, transaction)).toBeTruthy();

            // If the report is in approved state it should return false
            iouReport.stateNum = CONST.REPORT.STATE_NUM.APPROVED;
            iouReport.statusNum = CONST.REPORT.STATUS_NUM.APPROVED;
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, false, RORY_ACCOUNT_ID, transaction)).toBeFalsy();
        });

        it('when the current hash includes a policyID filter it should only return true if the iou report matches the policyID filter', () => {
            const transaction = {
                ...createRandomTransaction(1),
            };
            const policyID = '12345';
            const currentSearchQueryJSON = {
                type: 'expense',
                sortBy: 'date',
                sortOrder: 'desc',
                filters: {operator: 'eq', left: 'policyID', right: policyID},
                inputQuery: `type:expense sortBy:date sortOrder:desc policyID:${policyID}`,
                flatFilters: [
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
                        filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: policyID}],
                    },
                ],
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
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, matchingIOUReport, false, RORY_ACCOUNT_ID, transaction)).toBeTruthy();

            // When the IOU report has a different policyID, it should return false
            const nonMatchingIOUReport: Report = {
                ...createRandomReport(3, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'differentPolicyID',
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            expect(shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, nonMatchingIOUReport, false, RORY_ACCOUNT_ID, transaction)).toBeFalsy();
        });
    });
});
