import {
    getDigitsBankAccount,
    getDigitsBankAccounts,
    getDigitsExpensifyCardSettlementMissingAccountLabel,
    getDigitsTravelBillingPayableAccounts,
    getDigitsTravelBillingSettlementMissingAccountLabel,
} from '@pages/workspace/accounting/digits/advanced/DigitsAdvancedAccountUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount, DigitsConnectionsConfig} from '@src/types/onyx/Policy';

import createMock from '../../../../../utils/createMock';

const INACTIVE_BANK_ACCOUNT: DigitsAccount = {id: 'bank-old', name: 'Old Checking', type: 'Assets', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: false};
const FIRST_BANK_ACCOUNT: DigitsAccount = {id: 'bank-1', name: 'Operating Checking', type: 'Assets', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: true};
const SECOND_BANK_ACCOUNT: DigitsAccount = {id: 'bank-2', name: 'Payroll Checking', type: 'Assets', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: true};
const CARD_ACCOUNT: DigitsAccount = {id: 'card-1', name: 'Company Visa', type: 'Liabilities', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS, isActive: false};
const LIABILITY_ACCOUNT: DigitsAccount = {
    id: 'liability-1',
    name: 'Travel Payable',
    type: 'Liabilities',
    subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.OTHER_CURRENT_LIABILITIES,
    isActive: false,
};
const EXPENSE_ACCOUNT: DigitsAccount = {id: 'expense-1', name: 'Travel', type: 'Expenses', subtype: 'TravelAndEntertainment', isActive: true};
const ACCOUNTS = [INACTIVE_BANK_ACCOUNT, EXPENSE_ACCOUNT, FIRST_BANK_ACCOUNT, CARD_ACCOUNT, SECOND_BANK_ACCOUNT, LIABILITY_ACCOUNT];

function buildPolicy(accounts: DigitsAccount[], config: Partial<DigitsConnectionsConfig> = {}) {
    return createMock<Policy>({id: '1', connections: {digits: {config, data: {accounts}}}});
}

