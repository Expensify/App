import type {ReimbursementAccountForm} from '@src/types/form';
import type {CorpayFields} from '@src/types/onyx';

function getInputKeysForBankInfoStep(corpayFields: CorpayFields | undefined): Record<string, keyof ReimbursementAccountForm> {
    const keys: Record<string, keyof ReimbursementAccountForm> = {};
    // eslint-disable-next-line unicorn/no-array-for-each
    corpayFields?.formFields?.forEach((field) => {
        keys[field.id] = field.id as keyof ReimbursementAccountForm;
    });
    return keys;
}

export default getInputKeysForBankInfoStep;
