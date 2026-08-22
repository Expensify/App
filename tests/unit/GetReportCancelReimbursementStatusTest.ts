import {getReportCancelReimbursementStatus} from '@libs/actions/IOU/PayMoneyRequest';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);

const REPORT_ID = '1';

describe('getReportCancelReimbursementStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns the cancellable status from the backend', async () => {
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200, reimbursementCancellableStatus: {canCancel: true, isWaitingForCreditToPost: false}});

        const status = await getReportCancelReimbursementStatus(REPORT_ID);

        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.GET_REPORT_CANCEL_REIMBURSEMENT_STATUS, {reportID: REPORT_ID});
        expect(status).toEqual({canCancel: true, isWaitingForCreditToPost: false});
    });

    it('returns undefined when the response carries no status', async () => {
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        await expect(getReportCancelReimbursementStatus(REPORT_ID)).resolves.toBeUndefined();
    });
});
