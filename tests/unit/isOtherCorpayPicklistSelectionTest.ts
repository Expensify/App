import isOtherCorpayPicklistSelection from '@pages/ReimbursementAccount/NonUSD/utils/isOtherCorpayPicklistSelection';

describe('Corpay other picklist selection', () => {
    test('uses the distinct option identifiers required by Auth for legal structure and source of funds', () => {
        // Given Auth requires Other for legal structures and Others for source of funds.
        // When deciding whether to request each explanation.
        const otherLegalStructure = isOtherCorpayPicklistSelection('Other', 'APPLICANT_TYPE');
        const otherSourceOfFunds = isOtherCorpayPicklistSelection('Others', 'SOURCE_OF_FUNDS');
        // Then both fields show their conditional explanation.
        expect(otherLegalStructure).toBe(true);
        expect(otherSourceOfFunds).toBe(true);
    });

    test('does not accept the wrong identifier for an Other answer', () => {
        // Given an option that belongs to the other picklist.
        // When checking both selection fields against their own contracts.
        const legalStructure = isOtherCorpayPicklistSelection('Others', 'APPLICANT_TYPE');
        const sourceOfFunds = isOtherCorpayPicklistSelection('Other', 'SOURCE_OF_FUNDS');
        // Then neither field asks for the wrong explanation.
        expect(legalStructure).toBe(false);
        expect(sourceOfFunds).toBe(false);
    });
});
