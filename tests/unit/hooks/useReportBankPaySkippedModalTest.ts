import {act, renderHook} from '@testing-library/react-native';

import useReportBankPaySkippedModal from '@hooks/useReportBankPaySkippedModal';

import CONST from '@src/CONST';
import type {BankAccountList, Policy, Report} from '@src/types/onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string, lastFour?: string) => (lastFour ? `${key}(${lastFour})` : key),
    }),
}));

const BANK_ACCOUNT_ID = 111;
const bankAccountList: BankAccountList = {
    [BANK_ACCOUNT_ID]: {bankCurrency: CONST.CURRENCY.USD, bankCountry: 'US', accountData: {accountNumber: 'XXXXXX1234'}},
};

const policy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
};

const nonReimbursableReport: Report = {
    ...createRandomReport(9201, undefined),
    type: CONST.REPORT.TYPE.EXPENSE,
    total: -5000,
    nonReimbursableTotal: -5000,
    reimbursableTotal: undefined,
    pendingFields: undefined,
};

describe('useReportBankPaySkippedModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps the bank account on offer for a report with nothing owed that can only be marked as paid', () => {
        // Given a non-reimbursable report that can only be marked as paid
        // When its Pay button asks whether the bank account option should explain why it can't pay
        const {result} = renderHook(() => useReportBankPaySkippedModal({bankAccountList, report: nonReimbursableReport, policy, onlyShowPayElsewhere: true}));

        // Then it should, so the option stays instead of being hidden
        expect(result.current.isBankPayBlocked).toBe(true);
    });

    it('leaves a report that already offers the bank account alone', () => {
        // Given the same report on a Pay button that isn't limited to Mark as paid
        // When the button asks whether the bank account option should explain why it can't pay
        const {result} = renderHook(() => useReportBankPaySkippedModal({bankAccountList, report: nonReimbursableReport, policy}));

        // Then it shouldn't, since the bank account option already works as before
        expect(result.current.isBankPayBlocked).toBe(false);
    });

    it('explains why the report itself could not be paid', () => {
        // Given a report with nothing owed whose bank account option is kept
        const {result} = renderHook(() => useReportBankPaySkippedModal({bankAccountList, report: nonReimbursableReport, policy, onlyShowPayElsewhere: true}));

        // When the user picks the bank account
        act(() => {
            result.current.showReportBankPaySkippedModal(BANK_ACCOUNT_ID);
        });

        // Then the alert names that account and uses the single report copy, since only this report was being paid
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'iou.payWithBankAccountTitle(1234)',
                prompt: 'iou.bankPayReportSkippedDescription',
            }),
        );
    });
});
