import {getReportCancelReimbursementStatus} from '@libs/actions/IOU/PayMoneyRequest';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCancelReimbursementStatus} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);

const REPORT_ID = '1';

function getStoredStatus(): Promise<ReportCancelReimbursementStatus | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_CANCEL_REIMBURSEMENT_STATUS}${REPORT_ID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('getReportCancelReimbursementStatus', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('stores the backend cancellable status in Onyx', async () => {
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200, reimbursementCancellableStatus: {canCancel: true, isWaitingForCreditToPost: false}});

        getReportCancelReimbursementStatus(REPORT_ID);
        await waitForBatchedUpdates();

        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.GET_REPORT_CANCEL_REIMBURSEMENT_STATUS, {reportID: REPORT_ID});
        expect(await getStoredStatus()).toEqual({canCancel: true, isWaitingForCreditToPost: false});
    });

    it('stores nothing when the response has no status', async () => {
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        getReportCancelReimbursementStatus(REPORT_ID);
        await waitForBatchedUpdates();

        expect(await getStoredStatus()).toBeUndefined();
    });

    it('does not call the API without a reportID', () => {
        getReportCancelReimbursementStatus(undefined);

        expect(mockMakeRequestWithSideEffects).not.toHaveBeenCalled();
    });
});
