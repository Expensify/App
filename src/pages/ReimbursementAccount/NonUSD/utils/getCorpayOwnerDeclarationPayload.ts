/** Converts persisted owner declarations to the boolean and conditional string fields expected by Auth. */
function getCorpayOwnerDeclarationPayload(hasUSCitizenship: string | boolean | undefined, isPoliticallyExposed: string | boolean | undefined, pepDetails: string | undefined) {
    const politicallyExposedPerson = isPoliticallyExposed === true || isPoliticallyExposed === 'true';
    return {
        anyBeneficialOwnersHoldUSCitizenship: hasUSCitizenship === true || hasUSCitizenship === 'true',
        politicallyExposedPerson,
        ...(politicallyExposedPerson && {nameTitlePositionHeld: pepDetails}),
    };
}

export default getCorpayOwnerDeclarationPayload;
