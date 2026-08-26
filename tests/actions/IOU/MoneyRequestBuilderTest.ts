import {calculateDiffAmount, getReportPreviewReportAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import '@libs/actions/IOU/MoneyRequest';
import type * as PolicyUtils from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';

import currencyList from '../../unit/currencyList.json';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';
import {getGlobalFetchMock} from '../../utils/TestHelper';
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

    describe('calculateDiffAmount', () => {
        it('should return 0 if iouReport is undefined', () => {
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: '1',
                amount: 100,
                currency: 'USD',
            };

            expect(calculateDiffAmount(undefined, fakeTransaction, fakeTransaction)).toBe(0);
        });

        it('should return 0 when the currency and amount of the transactions are the same', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: 'USD',
            };

            expect(calculateDiffAmount(fakeReport, fakeTransaction, fakeTransaction)).toBe(0);
        });

        it('should return the difference between the updated amount and the current amount when the currency of the updated and current transactions have the same currency', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                currency: 'USD',
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                amount: 100,
                currency: 'USD',
            };
            const updatedTransaction = {
                ...fakeTransaction,
                amount: 200,
                currency: 'USD',
            };

            expect(calculateDiffAmount(fakeReport, updatedTransaction, fakeTransaction)).toBe(-100);
        });

        it('should return null when the currency of the updated and current transactions have different values', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                amount: 100,
                currency: 'USD',
            };
            const updatedTransaction = {
                ...fakeTransaction,
                amount: 200,
                currency: 'EUR',
            };

            expect(calculateDiffAmount(fakeReport, updatedTransaction, fakeTransaction)).toBeNull();
        });

        it('should return 0 when the currency and amount of the transactions are the same for an invoice report', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: fakeReport.reportID,
                amount: 100,
                currency: 'USD',
            };

            expect(calculateDiffAmount(fakeReport, fakeTransaction, fakeTransaction)).toBe(0);
        });

        it('should return the correct diff for an invoice report (same sign convention as expense reports)', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                currency: 'USD',
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                amount: 100,
                currency: 'USD',
            };
            const updatedTransaction = {
                ...fakeTransaction,
                amount: 200,
                currency: 'USD',
            };

            expect(calculateDiffAmount(fakeReport, updatedTransaction, fakeTransaction)).toBe(-100);
        });

        it('should return null when the currency of the updated and current transactions differ for an invoice report', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: '1',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
                amount: 100,
                currency: 'USD',
            };
            const updatedTransaction = {
                ...fakeTransaction,
                amount: 200,
                currency: 'EUR',
            };

            expect(calculateDiffAmount(fakeReport, updatedTransaction, fakeTransaction)).toBeNull();
        });
    });

    describe('getReportPreviewReportAction', () => {
        const chatReportID = 'chatReport1';
        const iouReportID = 'iouReport1';

        const createReportPreviewAction = (linkedReportID: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> => ({
            reportActionID: 'previewAction1',
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            created: '2024-01-01 12:00:00',
            originalMessage: {linkedReportID},
            message: [{type: 'COMMENT', text: ''}],
        });

        it('returns the REPORT_PREVIEW action whose linkedReportID matches iouReportID', () => {
            const previewAction = createReportPreviewAction(iouReportID);
            const chatReportActions: ReportActions = {[previewAction.reportActionID]: previewAction};

            expect(getReportPreviewReportAction(chatReportID, iouReportID, chatReportActions)).toEqual(previewAction);
        });

        it('returns null when no action matches the given iouReportID', () => {
            const previewAction = createReportPreviewAction('someOtherIOUReport');
            const chatReportActions: ReportActions = {[previewAction.reportActionID]: previewAction};

            expect(getReportPreviewReportAction(chatReportID, iouReportID, chatReportActions)).toBeNull();
        });

        it('returns null when the matching action is not a REPORT_PREVIEW action', () => {
            const nonPreviewAction = createMock<ReportAction>({
                reportActionID: 'commentAction1',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2024-01-01 12:00:00',
                originalMessage: {linkedReportID: iouReportID},
                message: [{type: 'COMMENT', text: ''}],
            });
            const chatReportActions: ReportActions = {[nonPreviewAction.reportActionID]: nonPreviewAction};

            expect(getReportPreviewReportAction(chatReportID, iouReportID, chatReportActions)).toBeNull();
        });

        it('returns null when chatReportActions is an empty object', () => {
            expect(getReportPreviewReportAction(chatReportID, iouReportID, {})).toBeNull();
        });

        it('returns null when chatReportActions is undefined and nothing is cached in Onyx for the chat report', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, null);
            await waitForBatchedUpdates();

            expect(getReportPreviewReportAction(chatReportID, iouReportID)).toBeNull();
        });

        it('falls back to the cached Onyx report actions when chatReportActions is not provided', async () => {
            const previewAction = createReportPreviewAction(iouReportID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {[previewAction.reportActionID]: previewAction});
            await waitForBatchedUpdates();

            expect(getReportPreviewReportAction(chatReportID, iouReportID)).toEqual(previewAction);
        });
    });
});
