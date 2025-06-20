import CONST from '@src/CONST';

type NeededDocumentsStatusForBeneficialOwner = {
    isProofOfDirectorsNeeded: boolean;
    isCopyOfIDNeeded: boolean;
    isAddressProofNeeded: boolean;
    isCodiceFiscaleNeeded: boolean;
    isPRDAndFSGNeeded: boolean;
};

function getNeededDocumentsStatusForSignerInfo(workspaceCurrency: string, accountCountry: string): NeededDocumentsStatusForBeneficialOwner {
    return {
        isProofOfDirectorsNeeded: accountCountry === CONST.COUNTRY.CA || accountCountry === CONST.COUNTRY.AU,
        isCopyOfIDNeeded: workspaceCurrency === CONST.CURRENCY.EUR || workspaceCurrency === CONST.CURRENCY.GBP || accountCountry === CONST.COUNTRY.AU,
        isAddressProofNeeded: workspaceCurrency === CONST.CURRENCY.EUR || accountCountry === CONST.COUNTRY.GB || accountCountry === CONST.COUNTRY.AU,
        isCodiceFiscaleNeeded: accountCountry === CONST.COUNTRY.IT,
        isPRDAndFSGNeeded: accountCountry === CONST.COUNTRY.AU,
    };
}

export default getNeededDocumentsStatusForSignerInfo;
