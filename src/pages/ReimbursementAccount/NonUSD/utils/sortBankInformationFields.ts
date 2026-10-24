import CONST from '@src/CONST';
import type {CorpayFormField} from '@src/types/onyx';

/**
 * Reorders the bank information fields (bank name, address, city, etc.) to match CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS,
 * so that Bank address comes before Bank city regardless of the order returned by the API.
 * The sorted fields are placed back into the slots those fields held, so every other field keeps its original position.
 */
function sortBankInformationFields(fields: CorpayFormField[]): CorpayFormField[] {
    const bankInformationFieldsOrder = CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS;
    const sortedBankInformationFields = fields
        .filter((field) => bankInformationFieldsOrder.includes(field.id))
        .sort((a, b) => bankInformationFieldsOrder.indexOf(a.id) - bankInformationFieldsOrder.indexOf(b.id));

    let bankInformationFieldIndex = 0;
    return fields.map((field) => {
        if (!bankInformationFieldsOrder.includes(field.id)) {
            return field;
        }
        const sortedField = sortedBankInformationFields.at(bankInformationFieldIndex) ?? field;
        bankInformationFieldIndex++;
        return sortedField;
    });
}

export default sortBankInformationFields;
