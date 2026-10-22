import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import getWiseBusinessOnboardingPrefill, {getMissingPrefill} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseBusinessOnboardingPrefill';

import CONST from '@src/CONST';
import type {BankAccount, PrivatePersonalDetails} from '@src/types/onyx';

const ADDRESS_KEYS = getAddressInputKeys('address');

const BANK_ACCOUNT: BankAccount = {
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {bankAccountID: 1, addressName: 'Boulder Development Inc.'},
};

const PRIVATE_PERSONAL_DETAILS: PrivatePersonalDetails = {
    legalFirstName: 'Alice',
    legalLastName: 'Nguyen',
    phoneNumber: '+15125550199',
    dob: '1985-04-12',
    addresses: [
        {street: '1 Old Rd', city: 'Dallas', state: 'TX', zip: '75201', country: CONST.COUNTRY.US},
        {street: '42 Oak Ave\nApt 3', city: 'Austin', state: 'TX', zip: '78704', country: CONST.COUNTRY.US, current: true},
    ],
};

describe('getWiseBusinessOnboardingPrefill', () => {
    it('fills the representative from private details and the business name from the bank account', () => {
        // Given a user with private details on file and a business bank account

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, PRIVATE_PERSONAL_DETAILS);

        // Then the representative comes from the current address, with both street lines on the one street input the form has
        expect(prefill).toEqual({
            firstName: 'Alice',
            lastName: 'Nguyen',
            phoneNumber: '+15125550199',
            dateOfBirth: '1985-04-12',
            [ADDRESS_KEYS.street]: '42 Oak Ave, Apt 3',
            [ADDRESS_KEYS.city]: 'Austin',
            [ADDRESS_KEYS.state]: 'TX',
            [ADDRESS_KEYS.zipCode]: '78704',
            [ADDRESS_KEYS.country]: CONST.COUNTRY.US,
            companyName: 'Boulder Development Inc.',
        });
    });

    it('turns country and state names from older addresses into the codes the pickers take', () => {
        // Given an address saved with full names
        // @ts-expect-error - Legacy addresses can contain country names before normalization.
        const details: PrivatePersonalDetails = {addresses: [{street: '1 Main St', city: 'Fresno', state: 'California', zip: '93650', country: 'United States'}]};

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, details);

        // Then the pickers get codes they can show
        expect(prefill).toMatchObject({[ADDRESS_KEYS.country]: CONST.COUNTRY.US, [ADDRESS_KEYS.state]: 'CA'});
    });

    it('leaves a country or state that does not resolve for the user to pick', () => {
        // Given an address whose country and state match nothing the pickers know
        const details: PrivatePersonalDetails = {addresses: [{street: '1 Main St', city: 'Springfield', state: 'Nowhere', zip: '12345', country: CONST.COUNTRY.US}]};

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, details);

        // Then the unknown state is not prefilled, so the user picks it instead of carrying a value the picker cannot show
        expect(prefill[ADDRESS_KEYS.state]).toBeUndefined();
        expect(prefill[ADDRESS_KEYS.country]).toBe(CONST.COUNTRY.US);
    });

    it('leaves out what is not on file', () => {
        // Given a user with no private details yet

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, undefined);

        // Then nothing is made up, so getMissingPrefill writes only the business name
        expect(getMissingPrefill(prefill, {})).toEqual({companyName: 'Boulder Development Inc.'});
    });
});

describe('getMissingPrefill', () => {
    it('keeps what the user typed, even an emptied field', () => {
        // Given a draft where the user changed the first name and cleared the phone number
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, PRIVATE_PERSONAL_DETAILS);
        const draft = {firstName: 'Alicia', phoneNumber: ''};

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, draft);

        // Then the user's answers stay, and only the untouched fields are filled
        expect(missing).not.toHaveProperty('firstName');
        expect(missing).not.toHaveProperty('phoneNumber');
        expect(missing).toMatchObject({lastName: 'Nguyen', dateOfBirth: '1985-04-12'});
    });

    it('updates the business name, since it is a read-only row that follows the bank account', () => {
        // Given a draft holding an older business name
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, undefined);

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, {companyName: 'Old Name LLC'});

        // Then the bank account's name replaces it
        expect(missing).toEqual({companyName: 'Boulder Development Inc.'});
    });

    it('empties the business name when the bank account has none, so the name of another account does not stay', () => {
        // Given a draft holding another account's name and a bank account without a name
        const prefill = getWiseBusinessOnboardingPrefill({...BANK_ACCOUNT, accountData: {bankAccountID: 2}}, undefined);

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, {companyName: 'Old Name LLC'});

        // Then the read-only row is emptied, and once the draft holds that nothing is left to write
        expect(missing).toEqual({companyName: ''});
        expect(getMissingPrefill(prefill, missing)).toEqual({});
    });

    it('writes nothing once the draft holds every prefill answer', () => {
        // Given a draft the prefill already landed in
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT, PRIVATE_PERSONAL_DETAILS);

        // When the onboarding decides what to prefill again
        const missing = getMissingPrefill(prefill, prefill);

        // Then there is nothing left to write, so the page stops waiting and renders the flow
        expect(missing).toEqual({});
    });
});
