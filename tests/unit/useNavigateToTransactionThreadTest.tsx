import {renderHook} from '@testing-library/react-native';

import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: jest.fn(), unmarkReportRHPWidth: jest.fn()}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: 'a@b.com', accountID: 1}),
}));

const IOU_REPORT_ID = 'iou1';
const REPORT_ROUTE = ROUTES.REPORT_WITH_ID.getRoute(IOU_REPORT_ID);

function buildIOUAction(index: number, transactionID: string, childReportID: string) {
    return {
        ...createRandomReportAction(index),
        reportActionID: `action${index}`,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childReportID,
        originalMessage: {IOUTransactionID: transactionID, IOUReportID: IOU_REPORT_ID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
    };
}

function buildReportActions(): ReportAction[] {
    return [buildIOUAction(1, 't1', 'threadA'), buildIOUAction(2, 't2', 'threadB')];
}

describe('useNavigateToTransactionThread', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('opens only one expense when two rows are pressed inside the deferred window', async () => {
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        // Both presses are made while the report is still the active route, and the first navigation has not
        // been dispatched yet — the shape that used to push two expense screens.
        const getActiveRouteSpy = jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(REPORT_ROUTE);

        const {result} = renderHook(() => useNavigateToTransactionThread());
        const navigateToTransaction = result.current;

        const params = {
            reportActions: buildReportActions(),
            report: {reportID: IOU_REPORT_ID} as Report,
            transaction: undefined,
            siblingTransactionIDs: ['t1', 't2'],
            backTo: undefined,
        };
        navigateToTransaction({...params, transactionID: 't1'});
        navigateToTransaction({...params, transactionID: 't2'});

        // The first continuation navigates; by the time the second runs the route has moved off the report.
        getActiveRouteSpy.mockImplementation(() => (navigateSpy.mock.calls.length === 0 ? REPORT_ROUTE : ROUTES.SEARCH_REPORT.getRoute({reportID: 'threadA'})));
        await waitForBatchedUpdates();

        expect(navigateSpy).toHaveBeenCalledTimes(1);
    });
});
