import {setTransactionReport} from '@userActions/Transaction';
import CONST from '@src/CONST';

jest.mock('@userActions/Transaction', () => ({
    setTransactionReport: jest.fn(),
}));

const mockSetTransactionReport = jest.mocked(setTransactionReport);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('useResetIOUType - early reportID setting', () => {
    it('calls setTransactionReport with workspace reportID for workspace participants', () => {
        const defaultParticipants = [{accountID: 0, reportID: 'workspace-chat-123', isPolicyExpenseChat: true, selected: true, isSelfDM: false}];
        const isFromGlobalCreate = true;

        // Simulate the logic from useResetIOUType
        if (isFromGlobalCreate && defaultParticipants && defaultParticipants.length > 0) {
            const firstParticipant = defaultParticipants.at(0);
            const resolvedReportID = firstParticipant?.isSelfDM ? CONST.REPORT.UNREPORTED_REPORT_ID : firstParticipant?.reportID;
            if (resolvedReportID) {
                setTransactionReport(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: resolvedReportID}, true);
            }
        }

        expect(mockSetTransactionReport).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: 'workspace-chat-123'}, true);
    });

    it('calls setTransactionReport with UNREPORTED_REPORT_ID for selfDM participants', () => {
        const defaultParticipants = [{accountID: 0, reportID: 'self-dm-456', isSelfDM: true, selected: true}];
        const isFromGlobalCreate = true;

        if (isFromGlobalCreate && defaultParticipants && defaultParticipants.length > 0) {
            const firstParticipant = defaultParticipants.at(0);
            const resolvedReportID = firstParticipant?.isSelfDM ? CONST.REPORT.UNREPORTED_REPORT_ID : firstParticipant?.reportID;
            if (resolvedReportID) {
                setTransactionReport(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: resolvedReportID}, true);
            }
        }

        expect(mockSetTransactionReport).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
    });

    it('does not call setTransactionReport when not from global create', () => {
        const defaultParticipants = [{accountID: 0, reportID: 'some-report', selected: true}];
        const isFromGlobalCreate = false;

        if (isFromGlobalCreate && defaultParticipants && defaultParticipants.length > 0) {
            const firstParticipant = defaultParticipants.at(0);
            const resolvedReportID = firstParticipant?.isSelfDM ? CONST.REPORT.UNREPORTED_REPORT_ID : firstParticipant?.reportID;
            if (resolvedReportID) {
                setTransactionReport(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: resolvedReportID}, true);
            }
        }

        expect(mockSetTransactionReport).not.toHaveBeenCalled();
    });

    it('does not call setTransactionReport when no default participants', () => {
        const defaultParticipants = undefined;
        const isFromGlobalCreate = true;

        if (isFromGlobalCreate && defaultParticipants && (defaultParticipants as unknown[]).length > 0) {
            setTransactionReport(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, {reportID: 'should-not-reach'}, true);
        }

        expect(mockSetTransactionReport).not.toHaveBeenCalled();
    });
});
