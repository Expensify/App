import {
    getCompletedStepsForBankAccount,
    getDefaultCompanyWebsite,
    getLastFourDigits,
    hasPartiallySetupBankAccount,
    isBankAccountPartiallySetup,
    isPersonalBankAccountMissingInfo,
    PERSONAL_INFO_STEP,
} from '@libs/BankAccountUtils';
import CONST from '@src/CONST';
import type {Account, BankAccountList, Session} from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';

describe('BankAccountUtils', () => {
    describe('isPersonalBankAccountMissingInfo', () => {
        const completeAccountData: AccountData = {
            type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {
                country: CONST.COUNTRY.US,
                firstName: 'John',
                lastName: 'Doe',
                addressStreet: '123 Main St',
                addressCity: 'New York',
                addressState: 'NY',
                addressZipCode: '10001',
                companyPhone: '+15551234567',
            },
        } as AccountData;

        it('returns false for non-personal bank accounts', () => {
            const accountData = {
                ...completeAccountData,
                type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('returns false for accounts not in OPEN state', () => {
            const accountData = {
                ...completeAccountData,
                state: CONST.BANK_ACCOUNT.STATE.SETUP,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('returns false for non-US accounts', () => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, country: 'CA'},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('defaults to US when country is undefined and returns false when all info is present', () => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, country: undefined},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(false);
        });

        it('defaults to US when country is undefined and returns true when info is missing', () => {
            const accountData = {
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                additionalData: {country: undefined},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns false when accountData is undefined', () => {
            expect(isPersonalBankAccountMissingInfo(undefined)).toBe(false);
        });

        it('defaults to US when additionalData is undefined and returns true since all fields are missing', () => {
            const accountData = {
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it.each([
            {field: 'firstName', override: {firstName: ''}},
            {field: 'lastName', override: {lastName: ''}},
            {field: 'addressStreet', override: {addressStreet: ''}},
            {field: 'addressCity', override: {addressCity: ''}},
            {field: 'addressState', override: {addressState: ''}},
            {field: 'addressZipCode', override: {addressZipCode: ''}},
            {field: 'companyPhone', override: {companyPhone: ''}},
        ])('returns true when $field is empty string', ({override}) => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, ...override},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it.each([
            {field: 'firstName', override: {firstName: undefined}},
            {field: 'lastName', override: {lastName: undefined}},
            {field: 'addressStreet', override: {addressStreet: undefined}},
            {field: 'addressCity', override: {addressCity: undefined}},
            {field: 'addressState', override: {addressState: undefined}},
            {field: 'addressZipCode', override: {addressZipCode: undefined}},
            {field: 'companyPhone', override: {companyPhone: undefined}},
        ])('returns true when $field is undefined', ({override}) => {
            const accountData = {
                ...completeAccountData,
                additionalData: {...completeAccountData.additionalData, ...override},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns true when all owner fields are missing (only country present)', () => {
            const accountData = {
                type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
                additionalData: {country: CONST.COUNTRY.US},
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns true when name and phone are missing but address is present', () => {
            const accountData = {
                ...completeAccountData,
                additionalData: {
                    country: CONST.COUNTRY.US,
                    addressStreet: '123 Main St',
                    addressCity: 'New York',
                    addressState: 'NY',
                    addressZipCode: '10001',
                },
            } as AccountData;
            expect(isPersonalBankAccountMissingInfo(accountData)).toBe(true);
        });

        it('returns false when all info is present', () => {
            expect(isPersonalBankAccountMissingInfo(completeAccountData)).toBe(false);
        });
    });

    describe('getLastFourDigits', () => {
        it.each([
            {input: '123456789012', expected: '9012', description: 'long account number'},
            {input: '123', expected: '123', description: 'less than 4 characters'},
            {input: '', expected: '', description: 'empty string'},
            {input: '1234', expected: '1234', description: 'exactly 4 characters'},
        ])('returns $expected for $description', ({input, expected}) => {
            expect(getLastFourDigits(input)).toBe(expected);
        });
    });

    describe('isBankAccountPartiallySetup', () => {
        it.each([
            {state: CONST.BANK_ACCOUNT.STATE.SETUP, name: 'SETUP'},
            {state: CONST.BANK_ACCOUNT.STATE.VERIFYING, name: 'VERIFYING'},
            {state: CONST.BANK_ACCOUNT.STATE.PENDING, name: 'PENDING'},
        ])('returns true for $name state', ({state}) => {
            expect(isBankAccountPartiallySetup(state)).toBe(true);
        });

        it.each([
            {state: CONST.BANK_ACCOUNT.STATE.OPEN, name: 'OPEN'},
            {state: undefined, name: 'undefined'},
            {state: '', name: 'empty string'},
        ])('returns false for $name state', ({state}) => {
            expect(isBankAccountPartiallySetup(state)).toBe(false);
        });
    });

    describe('hasPartiallySetupBankAccount', () => {
        it('returns true when at least one account is in SETUP state', () => {
            const bankAccountList = {
                accountOne: {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
                accountTwo: {accountData: {state: CONST.BANK_ACCOUNT.STATE.SETUP}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(true);
        });

        it('returns true when at least one account is in VERIFYING state', () => {
            const bankAccountList = {
                accountOne: {accountData: {state: CONST.BANK_ACCOUNT.STATE.VERIFYING}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(hasPartiallySetupBankAccount(bankAccountList)).toBe(true);
        });

        it('returns false when all accounts are in OPEN state', () => {
            const bankAccountList = {
                accountOne: {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
                accountTwo: {accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN}, bankCurrency: 'USD', bankCountry: 'US'},
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

    describe('getCompletedStepsForBankAccount', () => {
        const bankAccountID = 12345;
        const bankAccountKey = String(bankAccountID);

        const fullAdditionalData = {
            firstName: 'John',
            lastName: 'Doe',
            addressStreet: '123 Main St',
            addressCity: 'New York',
            addressState: 'NY',
            addressZipCode: '10001',
            companyPhone: '+15551234567',
        };

        it('returns all steps when all data is present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: fullAdditionalData}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            const result = getCompletedStepsForBankAccount(bankAccountList, bankAccountID);
            expect(result).toEqual([PERSONAL_INFO_STEP.NAME, PERSONAL_INFO_STEP.ADDRESS, PERSONAL_INFO_STEP.PHONE]);
        });

        it('returns empty array when bank account is not found', () => {
            const bankAccountList = {} as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('returns empty array when bankAccountList is undefined', () => {
            expect(getCompletedStepsForBankAccount(undefined, bankAccountID)).toEqual([]);
        });

        it('returns only NAME step when only name fields are present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {firstName: 'John', lastName: 'Doe'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.NAME]);
        });

        it('returns only ADDRESS step when only address fields are present', () => {
            const bankAccountList = {
                [bankAccountKey]: {
                    accountData: {additionalData: {addressStreet: '123 Main St', addressCity: 'New York', addressState: 'NY', addressZipCode: '10001'}},
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.ADDRESS]);
        });

        it('returns only PHONE step when only phone is present', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {companyPhone: '+15551234567'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.PHONE]);
        });

        it('returns empty array when accountData has no additionalData', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('does not include NAME when only firstName is present (lastName missing)', () => {
            const bankAccountList = {
                [bankAccountKey]: {accountData: {additionalData: {firstName: 'John'}}, bankCurrency: 'USD', bankCountry: 'US'},
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });

        it('returns multiple steps when some groups are complete', () => {
            const bankAccountList = {
                [bankAccountKey]: {
                    accountData: {additionalData: {firstName: 'John', lastName: 'Doe', companyPhone: '+15551234567'}},
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([PERSONAL_INFO_STEP.NAME, PERSONAL_INFO_STEP.PHONE]);
        });

        it('does not include ADDRESS when one address field is missing', () => {
            const bankAccountList = {
                [bankAccountKey]: {
                    accountData: {additionalData: {addressStreet: '123 Main St', addressCity: 'New York', addressState: 'NY'}},
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                },
            } as unknown as BankAccountList;
            expect(getCompletedStepsForBankAccount(bankAccountList, bankAccountID)).toEqual([]);
        });
    });
});
