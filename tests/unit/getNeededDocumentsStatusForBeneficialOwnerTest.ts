import CONST from '../../src/CONST';
import getNeededDocumentsStatusForBeneficialOwner from '../../src/pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner';

describe('getNeededDocumentsStatusForBeneficialOwner', () => {
    describe('GBP / GB bank account', () => {
        it('requires no documents when the beneficial owner resides in GB', () => {
            // Given a GBP account and a beneficial owner whose residential address is in GB
            // When computing the needed documents (nationality is irrelevant here)
            const result = getNeededDocumentsStatusForBeneficialOwner(CONST.CURRENCY.GBP, CONST.COUNTRY.GB, CONST.COUNTRY.US, CONST.COUNTRY.GB);
            // Then no documents are required, matching Auth's GB-resident skip
            expect(result).toEqual({
                isProofOfOwnershipNeeded: false,
                isCopyOfIDNeeded: false,
                isProofOfAddressNeeded: false,
                isCodiceFiscaleNeeded: false,
            });
        });

        it('requires the full document set when the beneficial owner resides outside GB', () => {
            // Given a GBP account and a beneficial owner residing in the US (regardless of GB nationality)
            // When computing the needed documents
            const result = getNeededDocumentsStatusForBeneficialOwner(CONST.CURRENCY.GBP, CONST.COUNTRY.GB, CONST.COUNTRY.GB, CONST.COUNTRY.US);
            // Then proof of ownership, copy of ID and proof of address are all required
            expect(result).toEqual({
                isProofOfOwnershipNeeded: true,
                isCopyOfIDNeeded: true,
                isProofOfAddressNeeded: true,
                isCodiceFiscaleNeeded: false,
            });
        });
    });

    describe('EUR bank account', () => {
        it('always requires proof of ownership and proof of address regardless of residential country', () => {
            // Given a EUR account and a beneficial owner residing in the same EU country
            // When computing the needed documents
            const result = getNeededDocumentsStatusForBeneficialOwner(CONST.CURRENCY.EUR, 'DE', 'DE', 'DE');
            // Then proof of ownership and proof of address are required, but copy of ID is not
            expect(result).toEqual({
                isProofOfOwnershipNeeded: true,
                isCopyOfIDNeeded: false,
                isProofOfAddressNeeded: true,
                isCodiceFiscaleNeeded: false,
            });
        });
    });

    describe('AUD / CAD bank accounts', () => {
        it.each([CONST.CURRENCY.AUD, CONST.CURRENCY.CAD])('requires only proof of ownership for %s', (currency) => {
            // Given an AUD or CAD account
            // When computing the needed documents
            const result = getNeededDocumentsStatusForBeneficialOwner(currency, CONST.COUNTRY.AU, CONST.COUNTRY.AU, CONST.COUNTRY.AU);
            // Then only proof of ownership is required
            expect(result).toEqual({
                isProofOfOwnershipNeeded: true,
                isCopyOfIDNeeded: false,
                isProofOfAddressNeeded: false,
                isCodiceFiscaleNeeded: false,
            });
        });
    });

    describe('Italian bank account', () => {
        it('requires the codice fiscale tax ID document', () => {
            // Given an Italian (IT) account
            // When computing the needed documents
            const result = getNeededDocumentsStatusForBeneficialOwner(CONST.CURRENCY.EUR, CONST.COUNTRY.IT, CONST.COUNTRY.IT, CONST.COUNTRY.IT);
            // Then the codice fiscale document is required
            expect(result.isCodiceFiscaleNeeded).toBe(true);
        });
    });
});
