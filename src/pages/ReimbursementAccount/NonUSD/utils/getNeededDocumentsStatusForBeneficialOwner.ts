import CONST from '@src/CONST';

type NeededDocumentsStatusForBeneficialOwner = {
    isProofOfOwnershipNeeded: boolean;
    isCopyOfIDNeeded: boolean;
    isProofOfAddressNeeded: boolean;
    isCodiceFiscaleNeeded: boolean;
};

function getNeededDocumentsStatusForBeneficialOwner(workspaceCurrency: string, accountCountry: string, beneficialOwnerNationality: string): NeededDocumentsStatusForBeneficialOwner {
    const isCopyOfIDNeeded = workspaceCurrency === CONST.CURRENCY.GBP && beneficialOwnerNationality !== CONST.COUNTRY.GB;

    return {
        isProofOfOwnershipNeeded:
            workspaceCurrency === CONST.CURRENCY.EUR ||
            workspaceCurrency === CONST.CURRENCY.AUD ||
            workspaceCurrency === CONST.CURRENCY.CAD ||
            (workspaceCurrency === CONST.CURRENCY.GBP && beneficialOwnerNationality !== CONST.COUNTRY.GB),
        isCopyOfIDNeeded,
        isProofOfAddressNeeded: workspaceCurrency === CONST.CURRENCY.EUR || isCopyOfIDNeeded,
        isCodiceFiscaleNeeded: accountCountry === CONST.COUNTRY.IT,
    };
}

export default getNeededDocumentsStatusForBeneficialOwner;
