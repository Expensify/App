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
    beneficialOwnerResidentialCountry: string,
): NeededDocumentsStatusForBeneficialOwner {
    const isNonGBResidentOnGBAccount = workspaceCurrency === CONST.CURRENCY.GBP && beneficialOwnerResidentialCountry !== CONST.COUNTRY.GB;
    const isCopyOfIDNeeded = isNonGBResidentOnGBAccount;

    return {
        isProofOfOwnershipNeeded:
            workspaceCurrency === CONST.CURRENCY.EUR || workspaceCurrency === CONST.CURRENCY.AUD || workspaceCurrency === CONST.CURRENCY.CAD || isNonGBResidentOnGBAccount,
        isCopyOfIDNeeded,
        isProofOfAddressNeeded: workspaceCurrency === CONST.CURRENCY.EUR || isCopyOfIDNeeded,
        isCodiceFiscaleNeeded: accountCountry === CONST.COUNTRY.IT,
    };
}

export default getNeededDocumentsStatusForBeneficialOwner;
