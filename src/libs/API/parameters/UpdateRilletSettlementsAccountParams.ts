import type {RilletBankAccount} from '@src/types/onyx/Policy';

type UpdateRilletSettlementsAccountParams = {
    policyID: string;
    settlementsBankAccountID: RilletBankAccount['id'];
};

export default UpdateRilletSettlementsAccountParams;
