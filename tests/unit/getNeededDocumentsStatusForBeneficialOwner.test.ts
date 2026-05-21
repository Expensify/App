import CONST from '../../src/CONST';
import getNeededDocumentsStatusForBeneficialOwner from '../../src/pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner';

const {GBP, EUR, CAD, AUD} = CONST.CURRENCY;
const {GB, US, IT, FR} = CONST.COUNTRY;

describe('getNeededDocumentsStatusForBeneficialOwner', () => {
    describe('isProofOfAddressNeeded — address country mismatch', () => {
        test('requires proof of address when beneficial owner address country differs from account country', () => {
            // GB account, GB nationality (no copy-of-ID needed), but US address — mismatch must trigger proof of address
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, GB, US);
            expect(result.isProofOfAddressNeeded).toBe(true);
        });

        test('does not require proof of address when address country matches account country', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, GB, GB);
            expect(result.isProofOfAddressNeeded).toBe(false);
        });

        test('does not require proof of address when beneficial owner address country is empty', () => {
            // Empty address country — cannot determine mismatch, default to no requirement
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, GB, '');
            expect(result.isProofOfAddressNeeded).toBe(false);
        });

        test('does not require proof of address when account country is empty', () => {
            // Account country unknown — cannot determine mismatch, default to no requirement
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, '', GB, FR);
            expect(result.isProofOfAddressNeeded).toBe(false);
        });

        test('requires proof of address for non-GBP workspace when address country mismatches account country', () => {
            // Mismatch should be currency-agnostic
            const result = getNeededDocumentsStatusForBeneficialOwner(CAD, GB, GB, US);
            expect(result.isProofOfAddressNeeded).toBe(true);
        });

        test('mismatch combined with EUR currency still requires proof of address', () => {
            // EUR already requires proof of address; mismatch is additive but result is the same
            const result = getNeededDocumentsStatusForBeneficialOwner(EUR, FR, GB, US);
            expect(result.isProofOfAddressNeeded).toBe(true);
        });
    });

    describe('isCopyOfIDNeeded', () => {
        test('requires copy of ID for GBP workspace when nationality is non-GB', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, US, '');
            expect(result.isCopyOfIDNeeded).toBe(true);
        });

        test('does not require copy of ID for GBP workspace when nationality is GB', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, GB, '');
            expect(result.isCopyOfIDNeeded).toBe(false);
        });

        test('does not require copy of ID for non-GBP workspace', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(EUR, FR, US, '');
            expect(result.isCopyOfIDNeeded).toBe(false);
        });
    });

    describe('isProofOfOwnershipNeeded', () => {
        test('requires proof of ownership for EUR, AUD, CAD workspaces', () => {
            expect(getNeededDocumentsStatusForBeneficialOwner(EUR, FR, GB, '').isProofOfOwnershipNeeded).toBe(true);
            expect(getNeededDocumentsStatusForBeneficialOwner(AUD, GB, GB, '').isProofOfOwnershipNeeded).toBe(true);
            expect(getNeededDocumentsStatusForBeneficialOwner(CAD, GB, GB, '').isProofOfOwnershipNeeded).toBe(true);
        });

        test('requires proof of ownership for GBP workspace with non-GB nationality', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, US, '');
            expect(result.isProofOfOwnershipNeeded).toBe(true);
        });

        test('does not require proof of ownership for GBP workspace with GB nationality', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(GBP, GB, GB, '');
            expect(result.isProofOfOwnershipNeeded).toBe(false);
        });
    });

    describe('isCodiceFiscaleNeeded', () => {
        test('requires codice fiscale when account country is IT', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(EUR, IT, GB, '');
            expect(result.isCodiceFiscaleNeeded).toBe(true);
        });

        test('does not require codice fiscale for non-IT account country', () => {
            const result = getNeededDocumentsStatusForBeneficialOwner(EUR, FR, GB, '');
            expect(result.isCodiceFiscaleNeeded).toBe(false);
        });
    });
});
