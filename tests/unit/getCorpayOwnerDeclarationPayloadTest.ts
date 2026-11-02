import getCorpayOwnerDeclarationPayload from '@pages/ReimbursementAccount/NonUSD/utils/getCorpayOwnerDeclarationPayload';

describe('Corpay AU owner declarations', () => {
    test('keeps negative answers as booleans rather than dropping them', () => {
        // Given both owner declarations were answered No in the form.
        // When preparing the owner-step request.
        const payload = getCorpayOwnerDeclarationPayload('false', 'false', 'previous details');
        // Then both fields remain explicit false and stale PEP details are excluded.
        expect(payload).toEqual({anyBeneficialOwnersHoldUSCitizenship: false, politicallyExposedPerson: false});
    });

    test('sends the required PEP disclosure on an affirmative answer', () => {
        // Given the owner declared a PEP with the individual's name, role and tenure.
        // When preparing the owner-step request for Auth.
        const payload = getCorpayOwnerDeclarationPayload('true', 'true', 'Jane Smith, mayor, January 2020 to December 2022');
        // Then the true booleans and the complete disclosure are sent together.
        expect(payload).toEqual({
            anyBeneficialOwnersHoldUSCitizenship: true,
            politicallyExposedPerson: true,
            nameTitlePositionHeld: 'Jane Smith, mayor, January 2020 to December 2022',
        });
    });

    test('preserves server-saved boolean answers when the user submits without editing them', () => {
        // Given a resumed application whose server values are already booleans, not strings.
        // When the owner re-confirms those answers without changing any input.
        const payload = getCorpayOwnerDeclarationPayload(true, true, 'Jane Smith, mayor, January 2020 to December 2022');
        // Then neither true answer is silently converted to false by the serialization layer.
        expect(payload.politicallyExposedPerson).toBe(true);
        expect(payload.anyBeneficialOwnersHoldUSCitizenship).toBe(true);
    });
});
