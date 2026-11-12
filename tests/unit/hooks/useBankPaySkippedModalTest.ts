import {act, renderHook} from '@testing-library/react-native';

import useBankPaySkippedModal from '@hooks/useBankPaySkippedModal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string, ...params: unknown[]) => {
            const definedParams = params.filter((param) => param !== undefined);
            return definedParams.length ? `${key}(${definedParams.join(',')})` : key;
        },
    }),
}));

const PICKED_BANK_ACCOUNT_ID = 111;
const WORKSPACE_BANK_ACCOUNT_ID = 222;
const policy = {id: 'policy1', achAccount: {bankAccountID: WORKSPACE_BANK_ACCOUNT_ID}} as Policy;

describe('useBankPaySkippedModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [PICKED_BANK_ACCOUNT_ID]: {accountData: {accountNumber: 'XXXXXX1234'}},
            [WORKSPACE_BANK_ACCOUNT_ID]: {accountData: {accountNumber: 'XXXXXX5678'}},
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('lists the skipped reports under the bank account that was picked', async () => {
        // Given a bulk payment that paid some reports and skipped two with nothing owed
        const {result} = renderHook(() => useBankPaySkippedModal());
        await waitForBatchedUpdatesWithAct();

        // When the modal is shown for the bank account the user picked
        act(() => {
            result.current.showBankPaySkippedModal({
                bankAccountID: PICKED_BANK_ACCOUNT_ID,
                policy,
                skippedReports: [
                    {reportID: '1', reportName: 'Card lunch'},
                    {reportID: '2', reportName: 'Credit refund'},
                ],
            });
        });

        // Then the title names that account and the prompt lists each skipped report by name, so the user knows which to mark as paid
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'iou.payWithBankAccountTitle(1234)',
                prompt: ['iou.bankPaySkippedReportsDescription', '', `${CONST.DOT_SEPARATOR} Card lunch`, `${CONST.DOT_SEPARATOR} Credit refund`].join('\n'),
                shouldShowCancelButton: false,
            }),
        );
    });

    it('explains that none of the selected reports could be paid', async () => {
        // Given a bulk payment where every selected report had nothing owed, and no bank account was picked
        const {result} = renderHook(() => useBankPaySkippedModal());
        await waitForBatchedUpdatesWithAct();

        // When the modal is shown
        act(() => {
            result.current.showBankPaySkippedModal({policy});
        });

        // Then it names the workspace bank account and explains why nothing was paid, without a list
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'iou.payWithBankAccountTitle(5678)',
                prompt: 'iou.bankPayAllReportsSkippedDescription',
            }),
        );
    });

    it('explains why a single report could not be paid', async () => {
        // Given a single report with nothing owed, paid from the report itself
        const {result} = renderHook(() => useBankPaySkippedModal());
        await waitForBatchedUpdatesWithAct();

        // When the modal is shown for it
        act(() => {
            result.current.showBankPaySkippedModal({bankAccountID: PICKED_BANK_ACCOUNT_ID, policy, isSingleReport: true});
        });

        // Then it uses the single report copy
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: 'iou.bankPayReportSkippedDescription'}));
    });

    it('falls back to a generic title when the bank account is unknown', async () => {
        // Given a bank account that isn't in the user's bank account list, and no workspace account
        const {result} = renderHook(() => useBankPaySkippedModal());
        await waitForBatchedUpdatesWithAct();

        // When the modal is shown
        act(() => {
            result.current.showBankPaySkippedModal({bankAccountID: 999, isSingleReport: true});
        });

        // Then the title doesn't show a made-up account number
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'iou.payWithBankAccountTitle'}));
    });
});
