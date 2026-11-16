import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {CorpayFormField} from '@src/types/onyx';

/**
 * Swaps the Bank address and Bank city fields when the API returns the city first,
 * so picking an address can't overwrite a city the user already typed. Every other field keeps its original position.
 */
function putBankAddressBeforeBankCity(fields: CorpayFormField[]): CorpayFormField[] {
    const bankCityIndex = fields.findIndex((field) => field.id === INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_CITY);
    const bankAddressIndex = fields.findIndex((field) => field.id === INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_ADDRESS_LINE_1);
    const bankCityField = fields.at(bankCityIndex);
    const bankAddressField = fields.at(bankAddressIndex);

    if (bankCityIndex === -1 || bankAddressIndex === -1 || bankAddressIndex < bankCityIndex || !bankCityField || !bankAddressField) {
        return fields;
    }

    const reorderedFields = [...fields];
    reorderedFields[bankCityIndex] = bankAddressField;
    reorderedFields[bankAddressIndex] = bankCityField;
    return reorderedFields;
}

export default putBankAddressBeforeBankCity;
