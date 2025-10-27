import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {CorpayFields, CorpayFormField} from '@src/types/onyx';
import SafeString from '@src/utils/SafeString';
import type {SubStepValues} from './getBankInfoStepValues';

/**
 * Returns the initial subStep for the Bank info step based on already existing data
 */
function getInitialSubStepForBusinessInfoStep(data: SubStepValues<keyof ReimbursementAccountForm>, corpayFields: CorpayFields | undefined): number {
    if (!corpayFields?.formFields) {
        return 0;
    }

    const isFieldInvalidOrMissing = (field: CorpayFormField): boolean => {
        const fieldID = field.id as keyof ReimbursementAccountForm;
        const value = data?.[fieldID];

        if (value === '' || value === null || value === undefined) {
            return true;
        }

        if (field.validationRules && field.validationRules.length > 0) {
            const strValue = SafeString(value);
            return field.validationRules.some((rule) => {
                if (!rule.regEx) {
                    return false;
                }

                const regex = new RegExp(rule.regEx);
                return !regex.test(strValue);
            });
        }

        return false;
    };

    const bankAccountDetailsFields = corpayFields.formFields.filter((field) => !field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));
    const accountHolderDetailsFields = corpayFields.formFields.filter((field) => field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));

    const hasInvalidBankAccountDetails = bankAccountDetailsFields.some(isFieldInvalidOrMissing);
    const hasInvalidAccountHolderDetails = accountHolderDetailsFields.some(isFieldInvalidOrMissing);

    if (hasInvalidBankAccountDetails) {
        return 0;
    }

    if (hasInvalidAccountHolderDetails) {
        return 1;
    }

    return 2;
}

export default getInitialSubStepForBusinessInfoStep;
