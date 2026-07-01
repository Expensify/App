import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletCreditCardAccountParams = {
    policyID: string;
    creditCardAccountID: RilletAccount['id'];
};

export default UpdateRilletCreditCardAccountParams;
