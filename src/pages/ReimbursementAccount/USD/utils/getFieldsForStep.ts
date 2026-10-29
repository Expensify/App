import CONST from '@src/CONST';
import type {InputID} from '@src/types/form/ReimbursementAccountForm';
import type {BankAccountStep as TBankAccountStep} from '@src/types/onyx/ReimbursementAccount';

/**
 * Returns selected bank account fields based on field names provided.
 */
function getFieldsForStep(step: TBankAccountStep): InputID[] {
    switch (step) {
        case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            return ['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings'];
        case CONST.BANK_ACCOUNT.STEP.COMPANY:
            return [
                'companyName',
                'addressStreet',
                'addressZipCode',
                'addressCity',
                'addressState',
                'companyPhone',
                'website',
                'companyTaxID',
                'incorporationType',
                'incorporationDate',
                'incorporationState',
            ];
        case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
            return ['firstName', 'lastName', 'dob', 'ssnLast4', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState', 'requestorAddressZipCode'];
        default:
            return [];
    }
}

export default getFieldsForStep;
