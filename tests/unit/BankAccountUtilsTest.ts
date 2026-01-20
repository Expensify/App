import {isPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import CONST from '@src/CONST';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';

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
