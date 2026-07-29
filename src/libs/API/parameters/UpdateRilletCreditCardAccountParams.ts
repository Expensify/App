import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletCreditCardAccountParams = {
    policyID: string;
    creditCardAccountCode: RilletAccount['code'];
};

export default UpdateRilletCreditCardAccountParams;
