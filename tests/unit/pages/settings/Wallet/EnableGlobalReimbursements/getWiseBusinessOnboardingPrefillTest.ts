import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import getWiseBusinessOnboardingPrefill, {getMissingPrefill} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseBusinessOnboardingPrefill';
import type {WiseBusinessAccountData} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseBusinessOnboardingPrefill';

import CONST from '@src/CONST';
import type {PrivatePersonalDetails} from '@src/types/onyx';

const ADDRESS_KEYS = getAddressInputKeys('address');
const BANK_ACCOUNT_ID = 1;

const BUSINESS_ACCOUNT_DATA: WiseBusinessAccountData = {
    bankAccountID: BANK_ACCOUNT_ID,
    companyName: 'Boulder Development Inc.',
    incorporationType: CONST.INCORPORATION_TYPES.LLC,
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
    it('fills the representative from private details and the business from the bank account details', () => {
        // Given a user with private details on file and the details of the business bank account being onboarded

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, BUSINESS_ACCOUNT_DATA, PRIVATE_PERSONAL_DETAILS);

        // Then the representative comes from the current address, with both street lines on the one street input the form has,
        // and the business rows use the bank account's own keys, with the LLC as its Wise company type
        expect(prefill).toEqual({
            firstName: 'Alice',
            lastName: 'Nguyen',
            phoneNumber: '+15125550199',
            dateOfBirth: '1985-04-12',
            hasNoSSN: false,
            [ADDRESS_KEYS.street]: '42 Oak Ave, Apt 3',
            [ADDRESS_KEYS.city]: 'Austin',
            [ADDRESS_KEYS.state]: 'TX',
            [ADDRESS_KEYS.zipCode]: '78704',
            [ADDRESS_KEYS.country]: CONST.COUNTRY.US,
            companyName: 'Boulder Development Inc.',
            companyType: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
        });
    });

    it('leaves the business empty when the reimbursement account holds another bank account', () => {
        // Given reimbursement account details that belong to a different bank account
        const otherAccountData: WiseBusinessAccountData = {...BUSINESS_ACCOUNT_DATA, bankAccountID: 2};

        // When the onboarding builds its starting answers for this bank account
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, otherAccountData, undefined);

        // Then no detail of the other account reaches the form, only the "I don't have a social security number" link, off
        expect(getMissingPrefill(prefill, {})).toEqual({hasNoSSN: false});
    });

    it.each([
        [CONST.INCORPORATION_TYPES.LLC, CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY],
        [CONST.INCORPORATION_TYPES.CORPORATION, CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION],
        [CONST.INCORPORATION_TYPES.SOLE_PROPRIETORSHIP, CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP],
    ])('picks the Wise company type that matches the incorporation type %s', (incorporationType, companyType) => {
        // Given a bank account whose incorporation type has one Wise company type
        const accountData: WiseBusinessAccountData = {...BUSINESS_ACCOUNT_DATA, incorporationType};

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, accountData, undefined);

        // Then the company type starts on that Wise type
        expect(prefill.companyType).toBe(companyType);
    });

    it.each([CONST.INCORPORATION_TYPES.PARTNERSHIP, CONST.INCORPORATION_TYPES.COOPERATIVE, CONST.INCORPORATION_TYPES.OTHER, undefined])(
        'leaves the company type for the admin when the incorporation type is %s',
        (incorporationType) => {
            // Given a bank account whose incorporation type has no single Wise company type, or none at all
            const accountData: WiseBusinessAccountData = {...BUSINESS_ACCOUNT_DATA, incorporationType};

            // When the onboarding builds its starting answers
            const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, accountData, undefined);

            // Then the company type is not guessed
            expect(prefill.companyType).toBeUndefined();
        },
    );

    it('turns country and state names from older addresses into the codes the pickers take', () => {
        // Given an address saved with full names
        // @ts-expect-error - Legacy addresses can contain country names before normalization.
        const details: PrivatePersonalDetails = {addresses: [{street: '1 Main St', city: 'Fresno', state: 'California', zip: '93650', country: 'United States'}]};

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, BUSINESS_ACCOUNT_DATA, details);

        // Then the pickers get codes they can show
        expect(prefill).toMatchObject({[ADDRESS_KEYS.country]: CONST.COUNTRY.US, [ADDRESS_KEYS.state]: 'CA'});
    });

    it('leaves a country or state that does not resolve for the user to pick', () => {
        // Given an address whose country and state match nothing the pickers know
        const details: PrivatePersonalDetails = {addresses: [{street: '1 Main St', city: 'Springfield', state: 'Nowhere', zip: '12345', country: CONST.COUNTRY.US}]};

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, BUSINESS_ACCOUNT_DATA, details);

        // Then the unknown state is not prefilled, so the user picks it instead of carrying a value the picker cannot show
        expect(prefill[ADDRESS_KEYS.state]).toBeUndefined();
        expect(prefill[ADDRESS_KEYS.country]).toBe(CONST.COUNTRY.US);
    });

    it('leaves out what is not on file', () => {
        // Given a user with no private details yet and no details of the bank account, such as an admin who shares the account but does not own it

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, undefined, undefined);

        // Then nothing is made up, so getMissingPrefill writes only the "I don't have a social security number" link, off, which keeps the SSN shown
        expect(getMissingPrefill(prefill, {})).toEqual({hasNoSSN: false});
    });
});

