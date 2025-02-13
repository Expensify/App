import CONST from '@src/CONST';

type NeededDocumentsStatusForBeneficialOwner = {
    isProofOfDirecorsNeeded: boolean;
    isCopyOfIDNeeded: boolean;
    isAddressProofNeeded: boolean;
    isCodiceFiscaleNeeded: boolean;
    isPRDandFSGNeeded: boolean;
};

function getNeededDocumentsStatusForSignerInfo(workspaceCurrency: string, accountCountry: string): NeededDocumentsStatusForBeneficialOwner {
    console.log(accountCountry, accountCountry === CONST.COUNTRY.CA || accountCountry === CONST.COUNTRY.AU);
    return {
        isProofOfDirecorsNeeded: accountCountry === CONST.COUNTRY.CA || accountCountry === CONST.COUNTRY.AU,
        isCopyOfIDNeeded: workspaceCurrency === CONST.CURRENCY.EUR || accountCountry === CONST.COUNTRY.AU,
        isAddressProofNeeded: workspaceCurrency === CONST.CURRENCY.EUR || accountCountry === CONST.COUNTRY.GB || accountCountry === CONST.COUNTRY.AU,
        isCodiceFiscaleNeeded: accountCountry === CONST.COUNTRY.IT,
        isPRDandFSGNeeded: accountCountry === CONST.COUNTRY.IT,
    };
}

export default getNeededDocumentsStatusForSignerInfo;
