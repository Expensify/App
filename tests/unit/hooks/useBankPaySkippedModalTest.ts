import {act, renderHook} from '@testing-library/react-native';

import useBankPaySkippedModal from '@hooks/useBankPaySkippedModal';

import CONST from '@src/CONST';
import type {BankAccount, BankAccountList, Policy, Report} from '@src/types/onyx';

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

const PICKED_BANK_ACCOUNT_ID = 111;
const WORKSPACE_BANK_ACCOUNT_ID = 222;
const policy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
    achAccount: {
        bankAccountID: WORKSPACE_BANK_ACCOUNT_ID,
        accountNumber: 'XXXXXX5678',
        routingNumber: '123456789',
        addressName: 'Workspace account',
        bankName: 'Workspace bank',
        reimburser: 'payer@test.com',
    },
};

function createBankAccount(accountNumber: string): BankAccount {
    return {bankCurrency: CONST.CURRENCY.USD, bankCountry: 'US', accountData: {accountNumber}};
}

const bankAccountList: BankAccountList = {
    [PICKED_BANK_ACCOUNT_ID]: createBankAccount('XXXXXX1234'),
    [WORKSPACE_BANK_ACCOUNT_ID]: createBankAccount('XXXXXX5678'),
};

const nonReimbursableReport: Report = {
    ...createRandomReport(9201, undefined),
    type: CONST.REPORT.TYPE.EXPENSE,
    total: -5000,
    nonReimbursableTotal: -5000,
    reimbursableTotal: undefined,
    pendingFields: undefined,
};

describe('useBankPaySkippedModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('lists the skipped reports under the bank account that was picked', () => {
        // Given a bulk payment that paid some reports and skipped two with nothing owed
        const {result} = renderHook(() => useBankPaySkippedModal({bankAccountList}));

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
        // And the names scroll under a fixed description, so a long list can't push Got it off the screen
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'iou.payWithBankAccountTitle(1234)',
                subtitle: 'iou.bankPaySkippedReportsDescription',
                prompt: [`${CONST.DOT_SEPARATOR} Card lunch`, `${CONST.DOT_SEPARATOR} Credit refund`].join('\n'),
                shouldShowCancelButton: false,
                shouldEnablePromptScroll: true,
            }),
        );
    });

    it('explains that none of the selected reports could be paid', () => {
        // Given a bulk payment where every selected report had nothing owed, and no bank account was picked
        const {result} = renderHook(() => useBankPaySkippedModal({bankAccountList}));

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

    it('explains why a single report could not be paid', () => {
        // Given a single report with nothing owed, paid from the report itself
        const {result} = renderHook(() => useBankPaySkippedModal({bankAccountList, report: nonReimbursableReport, policy, onlyShowPayElsewhere: true}));

        // When the modal is shown for it
        act(() => {
            result.current.showBankPaySkippedModal({bankAccountID: PICKED_BANK_ACCOUNT_ID});
        });

        // Then it uses the single report copy, since the report it was given is the one that wasn't paid
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: 'iou.bankPayReportSkippedDescription'}));
    });

    it('falls back to a generic title when the bank account is unknown', () => {
        // Given a bank account that isn't in the user's bank account list, and no workspace account
        const {result} = renderHook(() => useBankPaySkippedModal({bankAccountList, report: nonReimbursableReport}));

        // When the modal is shown
        act(() => {
            result.current.showBankPaySkippedModal({bankAccountID: 999});
        });

        // Then the title doesn't show a made-up account number
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'iou.payWithBankAccountTitle'}));
    });

    it('keeps the bank account on offer for a report with nothing owed that can only be marked as paid', () => {
        // Given a non-reimbursable report that can only be marked as paid
        // When a Pay button asks whether its bank account option should explain why it can't pay
        const {result} = renderHook(() => useBankPaySkippedModal({bankAccountList, report: nonReimbursableReport, policy, onlyShowPayElsewhere: true}));

        // Then it should, so the option stays instead of being hidden
        expect(result.current.isBankPayBlocked).toBe(true);
    });

    it('leaves a report that can be paid through the bank account alone', () => {
        // Given the same report on a Pay button that already offers the bank account, so it isn't limited to Mark as paid
        // When the button asks whether the bank account option should explain why it can't pay
        const {result} = renderHook(() => useBankPaySkippedModal({bankAccountList, report: nonReimbursableReport, policy}));

        // Then it shouldn't, since the bank account option already works as before
        expect(result.current.isBankPayBlocked).toBe(false);
    });
});
