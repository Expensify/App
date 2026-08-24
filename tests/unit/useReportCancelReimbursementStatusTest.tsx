import {act, renderHook} from '@testing-library/react-native';

import useReportCancelReimbursementStatus from '@hooks/useReportCancelReimbursementStatus';

import {getReportCancelReimbursementStatus} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportCancelReimbursementStatus} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockIsOffline = false;
let mockHasCutoffPassed = false;

jest.mock('@userActions/IOU/PayMoneyRequest', () => ({
    getReportCancelReimbursementStatus: jest.fn(() => Promise.resolve({canCancel: true, isWaitingForCreditToPost: false})),
}));

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    hasDailyNachaCutoffPassed: () => mockHasCutoffPassed,
}));

const mockGetReportCancelReimbursementStatus = jest.mocked(getReportCancelReimbursementStatus);

const REPORT_ID = '1';
const OTHER_REPORT_ID = '2';

const submittedReimbursement = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.BILLING,
    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
} as Report;

const approvedReport = {
    ...submittedReimbursement,
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
} as Report;

describe('useReportCancelReimbursementStatus', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockHasCutoffPassed = false;
        mockGetReportCancelReimbursementStatus.mockResolvedValue({canCancel: true, isWaitingForCreditToPost: false});
    });

    it('returns the status the backend reports for a submitted reimbursement', async () => {
        const {result} = renderHook(() => useReportCancelReimbursementStatus(submittedReimbursement));
        await waitForBatchedUpdates();

        expect(mockGetReportCancelReimbursementStatus).toHaveBeenCalledWith(REPORT_ID);
        expect(result.current).toEqual({canCancel: true, isWaitingForCreditToPost: false});
    });

    it('does not ask the backend for a report that is not a submitted reimbursement', async () => {
        const {result} = renderHook(() => useReportCancelReimbursementStatus(approvedReport));
        await waitForBatchedUpdates();

        expect(mockGetReportCancelReimbursementStatus).not.toHaveBeenCalled();
        expect(result.current).toBeUndefined();
    });

    it('does not ask the backend while offline', async () => {
        mockIsOffline = true;

        const {result} = renderHook(() => useReportCancelReimbursementStatus(submittedReimbursement));
        await waitForBatchedUpdates();

        expect(mockGetReportCancelReimbursementStatus).not.toHaveBeenCalled();
        expect(result.current).toBeUndefined();
    });

    it('drops the status when the report leaves the submitted state', async () => {
        const {result, rerender} = renderHook((currentReport: Report) => useReportCancelReimbursementStatus(currentReport), {initialProps: submittedReimbursement});
        await waitForBatchedUpdates();
        expect(result.current).toEqual({canCancel: true, isWaitingForCreditToPost: false});

        rerender(approvedReport);
        await waitForBatchedUpdates();

        expect(result.current).toBeUndefined();
    });

    it('drops the status when the connection is lost', async () => {
        const {result, rerender} = renderHook(() => useReportCancelReimbursementStatus(submittedReimbursement));
        await waitForBatchedUpdates();
        expect(result.current).toEqual({canCancel: true, isWaitingForCreditToPost: false});

        mockIsOffline = true;
        rerender(undefined);
        await waitForBatchedUpdates();

        expect(result.current).toBeUndefined();
    });

    it('does not ask the backend once the NACHA cutoff has passed', async () => {
        mockHasCutoffPassed = true;

        const {result} = renderHook(() => useReportCancelReimbursementStatus(submittedReimbursement));
        await waitForBatchedUpdates();

        expect(mockGetReportCancelReimbursementStatus).not.toHaveBeenCalled();
        expect(result.current).toBeUndefined();
    });

    it('does not show the previous answer again while the reconnected one is still loading', async () => {
        const {result, rerender} = renderHook(() => useReportCancelReimbursementStatus(submittedReimbursement));
        await waitForBatchedUpdates();
        expect(result.current).toEqual({canCancel: true, isWaitingForCreditToPost: false});

        mockIsOffline = true;
        rerender(undefined);
        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();

        mockGetReportCancelReimbursementStatus.mockImplementationOnce(() => new Promise(() => {}));
        mockIsOffline = false;
        rerender(undefined);
        await waitForBatchedUpdates();

        expect(result.current).toBeUndefined();
    });

    it('ignores a response that arrives after the hook moved to another report', async () => {
        const otherReimbursement = {...submittedReimbursement, reportID: OTHER_REPORT_ID} as Report;
        let resolveFirstRequest: ((status: ReportCancelReimbursementStatus) => void) | undefined;
        mockGetReportCancelReimbursementStatus.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveFirstRequest = resolve;
                }),
        );
        mockGetReportCancelReimbursementStatus.mockResolvedValueOnce({canCancel: false, isWaitingForCreditToPost: false});

        const {result, rerender} = renderHook((currentReport: Report) => useReportCancelReimbursementStatus(currentReport), {initialProps: submittedReimbursement});
        rerender(otherReimbursement);
        await waitForBatchedUpdates();
        expect(result.current).toEqual({canCancel: false, isWaitingForCreditToPost: false});

        await act(async () => {
            resolveFirstRequest?.({canCancel: true, isWaitingForCreditToPost: false});
            await waitForBatchedUpdates();
        });

        expect(result.current).toEqual({canCancel: false, isWaitingForCreditToPost: false});
    });

    it('does not show one report status on another while the new one is still loading', async () => {
        const otherReimbursement = {...submittedReimbursement, reportID: OTHER_REPORT_ID} as Report;
        mockGetReportCancelReimbursementStatus.mockResolvedValueOnce({canCancel: true, isWaitingForCreditToPost: false});
        mockGetReportCancelReimbursementStatus.mockImplementationOnce(() => new Promise(() => {}));

        const {result, rerender} = renderHook((currentReport: Report) => useReportCancelReimbursementStatus(currentReport), {initialProps: submittedReimbursement});
        await waitForBatchedUpdates();
        expect(result.current).toEqual({canCancel: true, isWaitingForCreditToPost: false});

        rerender(otherReimbursement);
        await waitForBatchedUpdates();

        expect(result.current).toBeUndefined();
    });
});
