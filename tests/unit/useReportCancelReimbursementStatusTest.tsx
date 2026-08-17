import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useReportCancelReimbursementStatus from '@hooks/useReportCancelReimbursementStatus';

import {getReportCancelReimbursementStatus} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@userActions/IOU/PayMoneyRequest', () => ({
    getReportCancelReimbursementStatus: jest.fn(),
}));

const mockGetReportCancelReimbursementStatus = jest.mocked(getReportCancelReimbursementStatus);

const REPORT_ID = '1';

const reimbursedReport = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.BILLING,
    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
} as Report;

const approvedReport = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
} as Report;

const wrapper = ({children}: {children: React.ReactNode}) => {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
};

describe('useReportCancelReimbursementStatus', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('fetches and returns the status for a reimbursed expense report', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_CANCEL_REIMBURSEMENT_STATUS}${REPORT_ID}`, {canCancel: false, isWaitingForCreditToPost: false});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useReportCancelReimbursementStatus(reimbursedReport), {wrapper});
        await waitForBatchedUpdates();

        expect(mockGetReportCancelReimbursementStatus).toHaveBeenCalledWith(REPORT_ID);
        expect(result.current).toEqual({canCancel: false, isWaitingForCreditToPost: false});
    });

    it('does not fetch for a report that is not reimbursed', async () => {
        renderHook(() => useReportCancelReimbursementStatus(approvedReport), {wrapper});
        await waitForBatchedUpdates();

        expect(mockGetReportCancelReimbursementStatus).not.toHaveBeenCalled();
    });
});
