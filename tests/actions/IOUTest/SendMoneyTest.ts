import {sendMoneyElsewhere} from '@libs/actions/IOU/SendMoney';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../../utils/TestHelper';

import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
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
    deferOrExecuteWrite: (apiWrite: () => void) => apiWrite(),
    reserveDeferredWriteChannel: jest.fn(),
    resetForTesting: jest.fn(),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();

describe('actions/IOU/SendMoney', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL},
                    [CARLOS_ACCOUNT_ID]: {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL},
                },
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL},
            [CARLOS_ACCOUNT_ID]: {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL},
        });
    });

    describe('sendMoneyElsewhere', () => {
        describe('delegateAccountID forwarding', () => {
            it('sets delegateAccountID on the pay IOU action when delegateAccountID is provided', async () => {
                const DELEGATE_ACCOUNT_ID = 999;
                mockFetch?.pause?.();

                sendMoneyElsewhere({
                    report: {reportID: ''},
                    quickAction: undefined,
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                    comment: '',
                    currentUserAccountID: RORY_ACCOUNT_ID,
                    recipient: {accountID: CARLOS_ACCOUNT_ID, login: CARLOS_EMAIL},
                    delegateAccountID: DELEGATE_ACCOUNT_ID,
                });

                await waitForBatchedUpdates();

                const allReports = (await getOnyxValue(ONYXKEYS.COLLECTION.REPORT)) as unknown as Record<string, Report>;
                const iouReport = Object.values(allReports).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                expect(iouReport?.reportID).toBeTruthy();

                const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`);
                const payAction = Object.values(reportActions ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                    isMoneyRequestAction(reportAction),
                );
                expect(payAction?.delegateAccountID).toBe(DELEGATE_ACCOUNT_ID);

                mockFetch?.resume?.();
            });
        });
    });
});
