import {act, renderHook} from '@testing-library/react-native';

import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';

import useMoneyReportHeaderEducationalModals from '@hooks/useMoneyReportHeaderEducationalModals';

import {changeMoneyRequestHoldStatus} from '@libs/actions/IOU/Hold';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TEST_REPORT_ID = '1';

jest.mock('@components/MoneyReportTransactionThreadContext', () => ({
    __esModule: true,
    useMoneyReportTransactionThread: jest.fn(() => ({iouTransactionID: undefined, requestParentReportAction: undefined})),
}));

jest.mock('@hooks/useHoldSubmitterEducationalModal', () => ({
    __esModule: true,
    default: jest.fn(() => ({showHoldSubmitterEducationalModal: () => Promise.resolve()})),
}));

jest.mock('@hooks/useHoldRejectEducationalModal', () => ({
    __esModule: true,
    default: jest.fn(() => ({showHoldOrRejectEducationalModal: () => Promise.resolve()})),
}));

jest.mock('@libs/actions/IOU/Hold', () => ({
    __esModule: true,
    changeMoneyRequestHoldStatus: jest.fn(),
}));

/** Renders the hook for a held expense whose parent IOU action exists, with a track-intent user stored in Onyx */
async function renderForTrackIntentUser() {
    jest.mocked(useMoneyReportTransactionThread).mockReturnValue({
        iouTransactionID: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal stub so the hold branch can run
        requestParentReportAction: {reportActionID: 'parent-action-1', actionName: CONST.REPORT.ACTIONS.TYPE.IOU} as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>,
        transactionThreadReportID: undefined,
        transactionThreadReport: undefined,
        reportActions: [],
    });
    await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
    await waitForBatchedUpdates();
    return renderHook(() => useMoneyReportHeaderEducationalModals(TEST_REPORT_ID));
}

describe('useMoneyReportHeaderEducationalModals', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    it('holds the expense with the onboarding intent once the submitter dismisses the hold explanation', async () => {
        // Given a track-intent submitter about to see the hold explanation for the first time
        const {result} = await renderForTrackIntentUser();

        // When they dismiss the explanation
        await act(async () => {
            result.current.openHoldEducational();
            await waitForBatchedUpdates();
        });

        // Then the hold is applied, and the stored onboarding intent still reaches the hold action
        expect(changeMoneyRequestHoldStatus).toHaveBeenCalledWith(expect.objectContaining({isTrackIntentUser: true}));
    });

    it('holds the expense with the onboarding intent once the approver dismisses the hold and reject explanation', async () => {
        // Given a track-intent approver about to see the hold and reject explanation for the first time
        const {result} = await renderForTrackIntentUser();

        // When they dismiss the explanation that opened from Hold
        await act(async () => {
            result.current.openRejectModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
            await waitForBatchedUpdates();
        });

        // Then the hold is applied, and the stored onboarding intent still reaches the hold action
        expect(changeMoneyRequestHoldStatus).toHaveBeenCalledWith(expect.objectContaining({isTrackIntentUser: true}));
    });
});
