import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDeleteTransactions from '@hooks/useDeleteTransactions';

import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import {createSelfDM} from '../../utils/collections/reports';
import getOnyxValue from '../../utils/getOnyxValue';
import {getCurrencyDecimalsLocal, getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '1'),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {getRootState: jest.fn(), isReady: jest.fn(() => true)},
}));
jest.mock('@react-navigation/native');
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@src/libs/actions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@src/libs/actions/Report'),
    notifyNewAction: jest.fn(),
    setDeleteTransactionNavigateBackUrl: jest.fn(),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    return waitForBatchedUpdates();
});

beforeEach(async () => {
    global.fetch = getGlobalFetchMock();
    await Onyx.clear();
    await Onyx.multiSet({
        [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
    });
});

describe('useDeleteTransactions', () => {
    it('deletes the self-DM IOU action along with an unreported expense instead of leaving an orphaned preview', async () => {
        // Given an unreported (self-DM) expense whose IOU action lives in the self-DM chat, with no IOU report
        const selfDMReport = createSelfDM(2, RORY_ACCOUNT_ID);
        const transactionID = 'unreported-transaction';
        const transaction: Transaction = {
            transactionID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: 'Test comment'},
            created: DateUtils.getDBTime(),
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        };
        const iouAction: ReportAction = {
            ...buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                amount: 10000,
                currency: 'USD',
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID,
                isPersonalTrackingExpense: true,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            }),
            reportID: selfDMReport.reportID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.merge(ONYXKEYS.SELF_DM_REPORT_ID, selfDMReport.reportID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`, {[iouAction.reportActionID]: iouAction});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: selfDMReport, reportActions: [iouAction]}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When the expense is deleted (e.g. from Search / a bulk selection)
        act(() => {
            result.current.deleteTransactions([transactionID], {}, {});
        });
        await waitForBatchedUpdates();

        // Then the IOU action in the self-DM report is emptied out along with the transaction
        const selfDMActions = (await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`)) as ReportActions | undefined;
        const deletedAction = selfDMActions?.[iouAction.reportActionID];
        expect(Array.isArray(deletedAction?.message) ? deletedAction?.message.at(0)?.html : undefined).toBe('');

        // And the report actions are keyed on the self-DM report, not on a missing IOU report
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}undefined`)).resolves.toBeFalsy();
    });
});
