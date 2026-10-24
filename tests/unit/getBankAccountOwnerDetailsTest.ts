import {
    getBankAccountOwnerDetails,
    getPersonalInfoStepValues,
    getSkippedBankAccountOwnerPages,
    getWalletOwnerDraftValues,
} from '@pages/EnablePayments/Wallet/utils/getBankAccountOwnerDetails';
import getInitialSubstepForPersonalInfo from '@pages/EnablePayments/Wallet/utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '@pages/EnablePayments/Wallet/utils/getSubstepValues';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalInfoStepProps, WalletAdditionalDetailsForm} from '@src/types/form/WalletAdditionalDetailsForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

const poBoxProfile: PrivatePersonalDetails = {
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
        const owner = getBankAccountOwnerDetails({privatePersonalDetails: poBoxProfile});

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

    it('does not seed a profile address that failed the US checks', () => {
        const owner = getBankAccountOwnerDetails({privatePersonalDetails: poBoxProfile});

        expect(getWalletOwnerDraftValues(owner)).toEqual({
            legalFirstName: 'Ada',
            legalLastName: 'Lovelace',
        });
    });
});

describe('getSubstepValues', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    const persistedDetails: WalletAdditionalDetailsRefactor = {
        legalFirstName: 'Ada',
        legalLastName: 'Lovelace',
        dob: '1990-01-02',
        ssn: '1234',
        addressStreet: '123 Main St',
        addressCity: 'Austin',
        addressState: 'TX',
        addressZipCode: '78701',
        phoneNumber: '15125550100',
        isLoading: true,
        errors: {wallet: 'Saved error'},
    };
    const draftDetails: WalletAdditionalDetailsForm = {
        legalFirstName: 'Grace',
        legalLastName: 'Hopper',
        dob: '1991-03-04',
        ssn: '5678',
        addressStreet: '9 Oak Ave',
        addressCity: 'Dallas',
        addressState: 'CA',
        addressZipCode: '90210',
        phoneNumber: '12135550100',
        isLoading: false,
        errors: {wallet: 'Draft error'},
        errorFields: {legalFirstName: {wallet: 'Name error'}},
    };

    it('returns exactly the nine personal fields in input order with draft values taking precedence', () => {
        // Given distinct draft and saved values plus form metadata that must not become inputs.
        const draftBefore = {...draftDetails};
        const persistedBefore = {...persistedDetails};

        // When the personal step reads values through its production helper.
        const values: PersonalInfoStepProps = getSubstepValues(draftDetails, persistedDetails);

        // Then every field has its matching draft value and neither source nor metadata leaks into the result.
        expect(values).toEqual({
            legalFirstName: 'Grace',
            legalLastName: 'Hopper',
            dob: '1991-03-04',
            ssn: '5678',
            addressStreet: '9 Oak Ave',
            addressCity: 'Dallas',
            addressState: 'CA',
            addressZipCode: '90210',
            phoneNumber: '12135550100',
        });
        expect(Object.keys(values)).toEqual(['legalFirstName', 'legalLastName', 'dob', 'ssn', 'addressStreet', 'addressCity', 'addressState', 'addressZipCode', 'phoneNumber']);
        expect(draftDetails).toEqual(draftBefore);
        expect(persistedDetails).toEqual(persistedBefore);
    });

    it('uses saved fields for a partial draft while preserving empty strings from either source', () => {
        // Given an incompletely saved form draft with deliberate empty overrides.
        const partialDraft = createMock<WalletAdditionalDetailsForm>({legalFirstName: '', dob: undefined, ssn: '9999', phoneNumber: ''});
        const saved: WalletAdditionalDetailsRefactor = {...persistedDetails, addressCity: ''};

        // When absent draft fields fall back to saved personal details.
        const values = getSubstepValues(partialDraft, saved);

        // Then empty strings are values and each absent field retains its corresponding saved value.
        expect(values).toEqual({
            legalFirstName: '',
            legalLastName: 'Lovelace',
            dob: '1990-01-02',
            ssn: '9999',
            addressStreet: '123 Main St',
            addressCity: '',
            addressState: 'TX',
            addressZipCode: '78701',
            phoneNumber: '',
        });
    });

    it.each(['absent', 'cleared'] as const)('uses saved values when draft storage is %s', async (draftState) => {
        // Given saved details and either an untouched draft or an edited draft that was removed.
        await Onyx.set(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, persistedDetails);
        if (draftState === 'cleared') {
            await Onyx.set(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, draftDetails);
            await waitForBatchedUpdates();
            expect(await getOnyxValue(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT)).toEqual(draftDetails);
            await Onyx.set(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, null);
        }
        await waitForBatchedUpdates();
        const draft = await getOnyxValue(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
        const persisted = await getOnyxValue(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
        expect(draft).toBeUndefined();
        expect(persisted).toEqual(persistedDetails);

        // When the helper consumes the native absent draft entry alongside the retained saved details.
        const values = getSubstepValues(draft, persisted);

        // Then all personal fields survive without saved error or loading metadata.
        expect(values).toEqual({
            legalFirstName: 'Ada',
            legalLastName: 'Lovelace',
            dob: '1990-01-02',
            ssn: '1234',
            addressStreet: '123 Main St',
            addressCity: 'Austin',
            addressState: 'TX',
            addressZipCode: '78701',
            phoneNumber: '15125550100',
        });
    });

    it.each(['absent', 'cleared'] as const)('defaults every personal field to an empty string when both storage entries are %s', async (sourceState) => {
        // Given either a newly opened wallet flow or a previously populated flow whose two sources were removed.
        if (sourceState === 'cleared') {
            await Onyx.set(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, draftDetails);
            await Onyx.set(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, persistedDetails);
            await waitForBatchedUpdates();
            expect(await getOnyxValue(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT)).toEqual(draftDetails);
            expect(await getOnyxValue(ONYXKEYS.WALLET_ADDITIONAL_DETAILS)).toEqual(persistedDetails);
            await Onyx.set(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, null);
            await Onyx.set(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, null);
        }
        await waitForBatchedUpdates();
        const draft = await getOnyxValue(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
        const persisted = await getOnyxValue(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
        expect(draft).toBeUndefined();
        expect(persisted).toBeUndefined();

        // When the helper receives the real missing entries and must supply the complete form contract itself.
        const values = getSubstepValues(draft, persisted);

        // Then every own field exists even without source values.
        expect(values).toEqual({legalFirstName: '', legalLastName: '', dob: '', ssn: '', addressStreet: '', addressCity: '', addressState: '', addressZipCode: '', phoneNumber: ''});
        expect(Object.keys(values)).toEqual(['legalFirstName', 'legalLastName', 'dob', 'ssn', 'addressStreet', 'addressCity', 'addressState', 'addressZipCode', 'phoneNumber']);
    });

    it('keeps draft date of birth, phone and SSN through the owner-details consumer', () => {
        // Given wallet identity values alongside a complete private owner profile.
        // When the existing consumer combines owner details with the personal step values.
        const values = getPersonalInfoStepValues(draftDetails, persistedDetails, completeProfile);

        // Then the wallet fields still reach KYC along with the resolved owner name and address.
        expect(values).toEqual({
            legalFirstName: 'Grace',
            legalLastName: 'Hopper',
            dob: '1991-03-04',
            ssn: '5678',
            addressStreet: '9 Oak Ave',
            addressCity: 'Dallas',
            addressState: 'CA',
            addressZipCode: '90210',
            phoneNumber: '12135550100',
        });
    });
});
