import {getDefaultCompanyWebsite, getLastFourDigits, hasPartiallySetupBankAccount, isBankAccountPartiallySetup, isPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import CONST from '@src/CONST';
import type {Account, BankAccountList, PrivatePersonalDetails, Session} from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';

describe('BankAccountUtils', () => {
    describe('isPersonalBankAccountMissingInfo', () => {
        const completePersonalDetails: PrivatePersonalDetails = {
            legalFirstName: 'John',
            legalLastName: 'Doe',
            phoneNumber: '+15551234567',
            addresses: [{street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US', current: true}],
        };

        const usPersonalBankAccount: AccountData = {
            type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {country: CONST.COUNTRY.US},
        } as AccountData;

        it('returns false for non-personal bank accounts', () => {
            const accountData = {
                ...usPersonalBankAccount,
                type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData, completePersonalDetails)).toBe(false);
        });

        it('returns false for accounts not in OPEN state', () => {
            const accountData = {
                ...usPersonalBankAccount,
                state: CONST.BANK_ACCOUNT.STATE.SETUP,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData, completePersonalDetails)).toBe(false);
        });

        it('returns false for non-US accounts', () => {
            const accountData = {
                ...usPersonalBankAccount,
                additionalData: {country: 'CA'},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData, completePersonalDetails)).toBe(false);
        });

        it('returns true when legal first name is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                legalFirstName: '',
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when legal last name is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                legalLastName: '',
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when address street is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                addresses: [{street: '', city: 'New York', state: 'NY', zip: '10001', country: 'US', current: true}],
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when address city is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                addresses: [{street: '123 Main St', city: '', state: 'NY', zip: '10001', country: 'US', current: true}],
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when address state is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                addresses: [{street: '123 Main St', city: 'New York', state: '', zip: '10001', country: 'US', current: true}],
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when address zip is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                addresses: [{street: '123 Main St', city: 'New York', state: 'NY', zip: '', country: 'US', current: true}],
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when addresses array is empty', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                addresses: [],
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns true when phone number is missing', () => {
            const details: PrivatePersonalDetails = {
                ...completePersonalDetails,
                phoneNumber: '',
            };
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, details)).toBe(true);
        });

        it('returns false when all personal info is present', () => {
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, completePersonalDetails)).toBe(false);
        });

        it('returns false when accountData is undefined', () => {
            expect(isPersonalBankAccountMissingInfo(undefined, completePersonalDetails)).toBe(false);
        });

        it('returns false when privatePersonalDetails is undefined', () => {
            expect(isPersonalBankAccountMissingInfo(usPersonalBankAccount, undefined)).toBe(true);
        });
    });

    describe('getLastFourDigits', () => {
        it('returns last 4 digits of bank account number', () => {
            expect(getLastFourDigits('123456789012')).toBe('9012');
        });

        it('returns entire string if less than 4 characters', () => {
            expect(getLastFourDigits('123')).toBe('123');
        });

        it('returns empty string for empty input', () => {
            expect(getLastFourDigits('')).toBe('');
        });

        it('returns exactly 4 characters for 4-digit input', () => {
            expect(getLastFourDigits('1234')).toBe('1234');
        });
    });

    describe('isBankAccountPartiallySetup', () => {
        it('returns true for SETUP state', () => {
            expect(isBankAccountPartiallySetup(CONST.BANK_ACCOUNT.STATE.SETUP)).toBe(true);
        });

        it('returns true for VERIFYING state', () => {
            expect(isBankAccountPartiallySetup(CONST.BANK_ACCOUNT.STATE.VERIFYING)).toBe(true);
        });

        it('returns true for PENDING state', () => {
            expect(isBankAccountPartiallySetup(CONST.BANK_ACCOUNT.STATE.PENDING)).toBe(true);
        });

        it('returns false for OPEN state', () => {
            expect(isBankAccountPartiallySetup(CONST.BANK_ACCOUNT.STATE.OPEN)).toBe(false);
        });

        it('returns false for undefined state', () => {
            expect(isBankAccountPartiallySetup(undefined)).toBe(false);
        });

        it('returns false for empty string state', () => {
            expect(isBankAccountPartiallySetup('')).toBe(false);
        });
    });

    describe('hasPartiallySetupBankAccount', () => {
        it('returns true when at least one account is in SETUP state', () => {
            const bankAccountList = {
                '1': {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
                '2': {accountData: {state: CONST.BANK_ACCOUNT.STATE.SETUP}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(true);
        });

        it('returns true when at least one account is in VERIFYING state', () => {
            const bankAccountList = {
                '1': {accountData: {state: CONST.BANK_ACCOUNT.STATE.VERIFYING}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(true);
        });

        it('returns false when all accounts are in OPEN state', () => {
            const bankAccountList = {
                '1': {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
                '2': {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(false);
        });

        it('returns false for empty bank account list', () => {
            expect(hasPartiallySetupBankAccount({})).toBe(false);
        });

        it('returns false for null/undefined bank account list', () => {
            expect(hasPartiallySetupBankAccount(undefined)).toBe(false);
        });
    });

    describe('getDefaultCompanyWebsite', () => {
        it('returns website URL from email domain when not public domain', () => {
            const session: Session = {email: 'user@company.com'} as Session;
            const account: Account = {isFromPublicDomain: false} as Account;
            expect(getDefaultCompanyWebsite(session, account)).toBe('https://www.company.com');
        });

        it('returns empty string for public domain when shouldShowPublicDomain is false', () => {
            const session: Session = {email: 'user@gmail.com'} as Session;
            const account: Account = {isFromPublicDomain: true} as Account;
            expect(getDefaultCompanyWebsite(session, account, false)).toBe('');
        });

        it('returns website URL for public domain when shouldShowPublicDomain is true', () => {
            const session: Session = {email: 'user@gmail.com'} as Session;
            const account: Account = {isFromPublicDomain: true} as Account;
            expect(getDefaultCompanyWebsite(session, account, true)).toBe('https://www.gmail.com');
        });

        it('handles undefined session email', () => {
            const session: Session = {} as Session;
            const account: Account = {isFromPublicDomain: false} as Account;
            expect(getDefaultCompanyWebsite(session, account)).toBe('https://www.');
        });

        it('handles undefined session', () => {
            const account: Account = {isFromPublicDomain: false} as Account;
            expect(getDefaultCompanyWebsite(undefined, account)).toBe('https://www.');
        });
    });
});
