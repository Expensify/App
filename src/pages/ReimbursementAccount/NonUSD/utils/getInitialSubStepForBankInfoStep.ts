import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {CorpayFields} from '@src/types/onyx';
import type {SubStepValues} from './getBankInfoStepValues';

/**
 * Returns the initial subStep for the Bank info step based on already existing data
 */
function getInitialSubStepForBusinessInfoStep(data: SubStepValues<keyof ReimbursementAccountForm>, corpayFields: CorpayFields | undefined): number {
    const bankAccountDetailsFields = corpayFields?.formFields?.filter((field) => !field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));
    const accountHolderDetailsFields = corpayFields?.formFields?.filter((field) => field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));
    const hasAnyMissingBankAccountDetails = bankAccountDetailsFields?.some((field) => data?.[field.id as keyof ReimbursementAccountForm] === '');
    const hasAnyMissingAccountHolderDetails = accountHolderDetailsFields?.some((field) => data?.[field.id as keyof ReimbursementAccountForm] === '');

    if (corpayFields === undefined || hasAnyMissingBankAccountDetails) {
        return 0;
    }

    if (hasAnyMissingAccountHolderDetails) {
        return 1;
    }

    return 2;
}

export default getInitialSubStepForBusinessInfoStep;
