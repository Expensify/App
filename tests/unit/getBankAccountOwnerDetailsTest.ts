import {
    getBankAccountOwnerDetails,
    getPersonalInfoStepValues,
    getSkippedBankAccountOwnerPages,
    getWalletOwnerDraftValues,
} from '@pages/EnablePayments/Wallet/utils/getBankAccountOwnerDetails';
import getInitialSubstepForPersonalInfo from '@pages/EnablePayments/Wallet/utils/getInitialSubstepForPersonalInfo';

import CONST from '@src/CONST';
import type {PrivatePersonalDetails} from '@src/types/onyx';

const completeProfile: PrivatePersonalDetails = {
    legalFirstName: 'Ada',
    legalLastName: 'Lovelace',
    addresses: [
        {
            street: '123 Main St\nApt 4',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            country: CONST.COUNTRY.US,
            current: true,
        },
    ],
};

describe('getBankAccountOwnerDetails', () => {
    it('returns empty owner details and skips nothing when the profile is empty', () => {
        const owner = getBankAccountOwnerDetails({privatePersonalDetails: {}});

        expect(owner).toMatchObject({
            legalFirstName: '',
            legalLastName: '',
            addressStreet: '',
            addressStreet2: '',
            addressCity: '',
            addressState: '',
            addressZipCode: '',
            displayStreet: '',
            formStreet: '',
            country: '',
            hasLegalName: false,
            hasAddress: false,
        });
        expect(getSkippedBankAccountOwnerPages(owner)).toEqual([]);
    });

    it('skips legal name and address for a complete US profile and keeps street2', () => {
        const owner = getBankAccountOwnerDetails({privatePersonalDetails: completeProfile});

        expect(owner.legalFirstName).toBe('Ada');
        expect(owner.legalLastName).toBe('Lovelace');
        expect(owner.addressStreet).toBe('123 Main St');
        expect(owner.addressStreet2).toBe('Apt 4');
        expect(owner.displayStreet).toBe('123 Main St\nApt 4');
        expect(owner.formStreet).toBe('123 Main St Apt 4');
        expect(owner.addressCity).toBe('Austin');
        expect(owner.addressState).toBe('TX');
        expect(owner.addressZipCode).toBe('78701');
        expect(owner.country).toBe(CONST.COUNTRY.US);
        expect(getSkippedBankAccountOwnerPages(owner)).toEqual([
            CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES.LEGAL_NAME,
            CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES.ADDRESS,
        ]);
    });

    it('maps a separate profile street2 field', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addresses: [
                    {
                        street: '123 Main St',
                        street2: 'Apt 4',
                        city: 'Austin',
                        state: 'TX',
                        zip: '78701',
                        country: CONST.COUNTRY.US,
                        current: true,
                    },
                ],
            },
        });

        expect(owner.addressStreet).toBe('123 Main St');
        expect(owner.addressStreet2).toBe('Apt 4');
    });

    it('lets the wallet draft override the profile', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: completeProfile,
            walletAdditionalDetailsDraft: {
                legalFirstName: 'Grace',
                legalLastName: 'Hopper',
                addressStreet: '9 Oak Ave',
                addressCity: 'Dallas',
                addressState: 'TX',
                addressZipCode: '75201',
            },
        });

        expect(owner.legalFirstName).toBe('Grace');
        expect(owner.legalLastName).toBe('Hopper');
        expect(owner.addressStreet).toBe('9 Oak Ave');
        expect(owner.addressStreet2).toBe('');
        expect(owner.addressCity).toBe('Dallas');
        expect(owner.country).toBe(CONST.COUNTRY.US);
        expect(owner.hasAddress).toBe(true);
    });

    it('does not skip a non-US profile address', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addresses: [
                    {
                        street: '10 King St',
                        city: 'Toronto',
                        state: 'ON',
                        zip: 'M5V 1A1',
                        country: CONST.COUNTRY.CA,
                        current: true,
                    },
                ],
            },
        });

        expect(owner.hasLegalName).toBe(true);
        expect(owner.hasAddress).toBe(false);
        expect(owner.country).toBe('');
        expect(getSkippedBankAccountOwnerPages(owner)).toEqual([CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES.LEGAL_NAME]);
    });

    it('treats a complete profile address with no country as a legacy US address', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addresses: [
                    {
                        street: '123 Main St',
                        city: 'Austin',
                        state: 'TX',
                        zip: '78701',
                        current: true,
                    },
                ],
            },
        });

        expect(owner.hasAddress).toBe(true);
        expect(owner.country).toBe(CONST.COUNTRY.US);
    });

    it('starts KYC at date of birth and skips name and address when those are already complete', () => {
        const values = getPersonalInfoStepValues(undefined, undefined, completeProfile);

        expect(values.legalFirstName).toBe('Ada');
        expect(values.addressStreet).toBe('123 Main St Apt 4');
        expect(values.dob).toBe('');
        expect(getInitialSubstepForPersonalInfo(values)).toBe(CONST.WALLET.SUBSTEP_INDEXES.PERSONAL_INFO.DATE_OF_BIRTH);
        expect(getSkippedBankAccountOwnerPages(getBankAccountOwnerDetails({privatePersonalDetails: completeProfile}))).toEqual([
            CONST.ENABLE_PAYMENTS.PERSONAL_INFO_STEP.SUB_PAGE_NAMES.LEGAL_NAME,
            CONST.ENABLE_PAYMENTS.PERSONAL_INFO_STEP.SUB_PAGE_NAMES.ADDRESS,
        ]);
    });

    it('does not treat a PO box as a complete address', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addresses: [
                    {
                        street: 'PO Box 123',
                        city: 'Austin',
                        state: 'TX',
                        zip: '78701',
                        country: CONST.COUNTRY.US,
                        current: true,
                    },
                ],
            },
        });

        expect(owner.hasAddress).toBe(false);
        expect(owner.country).toBe('');
        expect(getSkippedBankAccountOwnerPages(owner)).toEqual([CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES.LEGAL_NAME]);
    });

    it('does not treat an invalid US ZIP as a complete address', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addresses: [
                    {
                        street: '123 Main St',
                        city: 'Austin',
                        state: 'TX',
                        zip: '7870',
                        country: CONST.COUNTRY.US,
                        current: true,
                    },
                ],
            },
        });

        expect(owner.hasAddress).toBe(false);
        expect(owner.country).toBe('');
    });

    it('does not turn a non-US profile into a US address when only one field comes from the wallet draft', () => {
        const owner = getBankAccountOwnerDetails({
            privatePersonalDetails: {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addresses: [
                    {
                        street: '10 King St',
                        city: 'Toronto',
                        state: 'ON',
                        zip: 'M5V 1A1',
                        country: CONST.COUNTRY.CA,
                        current: true,
                    },
                ],
            },
            walletAdditionalDetailsDraft: {
                addressState: 'TX',
            },
        });

        expect(owner.addressState).toBe('TX');
        expect(owner.addressCity).toBe('Toronto');
        expect(owner.hasAddress).toBe(false);
        expect(owner.country).toBe('');
    });

    it('stores a single-line street in the wallet draft', () => {
        const owner = getBankAccountOwnerDetails({privatePersonalDetails: completeProfile});

        expect(getWalletOwnerDraftValues(owner).addressStreet).toBe('123 Main St Apt 4');
    });
});