describe('DigitsAdvancedAccountUtils', () => {
    describe('pickers', () => {
        it('lists every bank account for the bill payment and settlement account pickers, inactive ones included', () => {
            // Given a Digits company with active and inactive bank accounts next to accounts of other subtypes
            // When a bank account picker reads its accounts
            const bankAccounts = getDigitsBankAccounts(buildPolicy(ACCOUNTS));

            // Then only bank accounts are listed, including the one Digits marks inactive because it has no ledger activity yet
            expect(bankAccounts).toEqual([INACTIVE_BANK_ACCOUNT, FIRST_BANK_ACCOUNT, SECOND_BANK_ACCOUNT]);
        });

        it('lists credit card and current liability accounts for the travel payable account picker', () => {
            // Given a Digits company with accounts of several subtypes
            // When the travel payable account picker reads its accounts
            const payableAccounts = getDigitsTravelBillingPayableAccounts(buildPolicy(ACCOUNTS));

            // Then it lists the same subtypes as Campfire's picker, inactive ones included
            expect(payableAccounts).toEqual([CARD_ACCOUNT, LIABILITY_ACCOUNT]);
        });
    });

    describe('getDigitsBankAccount', () => {
        it('uses the account the admin saved', () => {
            // Given an admin who saved the second bank account
            // When the Advanced page reads the bank account
            const account = getDigitsBankAccount(buildPolicy(ACCOUNTS), SECOND_BANK_ACCOUNT.id);

            // Then the saved account wins over the default
            expect(account).toBe(SECOND_BANK_ACCOUNT);
        });

        it('falls back to the first active bank account while none is saved', () => {
            // Given no saved bank account
            // When the Advanced page reads the bank account
            const account = getDigitsBankAccount(buildPolicy(ACCOUNTS), undefined);

            // Then it's the first active bank account, the same one the sync uses while the setting is unset
            expect(account).toBe(FIRST_BANK_ACCOUNT);
        });

        it('falls back to the first bank account when none is active', () => {
            // Given a new Digits company, where every account is inactive until it has ledger activity
            // When the Advanced page reads the bank account while none is saved
            const account = getDigitsBankAccount(buildPolicy([EXPENSE_ACCOUNT, INACTIVE_BANK_ACCOUNT, {...SECOND_BANK_ACCOUNT, isActive: false}]), undefined);

            // Then it's the first bank account, so a new company still shows the account the sync uses
            expect(account).toBe(INACTIVE_BANK_ACCOUNT);
        });

        it('finds nothing when the saved account is no longer imported', () => {
            // Given a saved account that the last sync didn't bring back
            // When the Advanced page reads the bank account
            const account = getDigitsBankAccount(buildPolicy(ACCOUNTS), 'deleted-account');

            // Then no account shows, rather than a default the sync won't use
            expect(account).toBeUndefined();
        });
    });

    describe('getDigitsExpensifyCardSettlementMissingAccountLabel', () => {
        it('names nothing when the sync has both accounts', () => {
            // Given a Digits company with a credit card account and a bank account, both used as defaults
            // When the Advanced page checks the Expensify Card settlement sync
            const missingAccountLabel = getDigitsExpensifyCardSettlementMissingAccountLabel(buildPolicy(ACCOUNTS));

            // Then nothing is missing, so the toggle shows no message
            expect(missingAccountLabel).toBeUndefined();
        });

        it('names the company card account when Digits has no credit card account', () => {
            // Given a Digits company with bank accounts but no credit card account for the Expensify Card side
            // When the Advanced page checks the Expensify Card settlement sync
            const missingAccountLabel = getDigitsExpensifyCardSettlementMissingAccountLabel(buildPolicy([FIRST_BANK_ACCOUNT]));

            // Then the company card account is named, because the Expensify Card account falls back to it
            expect(missingAccountLabel).toBe('workspace.digits.companyCardAccount.label');
        });

        it('uses the Expensify Card program account instead of the company card account when one is saved', () => {
            // Given an Expensify Card program account saved on a company with no credit card account
            const policy = buildPolicy([FIRST_BANK_ACCOUNT, LIABILITY_ACCOUNT], {
                export: createMock<NonNullable<DigitsConnectionsConfig['export']>>({cardProgramAccounts: {[CONST.EXPENSIFY_CARD.BANK]: LIABILITY_ACCOUNT.id}}),
            });

            // When the Advanced page checks the Expensify Card settlement sync
            const missingAccountLabel = getDigitsExpensifyCardSettlementMissingAccountLabel(policy);

            // Then nothing is missing, because the settlement uses the program account
            expect(missingAccountLabel).toBeUndefined();
        });

        it('names the settlement account when Digits has no bank account', () => {
            // Given a Digits company with a credit card account but no bank account
            // When the Advanced page checks the Expensify Card settlement sync
            const missingAccountLabel = getDigitsExpensifyCardSettlementMissingAccountLabel(buildPolicy([CARD_ACCOUNT]));

            // Then the settlement account is named, since there is no bank account to default to
            expect(missingAccountLabel).toBe('workspace.digits.settlementAccount.label');
        });
    });

    describe('getDigitsTravelBillingSettlementMissingAccountLabel', () => {
        it('names the payable account while none is picked', () => {
            // Given a Digits company with a bank account and no saved travel payable account
            // When the Advanced page checks the Consolidated Travel Billing settlement sync
            const missingAccountLabel = getDigitsTravelBillingSettlementMissingAccountLabel(buildPolicy(ACCOUNTS));

            // Then the payable account is named, because it has no default and the sync waits until an admin picks one
            expect(missingAccountLabel).toBe('workspace.digits.travelBillingPayableAccount.label');
        });

        it('names nothing once a payable account is picked', () => {
            // Given a saved travel payable account and a bank account for the settlement default
            const policy = buildPolicy(ACCOUNTS, {export: createMock<NonNullable<DigitsConnectionsConfig['export']>>({travelInvoicingPayableAccountID: LIABILITY_ACCOUNT.id})});

            // When the Advanced page checks the Consolidated Travel Billing settlement sync
            const missingAccountLabel = getDigitsTravelBillingSettlementMissingAccountLabel(policy);

            // Then nothing is missing, so the toggle shows no message
            expect(missingAccountLabel).toBeUndefined();
        });

        it('names the settlement account before the payable account when Digits has no bank account', () => {
            // Given a saved travel payable account on a Digits company with no bank account
            const policy = buildPolicy([LIABILITY_ACCOUNT], {export: createMock<NonNullable<DigitsConnectionsConfig['export']>>({travelInvoicingPayableAccountID: LIABILITY_ACCOUNT.id})});

            // When the Advanced page checks the Consolidated Travel Billing settlement sync
            const missingAccountLabel = getDigitsTravelBillingSettlementMissingAccountLabel(policy);

            // Then the settlement account is named, since there is no bank account to default to
            expect(missingAccountLabel).toBe('workspace.digits.travelBillingSettlementAccount.label');
        });
    });
});
