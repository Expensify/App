import Onyx from 'react-native-onyx';
import {connectBankAccountWithPlaid} from '@libs/actions/BankAccounts';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';
import getOnyxValue from '../utils/getOnyxValue';
import type {MockFetch} from '../utils/TestHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'policyID123';

function getPlaidBankAccount(bankName: string): PlaidBankAccount {
    return {
        accountNumber: '111122223333',
        routingNumber: '123456789',
        bankName,
        plaidAccountID: 'plaidAccountID123',
        plaidAccessToken: 'plaidAccessToken123',
        mask: '3333',
        isSavings: false,
    };
}

describe('actions/BankAccounts', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        mockFetch?.resume?.();
    });

    describe('connectBankAccountWithPlaid', () => {
        test('short-circuits new Chase accounts to manual flow and clears account/routing draft fields', async () => {
            // Given a new reimbursement account in Plaid setup with existing draft values
            await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                achData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
                    subStep: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                },
            });
            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {
                accountNumber: '111122223333',
                routingNumber: '123456789',
                plaidAccountID: 'plaidAccountID123',
                plaidAccessToken: 'plaidAccessToken123',
                mask: '3333',
            } as Partial<ReimbursementAccountForm>);

            // When we connect with Plaid for Chase on a new account
            connectBankAccountWithPlaid(CONST.DEFAULT_NUMBER_ID, getPlaidBankAccount(CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.CHASE]), POLICY_ID);
            await waitForBatchedUpdates();

            // Then we should not call the backend, and should move user to manual with cleared account/routing draft fields
            const reimbursementAccount = await getOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
            const reimbursementAccountDraft = await getOnyxValue(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, 0);
            expect(reimbursementAccount?.achData?.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
            expect(reimbursementAccount?.achData?.subStep).toBe(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
            expect(reimbursementAccount?.errors ?? null).toBeNull();
            expect(reimbursementAccountDraft?.accountNumber).toBe('');
            expect(reimbursementAccountDraft?.routingNumber).toBe('');
            expect(reimbursementAccountDraft?.plaidAccountID).toBe('plaidAccountID123');
            expect(reimbursementAccountDraft?.plaidAccessToken).toBe('plaidAccessToken123');
            expect(reimbursementAccountDraft?.mask).toBe('3333');
        });

        test('does not short-circuit Chase flow when bankAccountID is non-zero', () => {
            // Given an existing Chase bank account
            const bankAccountID = 123;
            const selectedPlaidBankAccount = getPlaidBankAccount(CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.CHASE]);

            // When we connect with Plaid
            connectBankAccountWithPlaid(bankAccountID, selectedPlaidBankAccount, POLICY_ID);
            return waitForBatchedUpdates().then(() => {
                // Then we should call the existing API command
                TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, 1);
                const call = TestHelper.getFetchMockCalls(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID).at(0);
                const body = (call?.at(1) as RequestInit)?.body;
                const params = body instanceof FormData ? Object.fromEntries(body) : {};

                expect(params).toEqual(
                    expect.objectContaining({
                        bankAccountID: `${bankAccountID}`,
                        routingNumber: selectedPlaidBankAccount.routingNumber,
                        accountNumber: selectedPlaidBankAccount.accountNumber,
                        bank: selectedPlaidBankAccount.bankName,
                        plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
                        plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
                        plaidMask: selectedPlaidBankAccount.mask,
                        isSavings: `${selectedPlaidBankAccount.isSavings}`,
                        policyID: POLICY_ID,
                    }),
                );
            });
        });
    });
});
