import CONST from '@src/CONST';

type NeededDocumentsStatusForBeneficialOwner = {
    isProofOfDirecorsNeeded: boolean;
    isCopyOfIDNeeded: boolean;
    isAddressProofNeeded: boolean;
    isCodiceFiscaleNeeded: boolean;
    isPRDandFSGNeeded: boolean;
};

function getNeededDocumentsStatusForSignerInfo(workspaceCurrency: string, accountCountry: string): NeededDocumentsStatusForBeneficialOwner {
    return {
        isProofOfDirecorsNeeded: accountCountry === CONST.COUNTRY.CA || accountCountry === CONST.COUNTRY.AU,
        isCopyOfIDNeeded: workspaceCurrency === CONST.CURRENCY.EUR || workspaceCurrency === CONST.CURRENCY.GBP || accountCountry === CONST.COUNTRY.AU,
        isAddressProofNeeded: workspaceCurrency === CONST.CURRENCY.EUR || accountCountry === CONST.COUNTRY.GB || accountCountry === CONST.COUNTRY.AU,
        isCodiceFiscaleNeeded: accountCountry === CONST.COUNTRY.IT,
        isPRDandFSGNeeded: accountCountry === CONST.COUNTRY.AU,
    };
}

export default getNeededDocumentsStatusForSignerInfo;
