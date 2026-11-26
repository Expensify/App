import getDigitsCompanyCardAccount from '@pages/workspace/accounting/digits/export/getDigitsCompanyCardAccount';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount} from '@src/types/onyx/Policy';

import createMock from '../../../../../utils/createMock';

const INACTIVE_CARD_ACCOUNT: DigitsAccount = {id: 'card-old', name: 'Old Amex', type: 'Liability', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS, isActive: false};
const BANK_ACCOUNT: DigitsAccount = {id: 'bank-1', name: 'Operating Checking', type: 'Asset', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: true};
const FIRST_CARD_ACCOUNT: DigitsAccount = {id: 'card-1', name: 'Company Visa', type: 'Liability', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS, isActive: true};
const SECOND_CARD_ACCOUNT: DigitsAccount = {id: 'card-2', name: 'Company Amex', type: 'Liability', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS, isActive: true};
const ACCOUNTS = [INACTIVE_CARD_ACCOUNT, BANK_ACCOUNT, FIRST_CARD_ACCOUNT, SECOND_CARD_ACCOUNT];

function buildPolicy(creditCardAccountID?: string, accounts: DigitsAccount[] = ACCOUNTS) {
    return createMock<Policy>({id: '1', connections: {digits: {config: {export: {creditCardAccountID}}, data: {accounts}}}});
}

describe('getDigitsCompanyCardAccount', () => {
    it('falls back to the first active credit card account while none is saved', () => {
        // Given a workspace whose admin hasn't picked a company card account
        // When the export settings read the company card account
        const account = getDigitsCompanyCardAccount(buildPolicy());

        // Then it's the first active credit card account, the same one the exporter uses while the setting is unset
        expect(account).toBe(FIRST_CARD_ACCOUNT);
    });

    it('falls back to the first credit card account when none is active', () => {
        // Given a new Digits company, where every account is inactive until it has ledger activity
        const secondInactiveCardAccount: DigitsAccount = {...SECOND_CARD_ACCOUNT, isActive: false};
        const inactiveBankAccount: DigitsAccount = {...BANK_ACCOUNT, isActive: false};

        // When the export settings read the company card account while none is saved
        const account = getDigitsCompanyCardAccount(buildPolicy(undefined, [inactiveBankAccount, INACTIVE_CARD_ACCOUNT, secondInactiveCardAccount]));

        // Then it's the first credit card account, the same one the exporter uses when no credit card account is active
        expect(account).toBe(INACTIVE_CARD_ACCOUNT);
    });

    it('finds nothing while none is saved and Digits has no credit card account', () => {
        // Given a Digits company with only a bank account
        // When the export settings read the company card account while none is saved
        const account = getDigitsCompanyCardAccount(buildPolicy(undefined, [BANK_ACCOUNT]));

        // Then no account shows, because the exporter only defaults to a credit card account
        expect(account).toBeUndefined();
    });

    it('uses the account the admin saved', () => {
        // Given a workspace whose admin picked the bank account
        // When the export settings read the company card account
        const account = getDigitsCompanyCardAccount(buildPolicy(BANK_ACCOUNT.id));

        // Then the saved account wins over the default
        expect(account).toBe(BANK_ACCOUNT);
    });

    it('finds nothing when the saved account is no longer imported', () => {
        // Given a saved account that the last sync didn't bring back
        // When the export settings read the company card account
        const account = getDigitsCompanyCardAccount(buildPolicy('deleted-account'));

        // Then no account shows, rather than a default the exporter won't use
        expect(account).toBeUndefined();
    });
});