describe('getMissingPrefill', () => {
    it('keeps what the user typed, even an emptied field', () => {
        // Given a draft where the user changed the first name and the company type, and cleared the phone number
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, BUSINESS_ACCOUNT_DATA, PRIVATE_PERSONAL_DETAILS);
        const draft = {firstName: 'Alicia', phoneNumber: '', companyType: CONST.WISE.COMPANY_TYPE.TRUST};

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, draft);

        // Then the user's answers stay, and only the untouched fields are filled
        expect(missing).not.toHaveProperty('firstName');
        expect(missing).not.toHaveProperty('phoneNumber');
        expect(missing).not.toHaveProperty('companyType');
        expect(missing).toMatchObject({lastName: 'Nguyen', dateOfBirth: '1985-04-12'});
    });

    it('updates the read-only legal name, since it follows the bank account', () => {
        // Given a draft holding an older legal name
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, BUSINESS_ACCOUNT_DATA, undefined);
        const draft = {companyName: 'Old Name LLC'};

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, draft);

        // Then the bank account's legal name replaces the older one
        expect(missing).toMatchObject({companyName: 'Boulder Development Inc.'});
    });

    it('empties the read-only legal name when the bank account details are gone, so the name of another account does not stay', () => {
        // Given a draft holding another account's legal name, and no details for this bank account
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, undefined, undefined);
        const draft = {companyName: 'Old Name LLC', hasNoSSN: false};

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, draft);

        // Then the legal name is emptied, and once the draft holds that nothing is left to write
        expect(missing).toEqual({companyName: ''});
        expect(getMissingPrefill(prefill, {...draft, ...missing})).toEqual({});
    });

    it('keeps the "I don\'t have a social security number" link on once the user tapped it', () => {
        // Given a draft where the user tapped "I don't have a social security number"
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, undefined, undefined);

        // When the onboarding decides what to prefill
        const missing = getMissingPrefill(prefill, {hasNoSSN: true});

        // Then the starting answer, off, does not overwrite the user's tap
        expect(missing).not.toHaveProperty('hasNoSSN');
    });

    it('writes nothing once the draft holds every prefill answer', () => {
        // Given a draft the prefill already landed in
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, BUSINESS_ACCOUNT_DATA, PRIVATE_PERSONAL_DETAILS);

        // When the onboarding decides what to prefill again
        const missing = getMissingPrefill(prefill, prefill);

        // Then there is nothing left to write, so the page stops waiting and renders the flow
        expect(missing).toEqual({});
    });

    it('resumes from the pages saved to Wise, over the details on file', () => {
        // Given a representative page saved earlier, with an SSN the server holds, a file it stored, and a key a later save dropped
        const businessAccountData: WiseBusinessAccountData = {
            ...BUSINESS_ACCOUNT_DATA,
            wise: {
                pages: {representative: {firstName: 'Alicia', ssnProvided: true, phoneNumber: null}},
                documents: {representative: {idDocument: ['kyc/1/license.jpg']}},
            },
        };

        // When the onboarding builds its starting answers
        const prefill = getWiseBusinessOnboardingPrefill(BANK_ACCOUNT_ID, businessAccountData, PRIVATE_PERSONAL_DETAILS);

        // Then the saved name wins over the private details, the SSN counts as provided, the file comes back as a saved file,
        // and the dropped key falls back to the details on file
        expect(prefill).toMatchObject({
            firstName: 'Alicia',
            ssnProvided: true,
            phoneNumber: '+15125550199',
            idDocument: [{name: 'license.jpg', uri: 'kyc/1/license.jpg', savedFileKey: 'kyc/1/license.jpg'}],
        });
    });
});
