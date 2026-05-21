import CONST from '@src/CONST';

type NeededDocumentsStatusForBeneficialOwner = {
    isProofOfOwnershipNeeded: boolean;
    isCopyOfIDNeeded: boolean;
    isProofOfAddressNeeded: boolean;
    isCodiceFiscaleNeeded: boolean;
};

function getNeededDocumentsStatusForBeneficialOwner(
    workspaceCurrency: string,
    accountCountry: string,
    beneficialOwnerNationality: string,
    beneficialOwnerAddressCountry: string,
): NeededDocumentsStatusForBeneficialOwner {
    const isCopyOfIDNeeded = workspaceCurrency === CONST.CURRENCY.GBP && beneficialOwnerNationality !== CONST.COUNTRY.GB;
    // Guard against empty strings: if either country is unknown we cannot determine a mismatch, so we default to no requirement.
    const isAddressCountryMismatch = !!beneficialOwnerAddressCountry && !!accountCountry && beneficialOwnerAddressCountry !== accountCountry;

    return {
        isProofOfOwnershipNeeded:
            workspaceCurrency === CONST.CURRENCY.EUR ||
            workspaceCurrency === CONST.CURRENCY.AUD ||
            workspaceCurrency === CONST.CURRENCY.CAD ||
            (workspaceCurrency === CONST.CURRENCY.GBP && beneficialOwnerNationality !== CONST.COUNTRY.GB),
        isCopyOfIDNeeded,
        isProofOfAddressNeeded: workspaceCurrency === CONST.CURRENCY.EUR || isCopyOfIDNeeded || isAddressCountryMismatch,
        isCodiceFiscaleNeeded: accountCountry === CONST.COUNTRY.IT,
    };
}

export default getNeededDocumentsStatusForBeneficialOwner;
