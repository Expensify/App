import type {BusinessCentralSync} from '@src/types/onyx/Policy';

type UpdateBusinessCentralReimbursementBankAccountParams = {
    policyID: string;
    reimbursementBankAccountID: BusinessCentralSync['reimbursementBankAccountID'];
};

export default UpdateBusinessCentralReimbursementBankAccountParams;
