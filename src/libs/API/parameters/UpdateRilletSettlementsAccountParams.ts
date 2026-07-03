import type {RilletBankAccount} from '@src/types/onyx/Policy';

type UpdateRilletSettlementsAccountParams = {
    policyID: string;
    bankAccountID: RilletBankAccount['id'];
};

export default UpdateRilletSettlementsAccountParams;
